import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { post } from "@/lib/schema";
import { eq } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3200";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.query.post.findMany({
    where: eq(post.status, "published"),
    columns: { slug: true, publishedAt: true, updatedAt: true },
  });

  const staticRoutes = ["", "/portfolio", "/blog", "/github", "/apps", "/search"].map(
    (path) => ({
      url: `${APP_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  return [
    ...staticRoutes,
    ...posts.map((p) => ({
      url: `${APP_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
