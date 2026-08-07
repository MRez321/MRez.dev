// Idempotent seed: promotes the owner account to admin, creates base tags,
// and publishes a welcome post so the blog isn't an empty shell.
// Run: npm run seed
import { db } from "../lib/db";
import { user, tag, post, postTag } from "../lib/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "mrez321@gmail.com";

const BASE_TAGS = [
  { name: "Engineering", slug: "engineering" },
  { name: "Next.js", slug: "nextjs" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Redis", slug: "redis" },
  { name: "Design", slug: "design" },
];

const WELCOME = {
  slug: "welcome-to-the-blog",
  title: "Welcome to the blog",
  excerpt:
    "A first post to prove out the writing stack: MDX, tags, syntax highlighting, and scheduled publishing.",
  content: `## Why a blog?

This site runs on **Next.js**, **Drizzle**, and **better-auth**. Posts are authored as
plain MDX in a live editor, stored in SQLite, and rendered server-side with full SEO.

## Code that looks good

\`\`\`ts
import { db } from "@/lib/db";
import { post } from "@/lib/schema";

export async function getLatestPost() {
  const [latest] = await db
    .select()
    .from(post)
    .orderBy(post.publishedAt)
    .limit(1);
  return latest;
}
\`\`\`

## Tables, lists, and links

| Feature | Status |
| --- | --- |
| MDX rendering | Live |
| Tag filtering | Live |
| Scheduled publishing | Live |
| Syntax highlighting | Live |

- Posts support **bold**, *italic*, \`inline code\`, and [external links](https://nextjs.org).
- Editors get a split-pane live preview while typing.

> Scheduling uses BullMQ on Upstash Redis — a worker sweeps every minute and
> publishes anything that is due.

*— the MRez engineering team*
`,
};

async function main() {
  // 1. Promote owner to admin (idempotent).
  const owner = await db.query.user.findFirst({
    where: eq(user.email, ADMIN_EMAIL),
  });
  if (!owner) {
    console.warn(`No user with email ${ADMIN_EMAIL} found; skipping admin seed.`);
  } else if (owner.role !== "admin") {
    await db.update(user).set({ role: "admin" }).where(eq(user.id, owner.id));
    console.log(`Promoted ${ADMIN_EMAIL} to admin.`);
  } else {
    console.log(`${ADMIN_EMAIL} is already admin.`);
  }

  // 2. Base tags.
  for (const t of BASE_TAGS) {
    const existing = await db.query.tag.findFirst({
      where: eq(tag.slug, t.slug),
    });
    if (!existing) {
      await db.insert(tag).values({ id: crypto.randomUUID(), ...t });
    }
  }
  console.log(`Tags ensured (${BASE_TAGS.length}).`);

  // 3. Welcome post (skip when it already exists).
  const existing = await db.query.post.findFirst({
    where: eq(post.slug, WELCOME.slug),
  });
  if (existing) {
    console.log("Welcome post already exists; skipping.");
    return;
  }
  if (!owner) return;

  const now = new Date();
  const postId = crypto.randomUUID();
  await db.insert(post).values({
    id: postId,
    slug: WELCOME.slug,
    title: WELCOME.title,
    excerpt: WELCOME.excerpt,
    content: WELCOME.content,
    status: "published",
    featured: true,
    views: 0,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    authorId: owner.id,
  });
  const tags = await db.select().from(tag).where(eq(tag.slug, "engineering"));
  if (tags[0]) {
    await db.insert(postTag).values({ postId, tagId: tags[0].id });
  }
  console.log(`Published welcome post (${WELCOME.slug}).`);
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
