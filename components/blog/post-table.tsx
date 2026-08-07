"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Eye, Pencil, Rocket, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deletePost, publishPostNow } from "@/features/blog/api/actions";
import { formatCount, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TablePost = {
  id: string;
  slug: string;
  title: string;
  status: string;
  views: number;
  featured: boolean;
  publishedAt: string | null;
  scheduledFor: string | null;
  updatedAt: string;
  authorName?: string;
  tags: { name: string }[];
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-muted text-muted-foreground",
};

function RowActions({ post }: { post: TablePost }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Action failed");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {error && <span className="text-xs text-destructive">{error}</span>}
      {post.status !== "published" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => run(() => publishPostNow(post.id))}
          disabled={isPending}
          title="Publish now"
        >
          <Rocket className="h-4 w-4" />
        </Button>
      )}
      <Button size="sm" variant="ghost" asChild>
        <Link href={`/dashboard/blog/${post.id}`} title="Edit">
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        onClick={() => {
          if (window.confirm(`Delete “${post.title}”? This cannot be undone.`)) {
            run(() => deletePost(post.id));
          }
        }}
        disabled={isPending}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function PostTable({
  posts,
  showAuthor = false,
  emptyMessage = "No posts yet.",
}: {
  posts: TablePost[];
  showAuthor?: boolean;
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">Post</th>
            {showAuthor && <th className="px-4 py-3 font-medium">Author</th>}
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Views
              </span>
            </th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b last:border-0 hover:bg-muted/40">
              <td className="max-w-[280px] px-4 py-3">
                <Link
                  href={`/blog/${post.slug}`}
                  className="block truncate font-medium hover:text-primary"
                >
                  {post.title}
                </Link>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {post.tags.map((t) => (
                    <span
                      key={t.name}
                      className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {t.name}
                    </span>
                  ))}
                  {post.featured && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      featured
                    </span>
                  )}
                </div>
              </td>
              {showAuthor && (
                <td className="px-4 py-3 text-muted-foreground">{post.authorName}</td>
              )}
              <td className="px-4 py-3">
                <Badge className={cn("font-medium capitalize", STATUS_STYLES[post.status] ?? "")}>
                  {post.status}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {post.status === "scheduled" && post.scheduledFor ? (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {new Date(post.scheduledFor).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ) : post.publishedAt ? (
                  timeAgo(post.publishedAt)
                ) : (
                  <span className="text-muted-foreground/60">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatCount(post.views)}</td>
              <td className="px-4 py-3">
                <RowActions post={post} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
