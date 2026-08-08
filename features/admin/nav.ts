import type { LucideIcon } from "lucide-react";
import { BarChart3, FileText, KeyRound, LayoutDashboard, Users } from "lucide-react";
import type { Permission } from "@/features/auth/permissions";

/**
 * Single source of truth for the admin navigation — the nav bar is generated
 * from this list, and every entry is permission-filtered before rendering.
 * Add a section here and it appears everywhere admin nav is shown.
 */
export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  Icon: LucideIcon;
  permission: Permission;
};

export const ADMIN_NAV: readonly AdminNavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    description: "Traffic & content snapshot",
    Icon: LayoutDashboard,
    permission: "admin:access",
  },
  {
    href: "/admin/posts",
    label: "Posts",
    description: "Edit, schedule, publish",
    Icon: FileText,
    permission: "post:manage",
  },
  {
    href: "/admin/users",
    label: "Users",
    description: "Roles & accounts",
    Icon: Users,
    permission: "user:manage",
  },
  {
    href: "/admin/api-keys",
    label: "API Keys",
    description: "All keys & usage",
    Icon: KeyRound,
    permission: "admin:access",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    description: "First-party + third-party stats",
    Icon: BarChart3,
    permission: "admin:access",
  },
];
