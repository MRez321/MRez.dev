"use client";

import { useEffect, useState } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { MDX_COMPONENTS } from "./mdx-components";

/**
 * Client-side MDX preview for the editor. Compiles in the browser (debounced)
 * with the same component map, GFM support, heading anchors, and syntax
 * highlighting the server renderer uses — so the preview matches the published
 * article pixel for pixel.
 */
export function MdxPreview({ source }: { source: string }) {
  const [error, setError] = useState<string | null>(null);
  const [Content, setContent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (!source.trim()) {
      setContent(null);
      setError(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { default: Compiled } = await evaluate(source, {
          ...runtime,
          useMDXComponents: () => MDX_COMPONENTS,
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, rehypeHighlight],
          development: false,
        });
        if (!cancelled) {
          setContent(() => Compiled);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setContent(null);
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 font-mono text-xs leading-relaxed text-destructive">
        {error}
      </div>
    );
  }

  if (!Content) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 text-center">
        <PenLine className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Preview updates as you type…
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-slate max-w-none dark:prose-invert",
        "prose-headings:scroll-mt-24 prose-pre:rounded-xl prose-pre:border",
        "prose-a:font-medium prose-code:before:content-none prose-code:after:content-none"
      )}
    >
      <Content />
    </div>
  );
}
