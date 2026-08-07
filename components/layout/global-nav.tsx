import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AuthButtons, UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { NavLinks, type NavLinkItem } from "./nav-links";

const PUBLIC_LINKS: NavLinkItem[] = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/apps", label: "Apps" },
  { href: "/docs", label: "Docs" },
];

export default async function GlobalNavigation() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const links = session
    ? [...PUBLIC_LINKS, { href: "/dashboard", label: "Dashboard" }]
    : PUBLIC_LINKS;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            MRez
          </Link>
          <NavLinks links={links} />
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <UserMenu initialUser={session.user} />
          ) : (
            <AuthButtons />
          )}
          <MobileNav links={links} isAuthed={Boolean(session)} />
        </div>
      </nav>
    </header>
  );
}
