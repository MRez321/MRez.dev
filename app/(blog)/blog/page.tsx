import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Eye, Search, Star } from "lucide-react";
import { getBlogStats, getFeaturedPosts, getPublicPosts, getTagsWithCounts } from "@/features/blog/api/queries";
import { readingTimeMinutes } from "@/features/blog/lib/reading";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/format";
import { BlogSearchForm } from "@/components/blog/search-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata = {
  title: "Blog",
  description: "Notes on engineering, Next.js, TypeScript, and the projects I build.",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[]; q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const tagSlug = typeof params.tag === "string" ? params.tag : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;
  const page = typeof params.page === "string" ? Number.parseInt(params.page, 10) || 1 : 1;

  const isHomeListing = page === 1 && !tagSlug && !q;

  const [{ posts, total, pageCount, page: currentPage }, tags, stats, featured] = await Promise.all([
    getPublicPosts({ tagSlug, q, page }),
    getTagsWithCounts(),
    getBlogStats(),
    isHomeListing ? getFeaturedPosts(1) : Promise.resolve([]),
  ]);
  const spotlight = featured[0] ?? null;

  function withParam(name: string, value?: string) {
    const next = new URLSearchParams();
    if (tagSlug && name !== "tag") next.set("tag", tagSlug);
    if (q && name !== "q") next.set("q", q);
    if (value) next.set(name, value);
    const qs = next.toString();
    return qs ? `?${qs}` : "/blog";
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-sky-500/10 to-violet-500/10 p-8 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            MRez Blog
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Notes on building for the web
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Engineering, Next.js, TypeScript, and the projects I build — written for my future
            self, useful for you.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-background/60 px-3 py-1">
              <Star className="mr-1.5 size-3.5 text-amber-500" />
              {stats.published} {stats.published === 1 ? "post" : "posts"}
            </Badge>
            <Badge variant="outline" className="bg-background/60 px-3 py-1">
              <Eye className="mr-1.5 size-3.5 text-sky-500" />
              {formatCount(stats.views)} views
            </Badge>
          </div>

          <div className="mt-6 max-w-md">
            <BlogSearchForm initialQ={q} />
          </div>
        </div>
      </section>

      {/* Featured spotlight */}
      {spotlight ? (
        <Link
          href={`/blog/${spotlight.slug}`}
          className="group mb-10 grid overflow-hidden rounded-2xl border bg-card transition-all hover:border-ring/60 hover:shadow-lg hover:shadow-primary/5 sm:grid-cols-2"
        >
          <div className="relative">
            {spotlight.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={spotlight.coverImage}
                alt=""
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-full"
              />
            ) : (
              <div aria-hidden className="h-48 w-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 sm:h-full" />
            )}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-sm">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              Featured
            </span>
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
            <div className="flex flex-wrap gap-1.5">
              {spotlight.tags.map((t) => (
                <Badge key={t.tagId} variant="secondary">
                  {t.name}
                </Badge>
              ))}
            </div>
            <h2 className="text-2xl font-bold leading-tight group-hover:text-primary">
              {spotlight.title}
            </h2>
            {spotlight.excerpt ? (
              <p className="line-clamp-3 text-sm text-muted-foreground">{spotlight.excerpt}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Avatar size="sm">
                  {spotlight.authorImage ? (
                    <AvatarImage src={spotlight.authorImage} alt={spotlight.authorName} />
                  ) : null}
                  <AvatarFallback>{initials(spotlight.authorName)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{spotlight.authorName}</span>
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {spotlight.publishedAt
                  ? spotlight.publishedAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : null}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {readingTimeMinutes(spotlight.content)} min
              </span>
              <span className="ml-auto inline-flex items-center gap-1 font-medium text-primary">
                Read
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>
      ) : null}

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <a
            href={withParam("tag")}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              !tagSlug
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:border-ring"
            )}
          >
            All
          </a>
          {tags.map((t) => (
            <a
              key={t.id}
              href={withParam("tag", t.slug)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                tagSlug === t.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-ring"
              )}
            >
              {t.name}
              <span className="ml-1 text-xs opacity-60">{t.count}</span>
            </a>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No posts found</p>
          <p className="text-sm text-muted-foreground">
            {q ? `Nothing matches “${q}”.` : "Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-10 flex items-center justify-between">
          {currentPage > 1 ? (
            <Button variant="outline" asChild>
              <a href={withParam("page", String(currentPage - 1))}>Previous</a>
            </Button>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {pageCount} · {total} {total === 1 ? "post" : "posts"}
          </span>
          {currentPage < pageCount ? (
            <Button variant="outline" asChild>
              <a href={withParam("page", String(currentPage + 1))}>Next</a>
            </Button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
