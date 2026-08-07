"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { can, type Role } from "@/features/auth/permissions";

function Section({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active =
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export function DashboardNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const canWrite = can(role, "post:create");
  const isAdmin = can(role, "admin:access");

  return (
    <nav className="mb-8 flex flex-wrap gap-1 border-b">
      <Section href="/dashboard" label="Overview" pathname={pathname} />
      <Section href="/dashboard/profile" label="Profile" pathname={pathname} />
      {canWrite && <Section href="/dashboard/blog" label="Blog" pathname={pathname} />}
      {isAdmin && <Section href="/admin" label="Admin" pathname={pathname} />}
      <Section href="/dashboard/billing" label="Billing" pathname={pathname} />
      <Section href="/dashboard/api-keys" label="API Keys" pathname={pathname} />
      <Section href="/dashboard/favorites" label="Favorites" pathname={pathname} />
    </nav>
  );
}
