import type { ComponentProps } from "react";
import Link from "next/link";
import { slugify } from "@/features/blog/lib/slug";

/**
 * Presentational MDX component map — safe for both the server renderer and
 * the client-side editor preview (no server-only APIs).
 */
const heading = (
  level: 2 | 3 | 4,
  props: ComponentProps<"h2"> & { id?: string }
) => {
  const { children, ...rest } = props;
  const id = rest.id ?? (typeof children === "string" ? slugify(children) : undefined);
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} {...rest} className="group scroll-mt-24">
      {id ? (
        <a
          href={`#${id}`}
          className="no-underline opacity-0 transition-opacity group-hover:opacity-60"
          aria-label={`Link to ${typeof children === "string" ? children : "section"}`}
        >
          #
        </a>
      ) : null}{" "}
      {children}
    </Tag>
  );
};

function CodeBlock({ className, children, ...rest }: ComponentProps<"code">) {
  const match = /language-(\w+)/.exec(className ?? "");
  const lang = match?.[1] ? (
    <span className="float-right font-sans text-xs uppercase tracking-wider opacity-50">
      {match[1]}
    </span>
  ) : null;
  return (
    <code {...rest} className={className}>
      {lang}
      {children}
    </code>
  );
}

export const MDX_COMPONENTS = {
  h2: (props: ComponentProps<"h2">) => heading(2, props),
  h3: (props: ComponentProps<"h3">) => heading(3, props),
  h4: (props: ComponentProps<"h4">) => heading(4, props),
  a: ({ href = "", ...props }: ComponentProps<"a">) => {
    const internal = href.startsWith("/") || href.startsWith("#");
    if (internal) return <Link href={href} {...props} />;
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
  },
  code: CodeBlock,
  img: (props: ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} className="rounded-lg border" />
  ),
};

export type MdxComponents = typeof MDX_COMPONENTS;
