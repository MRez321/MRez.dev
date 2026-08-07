"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { post, postTag, tag } from "@/lib/schema";
import { requireAuthor, requirePermission } from "@/features/auth/api/guards";
import { can, roleOf } from "@/features/auth/permissions";
import { slugify } from "../lib/slug";
import { getPostById } from "./queries";

const STATUSES = ["draft", "published", "scheduled", "archived"] as const;

/** Unique slug: append -2, -3... while a post with that slug exists. */
async function uniqueSlug(base: string, excludeId?: string) {
  const stem = slugify(base) || "untitled";
  let candidate = stem;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.query.post.findFirst({
      where: eq(post.slug, candidate),
      columns: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${stem}-${n}`;
    n += 1;
  }
}

const postInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and dashes"
    ),
  excerpt: z.string().trim().max(500).optional().nullable(),
  content: z.string().max(2_000_000).default(""),
  coverImage: z.string().trim().max(500).optional().nullable(),
  status: z.enum(STATUSES),
  scheduledFor: z.preprocess(
    (v) => (typeof v === "string" && v ? new Date(v) : undefined),
    z.date().optional().nullable()
  ),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).default([]),
  featured: z.boolean().default(false),
});

export type PostInput = z.infer<typeof postInputSchema>;

export type ActionResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

/** Resolve tag names to rows, creating missing tags. */
async function resolveTags(names: string[]) {
  const rows: { tagId: string }[] = [];
  for (const name of names) {
    const tagSlug = slugify(name);
    if (!tagSlug) continue;
    let existing = await db.query.tag.findFirst({
      where: eq(tag.slug, tagSlug),
      columns: { id: true },
    });
    if (!existing) {
      const id = crypto.randomUUID();
      await db.insert(tag).values({ id, name: name.slice(0, 30), slug: tagSlug });
      existing = { id };
    }
    rows.push({ tagId: existing.id });
  }
  return rows;
}

/** Replace a post's tag rows with the resolved set. */
async function syncTags(postId: string, names: string[]) {
  await db.delete(postTag).where(eq(postTag.postId, postId));
  const rows = await resolveTags(names);
  if (rows.length) await db.insert(postTag).values(rows.map((r) => ({ postId, ...r })));
}

/** Publish/status semantics shared by create and update. */
function applyStatus(
  input: PostInput,
  current: { publishedAt: Date | null } | null
) {
  const now = new Date();
  if (input.status === "published") {
    return {
      status: "published" as const,
      publishedAt: current?.publishedAt ?? now,
      scheduledFor: null,
    };
  }
  if (input.status === "scheduled") {
    if (!input.scheduledFor) {
      throw new Error("Scheduled posts need a publish date.");
    }
    // Past date -> publish immediately.
    if (input.scheduledFor.getTime() <= now.getTime()) {
      return {
        status: "published" as const,
        publishedAt: now,
        scheduledFor: null,
      };
    }
    return {
      status: "scheduled" as const,
      publishedAt: null,
      scheduledFor: input.scheduledFor,
    };
  }
  // draft / archived keep whatever publish state existed
  return {
    status: input.status,
    publishedAt: current?.publishedAt ?? null,
    scheduledFor: null,
  };
}

function revalidateBlogPaths(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/dashboard/blog");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/analytics");
}

export async function createPost(raw: unknown): Promise<ActionResult> {
  const user = await requireAuthor();
  const input = postInputSchema.parse(raw);
  const slug = await uniqueSlug(input.slug);

  const now = new Date();
  const id = crypto.randomUUID();
  const status = applyStatus(input, null);

  await db.insert(post).values({
    id,
    slug,
    title: input.title,
    excerpt: input.excerpt ?? null,
    content: input.content,
    coverImage: input.coverImage || null,
    status: status.status,
    featured: input.featured,
    publishedAt: status.publishedAt,
    scheduledFor: status.scheduledFor,
    createdAt: now,
    updatedAt: now,
    authorId: user.id,
  });
  await syncTags(id, input.tags);

  revalidateBlogPaths(slug);
  return { ok: true, id, slug };
}

export async function updatePost(id: string, raw: unknown): Promise<ActionResult> {
  const user = await requirePermission("post:edit:own");
  const existing = await getPostById(id);
  if (!existing) return { ok: false, error: "Post not found." };
  if (existing.authorId !== user.id && !can(roleOf(user.role), "post:manage")) {
    return { ok: false, error: "You can only edit your own posts." };
  }

  const input = postInputSchema.parse(raw);
  if (input.slug !== existing.slug) {
    const slug = await uniqueSlug(input.slug, id);
    input.slug = slug;
  }
  const status = applyStatus(input, existing);

  await db
    .update(post)
    .set({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt ?? null,
      content: input.content,
      coverImage: input.coverImage || null,
      status: status.status,
      featured: input.featured,
      publishedAt: status.publishedAt,
      scheduledFor: status.scheduledFor,
      updatedAt: new Date(),
    })
    .where(eq(post.id, id));
  await syncTags(id, input.tags);

  revalidateBlogPaths(input.slug);
  if (input.slug !== existing.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }
  return { ok: true, id, slug: input.slug };
}

/** Publish a draft/scheduled/archived post immediately (author or admin). */
export async function publishPostNow(id: string): Promise<ActionResult> {
  const user = await requirePermission("post:publish");
  const existing = await getPostById(id);
  if (!existing) return { ok: false, error: "Post not found." };
  if (existing.authorId !== user.id && !can(roleOf(user.role), "post:manage")) {
    return { ok: false, error: "You can only publish your own posts." };
  }

  await db
    .update(post)
    .set({
      status: "published",
      publishedAt: existing.publishedAt ?? new Date(),
      scheduledFor: null,
      updatedAt: new Date(),
    })
    .where(eq(post.id, id));

  revalidateBlogPaths(existing.slug);
  return { ok: true, id, slug: existing.slug };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const user = await requirePermission("post:delete");
  const existing = await getPostById(id);
  if (!existing) return { ok: false, error: "Post not found." };
  if (existing.authorId !== user.id && !can(roleOf(user.role), "post:manage")) {
    return { ok: false, error: "You can only delete your own posts." };
  }

  await db.delete(post).where(eq(post.id, id));
  revalidateBlogPaths(existing.slug);
  return { ok: true, id, slug: existing.slug };
}

/** Public view counter — called from a client effect, not a permission gate. */
export async function incrementPostViews(slug: string): Promise<void> {
  await db
    .update(post)
    .set({ views: sql`${post.views} + 1` })
    .where(eq(post.slug, slug));
  revalidatePath(`/blog/${slug}`);
}
