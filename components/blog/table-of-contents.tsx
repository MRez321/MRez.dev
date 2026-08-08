"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocHeading } from "@/features/blog/lib/reading";

/**
 * Scroll-spied outline for the article. Rendered twice on the post page —
 * inside a mobile <details> and as the sticky desktop aside — both instances
 * observe the same heading ids, so each tracks its own active state.
 */
export function TableOfContents({ headings, card = false }: { headings: TocHeading[]; card?: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px" }
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className={cn(card && "rounded-xl border bg-card p-4")}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className={cn("space-y-1", card && "text-sm")}>
        {headings.map((h) => (
          <li key={h.id} className={cn(h.level === 3 && "pl-4")}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block border-l-2 py-0.5 pl-2 text-sm leading-snug transition-colors",
                activeId === h.id
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
