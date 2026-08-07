"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavLinkItem } from "./nav-links";

export function MobileNav({
  links,
  isAuthed,
}: {
  links: NavLinkItem[];
  isAuthed: boolean;
}) {
  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {links.map(({ href, label }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} className="cursor-pointer">
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {isAuthed ? (
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                Dashboard
              </Link>
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/signin" className="cursor-pointer">
                  Sign in
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/signup" className="cursor-pointer">
                  Sign up
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
