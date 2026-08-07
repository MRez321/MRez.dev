import { Search } from "lucide-react";
import { getPublicPosts, getTagsWithCounts } from "@/features/blog/api/queries";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BlogSearchForm } from "@/components/blog/search-form";

export const metadata = {
  title: "Blog",
  description: "Notes on engineering, Next.js, TypeScript, and the projects I build.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[]; q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const tagSlug = typeof params.tag === "string" ? params.tag : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;
  const page = typeof params.page === "string" ? Number.parseInt(params.page, 10) || 1 : 1;

  const [{ posts, total, pageCount, page: currentPage }, tags] = await Promise.all([
    getPublicPosts({ tagSlug, q, page }),
    getTagsWithCounts(),
  ]);

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
      <div className="mb-8 flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Notes on engineering, Next.js, TypeScript, and the projects I build.
        </p>
        <BlogSearchForm initialQ={q} />
      </div>

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
