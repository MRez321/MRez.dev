import { getPublishedPostsForFeed } from "@/features/blog/api/queries";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3200";

export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 2.0 feed of published posts. */
export async function GET() {
  const posts = await getPublishedPostsForFeed();

  const items = posts
    .map((post) => {
      const url = `${APP_URL}/blog/${post.slug}`;
      const pubDate = post.publishedAt?.toUTCString() ?? post.createdAt.toUTCString();
      const description = escapeXml(post.excerpt ?? post.title);
      return `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${description}</description>
  </item>`;
    })
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MRez Blog</title>
    <link>${APP_URL}</link>
    <description>Notes on engineering, Next.js, TypeScript, and the projects I build.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${APP_URL}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
