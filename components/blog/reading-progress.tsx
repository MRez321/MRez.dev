"use client";

import { useEffect, useState } from "react";

/** Thin gradient bar tracking vertical scroll progress, pinned under the site nav. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        setProgress(total > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / total) * 100)) : 0);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-16 z-40 h-0.5 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary via-sky-400 to-violet-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
