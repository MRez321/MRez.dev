import Link from "next/link";
import { requireUser, getUserAccounts } from "@/features/auth/api/queries";
import { can, roleOf, ROLE_LABELS } from "@/features/auth/permissions";
import { getMyPosts } from "@/features/blog/api/queries";
import { StatCard, statToneChip } from "@/components/dashboard/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  FilePenLine,
  KeyRound,
  MailCheck,
  Plus,
  Shield,
  Star,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/dashboard/profile", label: "Profile", Icon: UserRound, hint: "Manage your account", tone: "sky" },
  { href: "/dashboard/billing", label: "Billing", Icon: CreditCard, hint: "Plans and payments", tone: "violet" },
  { href: "/dashboard/api-keys", label: "API Keys", Icon: KeyRound, hint: "Manage credentials", tone: "amber" },
  { href: "/dashboard/favorites", label: "Favorites", Icon: Star, hint: "Saved items", tone: "rose" },
] as const;

function providerLabel(providerId: string) {
  if (providerId === "credential") return "Password";
  if (providerId === "google") return "Google";
  if (providerId === "github") return "GitHub";
  return providerId;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function DashboardPage() {
  const session = await requireUser();
  const user = session.user;
  const accounts = await getUserAccounts(user.id);
  const role = roleOf(user.role);
  const isAuthor = can(role, "post:create");
  const isAdmin = can(role, "admin:access");
  const myPosts = isAuthor ? await getMyPosts(user.id) : [];

  const published = myPosts.filter((p) => p.status === "published").length;
  const drafts = myPosts.filter((p) => p.status === "draft").length;
  const scheduled = myPosts.filter((p) => p.status === "scheduled").length;
  const totalViews = myPosts.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-sky-600 to-violet-600 p-8 text-white shadow-lg shadow-primary/10 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70">
              Dashboard
            </p>
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {user.name.split(" ")[0]}
              <Badge className="border-white/30 bg-white/15 text-white hover:bg-white/20">
                {ROLE_LABELS[role]}
              </Badge>
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Here&apos;s what&apos;s happening with your account.
            </p>
          </div>
          {isAuthor && (
            <Link
              href="/dashboard/blog/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-semibold text-primary shadow-sm transition-transform hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              New post
            </Link>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Account card */}
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <div className="rounded-full bg-gradient-to-br from-sky-500 via-primary to-violet-500 p-0.5">
              <Avatar size="lg" className="border-2 border-background">
                {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{user.name}</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {accounts.map((a) => (
                <Badge key={a.id} variant="secondary">
                  {providerLabel(a.providerId)}
                </Badge>
              ))}
            </div>
            <Link
              href="/dashboard/profile"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Edit profile
            </Link>
          </CardContent>
        </Card>

        {/* Account stats */}
        <div className="grid gap-6 md:col-span-2 md:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">Member since</CardTitle>
                <CardDescription>
                  {user.createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                  user.emailVerified
                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                <MailCheck className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">Email verified</CardTitle>
                <CardDescription>{user.emailVerified ? "Yes" : "No"}</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardDescription>Linked sign-in methods</CardDescription>
              <CardTitle className="text-lg">
                {accounts.length} {accounts.length === 1 ? "method" : "methods"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {accounts.map((a) => (
                <Badge key={a.id} variant="outline">
                  {providerLabel(a.providerId)}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {isAuthor && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/blog" className="group">
            <StatCard
              label="Published"
              value={published}
              Icon={FilePenLine}
              tone="emerald"
            />
          </Link>
          <StatCard label="Drafts" value={drafts} Icon={FilePenLine} tone="amber" />
          <StatCard label="Scheduled" value={scheduled} Icon={CalendarDays} tone="violet" />
          <StatCard
            label="Total views"
            value={totalViews.toLocaleString()}
            Icon={Star}
            tone="sky"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map(({ href, label, Icon, hint, tone }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-ring/60 group-hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    statToneChip(tone)
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {(isAuthor || isAdmin) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {isAuthor && (
            <Link href="/dashboard/blog" className="group">
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-ring/60 group-hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                    <FilePenLine className="size-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">My posts</CardTitle>
                    <CardDescription>
                      {myPosts.length} {myPosts.length === 1 ? "post" : "posts"} · draft,
                      schedule, and publish
                    </CardDescription>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                </CardContent>
              </Card>
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="group">
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-ring/60 group-hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <Shield className="size-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">Admin panel</CardTitle>
                    <CardDescription>
                      Manage users, roles, and every post on the site
                    </CardDescription>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
