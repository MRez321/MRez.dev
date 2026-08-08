import Link from "next/link";
import { CalendarDays, Clock, Eye } from "lucide-react";
import type { PostWithMeta } from "@/features/blog/api/queries";
import { readingTimeMinutes } from "@/features/blog/lib/reading";
import { formatCount, timeAgo } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const COVER_GRADIENTS = [
  "from-sky-500 via-blue-500 to-indigo-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-rose-500 via-pink-500 to-amber-500",
  "from-cyan-500 via-sky-500 to-violet-500",
] as const;

/** Deterministic gradient per post so cover-less cards stay visually distinct. */
function gradientFor(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length];
}

export function PostCard({ post }: { post: PostWithMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-lg hover:shadow-primary/5"
    >
      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div
          aria-hidden
          className={`h-40 w-full bg-gradient-to-br ${gradientFor(post.slug)}`}
        />
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Badge key={t.tagId} variant="secondary" className="text-[10px]">
              {t.name}
            </Badge>
          ))}
        </div>

        <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">
          {post.title}
        </h3>

        {post.excerpt ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar size="sm">
              {post.authorImage ? (
                <AvatarImage src={post.authorImage} alt={post.authorName} />
              ) : null}
              <AvatarFallback>{initials(post.authorName)}</AvatarFallback>
            </Avatar>
            <span className="truncate font-medium text-foreground">{post.authorName}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingTimeMinutes(post.content)} min
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {post.publishedAt ? timeAgo(post.publishedAt.toISOString()) : "draft"}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatCount(post.views)}
          </span>
        </div>
      </div>
    </Link>
  );
}
