"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavLinkItem = {
  href: string;
  label: string;
};

export function NavLinks({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="hidden items-center gap-1 md:flex">
      {links.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
