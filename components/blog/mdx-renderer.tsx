import { MDXRemote } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import { MDX_COMPONENTS } from "./mdx-components";

/**
 * Server-side MDX renderer: GFM tables, heading anchors, syntax highlighting.
 * Used by the public post page and (via the same component map) the editor preview.
 */
export function MdxRenderer({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-slate max-w-none dark:prose-invert",
        "prose-headings:scroll-mt-24 prose-pre:rounded-xl prose-pre:border",
        "prose-a:font-medium prose-code:before:content-none prose-code:after:content-none",
        className
      )}
    >
      <MDXRemote
        source={source}
        components={MDX_COMPONENTS}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeHighlight],
          },
        }}
      />
    </div>
  );
}
