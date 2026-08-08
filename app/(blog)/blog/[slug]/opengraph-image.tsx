import { ImageResponse } from "next/og";
import { getPublishedPostBySlug } from "@/features/blog/api/queries";
import { OgShell } from "@/components/og/og-shell";

export const alt = "MRez blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Per-post share card: title, excerpt, author, publish date. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  // Fall back to the generic card instead of erroring on unknown slugs.
  return new ImageResponse(
    <OgShell
      eyebrow="MRez · Blog"
      title={post?.title ?? "MRez — code that ships."}
      subtitle={post?.excerpt ?? undefined}
      footerLeft={post ? `${post.authorName} · ${formatDate(post.publishedAt)}` : "MRez"}
      footerRight="mrez.dev"
    />,
    { ...size }
  );
}
