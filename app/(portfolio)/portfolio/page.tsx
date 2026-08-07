import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Palette,
  Server,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getGitHubData } from "@/features/github/api/repos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/portfolio/project-card";
import { GitHubIcon } from "@/components/auth/social-icons";

export const metadata = {
  title: "Portfolio — MRez",
  description:
    "Mohammadreza Mousavi — full-stack developer building Laravel packages and modern web apps.",
};

const SKILLS = [
  {
    Icon: Server,
    title: "Backend & APIs",
    description:
      "PHP, Laravel packages, service-to-service transport, REST APIs and database design.",
  },
  {
    Icon: Wrench,
    title: "Full-stack web",
    description:
      "TypeScript, Next.js and React — from auth to caching, end to end.",
  },
  {
    Icon: Palette,
    title: "UI engineering",
    description:
      "Tailwind CSS, shadcn/ui and design systems that stay consistent in light and dark.",
  },
  {
    Icon: Sparkles,
    title: "Tooling & DX",
    description:
      "Docker, Redis caching, CI pipelines and developer experience that keeps shipping fast.",
  },
];

const SOCIALS = [
  { href: "https://github.com/mrezdev", label: "GitHub", Icon: GitHubIcon },
  { href: "mailto:mrez321@gmail.com", label: "Email", Icon: Mail },
];

export default async function PortfolioPage() {
  const data = await getGitHubData();
  const featured = data
    ? [...data.repos]
        .sort(
          (a, b) =>
            new Date(b.pushedAt ?? 0).getTime() -
            new Date(a.pushedAt ?? 0).getTime()
        )
        .slice(0, 4)
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col items-start gap-6">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/30 text-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Open to opportunities
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Mohammadreza{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-foreground bg-clip-text text-transparent">
              Mousavi
            </span>
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">
            Full-stack developer building Laravel packages and modern web
            apps — writing code that ships, stays boring where it should, and
            scales when it must.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/github">
                View projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/apps">Browse mini apps</Link>
            </Button>
            <div className="flex items-center gap-1">
              {SOCIALS.map(({ href, label, Icon }) => (
                <Button key={label} asChild variant="ghost" size="icon">
                  <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-12">
        <h2 className="text-2xl font-bold tracking-tight">What I do</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-ring/60"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Selected work */}
      {featured.length > 0 && (
        <section className="py-12">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Selected work</h2>
            <Link
              href="/github"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View all on GitHub
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((repo) => (
              <ProjectCard key={repo.id} repo={repo} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-14 text-center">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"
            aria-hidden
          />
          <h2 className="relative text-3xl font-bold tracking-tight">
            Have an idea? Let&apos;s build it.
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
            Open to freelance work and interesting collaborations.
          </p>
          <div className="relative mt-6 flex justify-center gap-3">
            <Button asChild>
              <a href="mailto:mrez321@gmail.com">
                <Mail className="mr-2 h-4 w-4" />
                Get in touch
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
