"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Globe } from "lucide-react";
import { ADMIN_NAV } from "@/features/admin/nav";
import { can, type Role } from "@/features/auth/permissions";
import { cn } from "@/lib/utils";

/**
 * Admin navigation, generated from ADMIN_NAV and filtered by the caller's
 * role — a nav entry whose permission the user lacks is never rendered.
 * The route group layout guarantees this only renders for admins.
 */
export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => can(role, item.permission));

  return (
    <div className="mb-8 flex items-center gap-3 overflow-x-auto">
      <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Globe className="size-4" />
          View site
        </a>
      </div>
    </div>
  );
}
