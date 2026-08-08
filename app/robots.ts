import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3200";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private/technical routes — everything public stays crawlable.
        disallow: ["/admin/", "/dashboard/", "/api/", "/dev/", "/docs/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
