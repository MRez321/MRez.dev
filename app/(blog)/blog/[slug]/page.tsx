import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Eye } from "lucide-react";
import type { PostWithMeta } from "@/features/blog/api/queries";
import { getAdjacentPosts, getPublishedPostBySlug } from "@/features/blog/api/queries";
import { extractHeadings, readingTimeMinutes } from "@/features/blog/lib/reading";
import { MdxRenderer } from "@/components/blog/mdx-renderer";
import { ViewCounter } from "@/components/blog/view-counter";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { PostShare } from "@/components/blog/post-share";
import { CodeCopy } from "@/components/blog/code-copy";
import { PostPagination } from "@/components/blog/post-pagination";
import { RelatedPosts } from "@/components/blog/related-posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCount, timeAgo } from "@/lib/format";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3200";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  // The file-based opengraph-image.tsx surfaces through parent.openGraph.images;
  // merge it so posts without a cover still get the generated share card.
  const parentImages = (await parent).openGraph?.images ?? [];
  const previousImages = Array.isArray(parentImages) ? parentImages : [parentImages];

  const url = `${APP_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImage ? [post.coverImage, ...previousImages] : previousImages,
      tags: post.tags.map((t) => t.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [post.coverImage, ...previousImages] : previousImages,
    },
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function jsonLd(post: PostWithMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.authorName },
    url: `${APP_URL}/blog/${post.slug}`,
    keywords: post.tags.map((t) => t.name).join(", "),
    mainEntityOfPage: `${APP_URL}/blog/${post.slug}`,
  };
}

function breadcrumbJsonLd(slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${APP_URL}/blog` },
      { "@type": "ListItem", position: 2, name: slug, item: `${APP_URL}/blog/${slug}` },
    ],
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const [{ prev, next }, headings] = await Promise.all([
    getAdjacentPosts(post.slug),
    Promise.resolve(extractHeadings(post.content)),
  ]);
  const minutes = readingTimeMinutes(post.content);
  const url = `${APP_URL}/blog/${post.slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(post.slug)) }}
      />

      <ReadingProgress />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>

        <div className="mt-8 xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-12">
          <article className="mx-auto w-full max-w-3xl">
            <header className="mb-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <Badge key={t.tagId} variant="secondary">
                    {t.name}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {post.title}
              </h1>
              {post.excerpt ? (
                <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Avatar size="sm">
                    {post.authorImage ? (
                      <AvatarImage src={post.authorImage} alt={post.authorName} />
                    ) : null}
                    <AvatarFallback>{initials(post.authorName)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{post.authorName}</span>
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {post.publishedAt
                    ? `${timeAgo(post.publishedAt.toISOString())} · ${post.publishedAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : "Unpublished"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {minutes} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatCount(post.views)} views
                </span>
              </div>
            </header>

            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt={post.title}
                className="mb-8 w-full rounded-xl border object-cover"
              />
            ) : null}

            {headings.length > 0 ? (
              <details className="mb-6 rounded-xl border bg-card xl:hidden">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                  On this page
                </summary>
                <div className="px-2 pb-3">
                  <TableOfContents headings={headings} />
                </div>
              </details>
            ) : null}

            <MdxRenderer source={post.content} />

            <PostShare url={url} title={post.title} className="mt-10" />

            <footer className="mt-12 flex items-center gap-4 rounded-xl border bg-card p-5">
              <Avatar size="lg">
                {post.authorImage ? (
                  <AvatarImage src={post.authorImage} alt={post.authorName} />
                ) : null}
                <AvatarFallback>{initials(post.authorName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Written by</p>
                <p className="font-semibold">{post.authorName}</p>
              </div>
            </footer>

            <ViewCounter slug={post.slug} />
          </article>

          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        </div>

        <div className="mx-auto mt-14 w-full max-w-3xl">
          <PostPagination prev={prev} next={next} />
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <RelatedPosts post={post} />
        </div>
      </div>

      <CodeCopy />
    </>
  );
}
