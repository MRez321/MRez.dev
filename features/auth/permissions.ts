/**
 * Roles & permissions.
 *
 * Roles form a hierarchy: admin ⊃ author ⊃ user.
 * Every permission check goes through `can(role, permission)` so the policy
 * table lives in exactly one place.
 */

export const ROLES = ["user", "author", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  user: "User",
  author: "Author",
  admin: "Admin",
};

export const PERMISSIONS = [
  "post:create",
  "post:edit:own",
  "post:publish",
  "post:schedule",
  "post:delete",
  "post:manage", // edit/delete any post (admin only)
  "user:manage", // change roles, ban users (admin only)
  "admin:access", // enter /admin
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  user: [],
  author: ["post:create", "post:edit:own", "post:publish", "post:schedule"],
  admin: [...PERMISSIONS],
};

export function can(
  role: Role | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Safe conversion for untyped session/db strings: unknown -> "user". */
export function roleOf(role: string | null | undefined): Role {
  return isRole(role) ? role : "user";
}
