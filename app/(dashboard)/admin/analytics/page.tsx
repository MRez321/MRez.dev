import Link from "next/link";
import { BarChart3, CalendarClock, Eye, FileText } from "lucide-react";
import { getAnalytics } from "@/features/blog/api/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCount, timeAgo } from "@/lib/format";

export const metadata = { title: "Admin · Analytics" };

export default async function AdminAnalyticsPage() {
  const a = await getAnalytics();

  const stats = [
    { label: "Total posts", value: a.totalPosts, Icon: FileText },
    { label: "Published", value: a.published, Icon: BarChart3 },
    { label: "Scheduled", value: a.scheduled, Icon: CalendarClock },
    { label: "Drafts", value: a.drafts, Icon: FileText },
    { label: "Total views", value: a.totalViews, Icon: Eye },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Content health across the blog.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, Icon }) => (
          <Card key={label}>
            <CardHeader>
              <Icon className="mb-2 h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-2xl">{formatCount(value)}</CardTitle>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top posts by views</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {a.topPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              a.topPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/50"
                >
                  <span className="truncate font-medium">{p.title}</span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    {formatCount(p.views)}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming scheduled posts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {a.recentScheduled.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing scheduled. Drafts with a publish date will appear here.
              </p>
            ) : (
              a.recentScheduled.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm"
                >
                  <span className="truncate font-medium">{p.title}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    {p.scheduledFor && (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {p.scheduledFor.toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {timeAgo(p.updatedAt.toISOString())} ago
                    </Badge>
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Authors</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {a.authors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No authors yet.</p>
          ) : (
            a.authors.map((author) => (
              <div
                key={author.id}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm"
              >
                <span className="font-medium">{author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {author.count} {author.count === 1 ? "post" : "posts"} ·{" "}
                  {formatCount(author.views)} views
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
