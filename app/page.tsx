import Link from "next/link";
import { ArrowRight, FileText, FolderGit2, Wrench } from "lucide-react";
import { getPublicPosts } from "@/features/blog/api/queries";
import { PostCard } from "@/components/blog/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/auth/social-icons";

export const metadata = {
  title: "MRez — Reza Mousavi",
  description:
    "Reza Mousavi — full-stack developer building Laravel packages and modern web apps. Blog notes, mini tools, and open-source projects.",
};

const SECTIONS = [
  {
    href: "/portfolio",
    label: "Portfolio",
    Icon: FolderGit2,
    description: "Who I am, what I build, and the stack I ship with.",
  },
  {
    href: "/blog",
    label: "Blog",
    Icon: FileText,
    description: "Notes on engineering, Next.js, TypeScript, and the projects I build.",
  },
  {
    href: "/apps",
    label: "Mini apps",
    Icon: Wrench,
    description: "Small, focused tools that do one thing well — no signup.",
  },
];

export default async function Home() {
  const { posts } = await getPublicPosts({ page: 1 });

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
            Reza Mousavi
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Full-stack developer,{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-foreground bg-clip-text text-transparent">
              building on the web
            </span>
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">
            Laravel packages, Next.js apps, and notes on engineering — code that
            ships, stays boring where it should, and scales when it must.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/portfolio">
                View portfolio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a
                href="https://github.com/mrezdev"
                target="_blank"
                rel="noreferrer"
              >
                <GitHubIcon className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map(({ href, label, Icon, description }) => (
          <Link key={href} href={href} className="group">
            <div className="flex h-full flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-ring/60">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="font-semibold group-hover:text-primary">{label}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Recent posts */}
      {posts.length > 0 && (
        <section className="py-12">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Latest posts</h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
