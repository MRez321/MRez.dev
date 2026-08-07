import Link from "next/link";
import { requireUser, getUserAccounts } from "@/features/auth/api/queries";
import { can, roleOf, ROLE_LABELS } from "@/features/auth/permissions";
import { getMyPosts } from "@/features/blog/api/queries";
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

const QUICK_LINKS = [
  { href: "/dashboard/profile", label: "Profile", Icon: UserRound, hint: "Manage your account" },
  { href: "/dashboard/billing", label: "Billing", Icon: CreditCard, hint: "Plans and payments" },
  { href: "/dashboard/api-keys", label: "API Keys", Icon: KeyRound, hint: "Manage credentials" },
  { href: "/dashboard/favorites", label: "Favorites", Icon: Star, hint: "Saved items" },
];

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
  const isAuthor = can(roleOf(user.role), "post:create");
  const isAdmin = can(roleOf(user.role), "admin:access");
  const myPosts = isAuthor ? await getMyPosts(user.id) : [];

  const published = myPosts.filter((p) => p.status === "published").length;
  const drafts = myPosts.filter((p) => p.status === "draft").length;
  const totalViews = myPosts.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
            <Badge variant="outline">{ROLE_LABELS[roleOf(user.role)]}</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your account.
          </p>
        </div>
        {isAuthor && (
          <Link
            href="/dashboard/blog/new"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New post
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <Avatar size="lg">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
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

        <div className="grid gap-6 md:col-span-2 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Member since
              </CardDescription>
              <CardTitle className="text-lg">
                {user.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <MailCheck className="h-4 w-4" />
                Email verified
              </CardDescription>
              <CardTitle className="text-lg">
                {user.emailVerified ? "Yes" : "No"}
              </CardTitle>
            </CardHeader>
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
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/dashboard/blog" className="group">
            <Card className="h-full transition-colors group-hover:border-ring">
              <CardHeader>
                <CardDescription>Published</CardDescription>
                <CardTitle className="text-2xl">{published}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
          <Card className="h-full">
            <CardHeader>
              <CardDescription>Drafts</CardDescription>
              <CardTitle className="text-2xl">{drafts}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <CardDescription>Total views</CardDescription>
              <CardTitle className="text-2xl">{totalViews.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map(({ href, label, Icon, hint }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-colors group-hover:border-ring">
              <CardHeader>
                <Icon className="mb-2 h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{label}</CardTitle>
                <CardDescription>{hint}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {(isAuthor || isAdmin) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {isAuthor && (
            <Link href="/dashboard/blog" className="group">
              <Card className="h-full transition-colors group-hover:border-ring">
                <CardHeader>
                  <FilePenLine className="mb-2 h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">My posts</CardTitle>
                  <CardDescription>
                    {myPosts.length} {myPosts.length === 1 ? "post" : "posts"} · draft,
                    schedule, and publish
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="group">
              <Card className="h-full transition-colors group-hover:border-ring">
                <CardHeader>
                  <Shield className="mb-2 h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Admin panel</CardTitle>
                  <CardDescription>
                    Manage users, roles, and every post on the site
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
