"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleUserBan, updateUserRole } from "@/features/auth/api/admin";
import { ROLE_LABELS, ROLES, type Role } from "@/features/auth/permissions";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  createdAt: Date;
  providers: string[];
  postCount: number;
};

function providerLabel(providerId: string) {
  if (providerId === "credential") return "Password";
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

export function UsersTable({ users }: { users: AdminUserRow[] }) {
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
    <div className="overflow-x-auto rounded-xl border bg-card">
      {error && (
        <div className="border-b border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Sign-in</th>
            <th className="px-4 py-3 font-medium">Posts</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 text-right font-medium">Moderate</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
                    <AvatarFallback>{initials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="truncate">{u.name}</span>
                      {u.banned && <Badge variant="destructive">banned</Badge>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <select
                  value={u.role}
                  onChange={(e) => run(() => updateUserRole(u.id, e.target.value))}
                  disabled={isPending}
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  aria-label={`Role for ${u.name}`}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role as Role]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {u.providers.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px]">
                      {providerLabel(p)}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{u.postCount}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {u.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant={u.banned ? "outline" : "destructive"}
                  onClick={() => run(() => toggleUserBan(u.id, !u.banned))}
                  disabled={isPending}
                >
                  {u.banned ? (
                    <>
                      <ShieldCheck className="mr-1.5 h-4 w-4" />
                      Unban
                    </>
                  ) : (
                    <>
                      <Ban className="mr-1.5 h-4 w-4" />
                      Ban
                    </>
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
