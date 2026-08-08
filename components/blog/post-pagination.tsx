import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostWithMeta } from "@/features/blog/api/queries";
import { cn } from "@/lib/utils";

function PostLink({
  post,
  direction,
}: {
  post: PostWithMeta;
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex min-w-0 flex-col gap-1 rounded-xl border bg-card p-4 transition-colors hover:border-ring",
        !isPrev && "text-right"
      )}
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {isPrev ? <ArrowLeft className="size-3.5" /> : null}
        {isPrev ? "Previous post" : "Next post"}
        {!isPrev ? <ArrowRight className="size-3.5" /> : null}
      </span>
      <span className="truncate font-medium group-hover:text-primary">{post.title}</span>
    </Link>
  );
}

export function PostPagination({
  prev,
  next,
}: {
  prev: PostWithMeta | null;
  next: PostWithMeta | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {prev ? <PostLink post={prev} direction="prev" /> : <span />}
      {next ? <PostLink post={next} direction="next" /> : <span />}
    </div>
  );
}
