import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  MousePointerClick,
  PenSquare,
  UserRound,
} from "lucide-react";
import { getAnalytics } from "@/features/blog/api/queries";
import { getGA4Summary } from "@/features/analytics/api/ga4";
import { getPlausibleSummary } from "@/features/analytics/api/plausible";
import {
  getTrafficStats,
  TRAFFIC_RANGE_DAYS,
} from "@/features/analytics/api/queries";
import { TrafficChart } from "@/components/dashboard/traffic-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCount, timeAgo } from "@/lib/format";

export const metadata = { title: "Admin · Analytics" };
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [traffic, plausible, ga4, a] = await Promise.all([
    getTrafficStats(),
    getPlausibleSummary(),
    getGA4Summary(),
    getAnalytics(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Site traffic from the first-party tracker, plus content health.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold tracking-tight">Traffic</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={`Pageviews (${TRAFFIC_RANGE_DAYS}d)`}
            value={formatCount(traffic.pageviews)}
            Icon={Eye}
            tone="sky"
          />
          <StatCard
            label="Unique visitors"
            value={formatCount(traffic.visitors)}
            Icon={UserRound}
            tone="violet"
          />
          <StatCard
            label="Events"
            value={formatCount(traffic.events)}
            Icon={MousePointerClick}
            tone="amber"
          />
          <StatCard
            label="Pageviews today"
            value={formatCount(traffic.todayPageviews)}
            Icon={BarChart3}
            tone="emerald"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pageviews — last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            {traffic.daily.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No traffic recorded yet. Pageviews start flowing as soon as the
                site is visited.
              </p>
            ) : (
              <TrafficChart daily={traffic.daily} />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top pages</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {traffic.topPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pageviews yet.</p>
              ) : (
                traffic.topPages.map((p) => (
                  <div
                    key={p.path}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm"
                  >
                    <Link
                      href={p.path}
                      className="truncate font-medium hover:underline"
                    >
                      {p.path}
                    </Link>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      {formatCount(p.views)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top referrers</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {traffic.topReferrers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No external referrers yet — direct visits only.
                </p>
              ) : (
                traffic.topReferrers.map((r) => (
                  <div
                    key={r.referrer}
                    className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">{r.referrer}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      {formatCount(r.views)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custom events</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {traffic.eventBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No custom events yet — signups, searches, theme toggles and app
                launches land here.
              </p>
            ) : (
              traffic.eventBreakdown.map((e) => (
                <div
                  key={e.name}
                  className="flex items-center justify-between rounded-md px-2 py-2 text-sm"
                >
                  <span className="font-medium">{e.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCount(e.count)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Third-party sources
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plausible</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {plausible ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Visitors" value={formatCount(plausible.visitors)} />
                    <Stat label="Pageviews" value={formatCount(plausible.pageviews)} />
                    <Stat
                      label="Bounce"
                      value={plausible.bounceRate != null ? `${plausible.bounceRate.toFixed(1)}%` : "—"}
                    />
                    <Stat
                      label="Duration"
                      value={
                        plausible.visitDuration != null
                          ? `${Math.floor(plausible.visitDuration / 60)}m ${Math.round(plausible.visitDuration % 60)}s`
                          : "—"
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 border-t pt-3">
                    {plausible.topPages.map((p) => (
                      <div
                        key={p.page}
                        className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm"
                      >
                        <span className="truncate font-medium">{p.page}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatCount(p.pageviews)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <ConfigureNotice
                  label="Plausible"
                  vars={["PLAUSIBLE_API_KEY", "PLAUSIBLE_SITE_ID"]}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Google Analytics 4</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {ga4 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Stat label="Users" value={formatCount(ga4.users)} />
                    <Stat label="Sessions" value={formatCount(ga4.sessions)} />
                    <Stat label="Pageviews" value={formatCount(ga4.pageviews)} />
                  </div>
                  <div className="flex flex-col gap-1 border-t pt-3">
                    {ga4.topPages.map((p) => (
                      <div
                        key={p.page}
                        className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm"
                      >
                        <span className="truncate font-medium">{p.page}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatCount(p.views)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <ConfigureNotice
                  label="GA4"
                  vars={["GA4_PROPERTY_ID", "GA4_CLIENT_EMAIL", "GA4_PRIVATE_KEY"]}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold tracking-tight">Content health</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total posts" value={a.totalPosts} Icon={FileText} tone="sky" />
          <StatCard label="Published" value={a.published} Icon={BarChart3} tone="emerald" />
          <StatCard label="Scheduled" value={a.scheduled} Icon={CalendarClock} tone="violet" />
          <StatCard label="Drafts" value={a.drafts} Icon={PenSquare} tone="amber" />
          <StatCard label="Blog views" value={formatCount(a.totalViews)} Icon={Eye} tone="rose" />
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
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xl font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function ConfigureNotice({ label, vars }: { label: string; vars: string[] }) {
  return (
    <p className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <ExternalLink className="h-4 w-4" />
        {label} not configured
      </span>
      Set {vars.join(", ")} in your environment to pull stats from the API.
    </p>
  );
}
