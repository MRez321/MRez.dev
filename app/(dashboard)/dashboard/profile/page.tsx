import { requireUser, getUserAccounts } from "@/features/auth/api/queries";
import { signOutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";

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

export default async function ProfilePage() {
  const session = await requireUser();
  const user = session.user;
  const accounts = await getUserAccounts(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details and sign-in methods.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
          <CardDescription>
            Details used across MRez.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar size="lg">
            {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-semibold">{user.name}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={user.emailVerified ? "default" : "secondary"}>
                {user.emailVerified ? "Email verified" : "Email not verified"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Joined{" "}
                {user.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign-in methods</CardTitle>
          <CardDescription>
            Ways you can access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {accounts.map((a, index) => (
            <div key={a.id}>
              {index > 0 && <Separator className="my-3" />}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {providerLabel(a.providerId)}
                </span>
                <Badge variant="outline">Linked</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
