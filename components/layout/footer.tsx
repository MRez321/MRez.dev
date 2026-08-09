import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Heart, Mail, Rss } from "lucide-react";
import { GitHubIcon } from "@/components/auth/social-icons";

const EXPLORE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/apps", label: "Apps" },
  { href: "/docs", label: "Docs" },
] as const;

const RESOURCE_LINKS = [
  { href: "/github", label: "GitHub Projects" },
  { href: "/search", label: "Search the Blog" },
  { href: "/docs/api", label: "API Reference" },
  { href: "/feed.xml", label: "RSS Feed" },
] as const;

const SOCIALS = [
  { href: "https://github.com/mrezdev", label: "GitHub", Icon: GitHubIcon },
  { href: "mailto:mrez321@gmail.com", label: "Email", Icon: Mail },
] as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
    </Link>
  );
}

export async function Footer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t bg-muted/30">
      {/* Hairline gradient seam so the footer reads as a deliberate close. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="text-xl font-bold tracking-tight">
              MRez
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Reza Mousavi — full-stack developer building Laravel packages,
              modern web apps and open-source tools.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ href, label, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Explore
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {EXPLORE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <FooterLink href={href} label={label} />
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Resources
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {RESOURCE_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <FooterLink href={href} label={label} />
                </li>
              ))}
            </ul>
          </nav>

          {/* Account */}
          <nav aria-label="Account">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Account
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {session ? (
                <>
                  <li>
                    <FooterLink href="/dashboard" label="Dashboard" />
                  </li>
                  <li>
                    <FooterLink href="/dashboard/profile" label="Profile" />
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <FooterLink href="/signin" label="Sign in" />
                  </li>
                  <li>
                    <FooterLink href="/signup" label="Create account" />
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {year} Reza Mousavi. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/feed.xml"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Rss className="h-3.5 w-3.5" aria-hidden />
              RSS
            </Link>
            <Link
              href="https://github.com/mrezdev"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <GitHubIcon className="h-3.5 w-3.5" aria-hidden />
              GitHub
            </Link>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              Built with
              <Heart className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden />
              Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
