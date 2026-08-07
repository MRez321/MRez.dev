"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/dashboard/favorites", label: "Favorites" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-1 border-b">
      {SECTIONS.map(({ href, label }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
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
      })}
    </nav>
  );
}
