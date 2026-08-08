import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { post } from "@/lib/schema";
import { eq } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3200";

// Reflect new posts immediately — the site is DB-backed, not static.
export const dynamic = "force-dynamic";

/** All crawlable public pages: static routes + published posts. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.query.post.findMany({
    where: eq(post.status, "published"),
    columns: { slug: true, coverImage: true, publishedAt: true, updatedAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/portfolio", priority: 0.9 },
    { path: "/blog", priority: 0.8 },
    { path: "/apps", priority: 0.7 },
    { path: "/github", priority: 0.6 },
  ].map(({ path, priority }) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${APP_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt ?? p.publishedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    images: p.coverImage ? [p.coverImage] : undefined,
  }));

  return [...staticRoutes, ...postRoutes];
}
