"use client";

import { useEffect } from "react";
import { incrementPostViews } from "@/features/blog/api/actions";
import { trackEvent } from "@/lib/analytics";

/**
 * Counts one view per browser session (sessionStorage guard), then fires the
 * server action from the client so SSR doesn't double-count.
 */
export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void incrementPostViews(slug);
    trackEvent("blog_view", { slug });
  }, [slug]);

  return null;
}
