import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Eye,
  FileText,
  PenSquare,
  UserRound,
} from "lucide-react";
import { getAnalytics } from "@/features/blog/api/queries";
import { getTrafficStats, TRAFFIC_RANGE_DAYS } from "@/features/analytics/api/queries";
import { getAllUsers } from "@/features/auth/api/queries";
import { ADMIN_NAV } from "@/features/admin/nav";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { roleOf, ROLE_LABELS, type Role } from "@/features/auth/permissions";
import { formatCount, timeAgo } from "@/lib/format";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const QUICK_ACTION_GRADIENTS = [
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleTone(role: Role) {
  if (role === "admin") return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
  if (role === "author") return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
  return "bg-muted text-muted-foreground";
}

export default async function AdminIndexPage() {
  const [traffic, a, users] = await Promise.all([
    getTrafficStats(),
    getAnalytics(),
    getAllUsers(),
  ]);
  const recentUsers = users.slice(-5).reverse();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of traffic, content, and accounts across MRez.
        </p>
      </div>

      <section className="flex flex-col gap-4">
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
            label="Pageviews today"
            value={formatCount(traffic.todayPageviews)}
            Icon={BarChart3}
            tone="emerald"
          />
          <StatCard
            label="Custom events"
            value={formatCount(traffic.events)}
            Icon={CalendarClock}
            tone="amber"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Content</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Published" value={a.published} Icon={FileText} tone="emerald" />
          <StatCard label="Scheduled" value={a.scheduled} Icon={CalendarClock} tone="violet" />
          <StatCard label="Drafts" value={a.drafts} Icon={PenSquare} tone="amber" />
          <StatCard label="Blog views" value={formatCount(a.totalViews)} Icon={Eye} tone="sky" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top posts</CardTitle>
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
            <CardTitle className="text-base">Newest users</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar size="sm">
                    {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
                    <AvatarFallback>{initials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {timeAgo(u.createdAt.toISOString())} ago · {u.postCount}{" "}
                      {u.postCount === 1 ? "post" : "posts"}
                    </p>
                  </div>
                  <Badge variant="outline" className={roleTone(roleOf(u.role))}>
                    {ROLE_LABELS[roleOf(u.role)]}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADMIN_NAV.map((item, i) => {
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-lg hover:shadow-primary/5"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white ${QUICK_ACTION_GRADIENTS[i % QUICK_ACTION_GRADIENTS.length]}`}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="flex items-center gap-1 font-semibold group-hover:text-primary">
                    {item.label}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
