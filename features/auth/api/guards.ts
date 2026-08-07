import { forbidden, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSession } from "./queries";
import { can, roleOf, type Permission } from "../permissions";

export type AuthedUser = typeof auth.$Infer.Session.user;

/**
 * Authorization guard: authenticated + holds `permission`.
 * - No session -> /signin (same as requireUser).
 * - Banned or missing permission -> 403 (app/forbidden.tsx).
 */
export async function requirePermission(permission: Permission): Promise<AuthedUser> {
  const session = await getSession();
  if (!session) {
    redirect("/signin");
  }
  if (session.user.banned || !can(roleOf(session.user.role), permission)) {
    forbidden();
  }
  return session.user;
}

export function requireAuthor() {
  return requirePermission("post:create");
}

export function requireAdmin() {
  return requirePermission("admin:access");
}

/** True when the current session's user holds `permission` (non-throwing). */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return !session.user.banned && can(roleOf(session.user.role), permission);
}
