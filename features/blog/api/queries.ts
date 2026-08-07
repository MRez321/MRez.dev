import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { post, postTag, tag, user } from "@/lib/schema";

export type PostRow = typeof post.$inferSelect;
export type TagRow = typeof tag.$inferSelect;

/** Post + author display info + resolved tag names (tagId kept for keying). */
export type PostWithMeta = PostRow & {
  authorName: string;
  authorImage: string | null;
  tags: { tagId: string; name: string; slug: string }[];
};

/** Shape of a post row as returned by the relational queries below. */
type RelationalPost = PostRow & {
  author: { name: string; image: string | null };
  tags: { tagId: string; tag: TagRow }[];
};

const POST_WITH_META = {
  with: {
    author: { columns: { name: true, image: true } },
    tags: { columns: { postId: false }, with: { tag: true } },
  },
} as const;

function toPostWithMeta(row: RelationalPost): PostWithMeta {
  return {
    ...row,
    authorName: row.author.name,
    authorImage: row.author.image,
    tags: row.tags.map((pt) => ({
      tagId: pt.tagId,
      name: pt.tag.name,
      slug: pt.tag.slug,
    })),
  };
}

export const PAGE_SIZE = 6;

export type PublicPostQuery = {
  tagSlug?: string;
  q?: string;
  page?: number;
};

/** Published posts for the public listing, newest first. */
export async function getPublicPosts(query: PublicPostQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const conditions = [eq(post.status, "published")];
  if (query.q) {
    const term = `%${query.q.trim()}%`;
    conditions.push(or(like(post.title, term), like(post.excerpt ?? "", term), like(post.content, term))!);
  }
  if (query.tagSlug) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${postTag} pt JOIN ${tag} t ON t.id = pt.tagId
        WHERE pt.postId = ${post.id} AND t.slug = ${query.tagSlug}
      )`
    );
  }

  const [rows, [{ value: total }]] = await Promise.all([
    db.query.post.findMany({
      ...POST_WITH_META,
      where: and(...conditions),
      orderBy: [desc(post.publishedAt), desc(post.createdAt)],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    db.select({ value: count() }).from(post).where(and(...conditions)),
  ]);

  return {
    posts: rows.map(toPostWithMeta),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** A published post by slug for the public reader (404 when missing). */
export async function getPublishedPostBySlug(slug: string) {
  const row = await db.query.post.findFirst({
    ...POST_WITH_META,
    where: and(eq(post.slug, slug), eq(post.status, "published")),
  });
  return row ? toPostWithMeta(row) : null;
}

/** Any post by id for the editor (any status; caller enforces permissions). */
export async function getPostById(id: string) {
  const row = await db.query.post.findFirst({
    ...POST_WITH_META,
    where: eq(post.id, id),
  });
  return row ? toPostWithMeta(row) : null;
}

export async function getTagsWithCounts() {
  const rows = await db
    .select({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: count(postTag.postId),
    })
    .from(tag)
    .leftJoin(postTag, eq(postTag.tagId, tag.id))
    .groupBy(tag.id)
    .orderBy(asc(tag.name));
  return rows;
}

export async function getMyPosts(userId: string) {
  const rows = await db.query.post.findMany({
    ...POST_WITH_META,
    where: eq(post.authorId, userId),
    orderBy: [desc(post.updatedAt)],
  });
  return rows.map(toPostWithMeta);
}

/** Admin: every post, any status. */
export async function getAllPosts() {
  const rows = await db.query.post.findMany({
    ...POST_WITH_META,
    orderBy: [desc(post.updatedAt)],
  });
  return rows.map(toPostWithMeta);
}

export type Analytics = {
  totalPosts: number;
  published: number;
  scheduled: number;
  drafts: number;
  totalViews: number;
  authors: { id: string; name: string; count: number; views: number }[];
  topPosts: PostWithMeta[];
  recentScheduled: PostWithMeta[];
};

export async function getAnalytics(): Promise<Analytics> {
  const [totalPosts, published, scheduled, drafts, totalViews, authors, topPosts, recentScheduled] =
    await Promise.all([
      db.select({ value: count() }).from(post),
      db.select({ value: count() }).from(post).where(eq(post.status, "published")),
      db.select({ value: count() }).from(post).where(eq(post.status, "scheduled")),
      db.select({ value: count() }).from(post).where(eq(post.status, "draft")),
      db.select({ value: sql<number>`COALESCE(SUM(${post.views}), 0)` }).from(post),
      db
        .select({
          id: user.id,
          name: user.name,
          count: count(post.id),
          views: sql<number>`COALESCE(SUM(${post.views}), 0)`,
        })
        .from(user)
        .leftJoin(post, eq(post.authorId, user.id))
        .groupBy(user.id)
        .orderBy(desc(sql`COALESCE(SUM(${post.views}), 0)`)),
      db.query.post.findMany({
        ...POST_WITH_META,
        orderBy: [desc(post.views)],
        limit: 5,
      }),
      db.query.post.findMany({
        ...POST_WITH_META,
        where: eq(post.status, "scheduled"),
        orderBy: [asc(post.scheduledFor)],
        limit: 10,
      }),
    ]);

  return {
    totalPosts: totalPosts[0].value,
    published: published[0].value,
    scheduled: scheduled[0].value,
    drafts: drafts[0].value,
    totalViews: totalViews[0].value,
    authors: authors.map((a) => ({ ...a, count: a.count ?? 0, views: a.views ?? 0 })),
    topPosts: topPosts.map(toPostWithMeta),
    recentScheduled: recentScheduled.map(toPostWithMeta),
  };
}
