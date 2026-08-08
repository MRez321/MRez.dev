import Link from "next/link";
import { BookOpen, ExternalLink, FileText, FolderGit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Docs — MRez",
  description: "Documentation for MRez projects and mini apps.",
};

export default function DocsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          Documentation
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Docs</h1>
        <p className="max-w-xl text-muted-foreground">
          Guides live with their projects. Here&apos;s where to find what
          you&apos;re looking for.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href="https://github.com/mrezdev"
          target="_blank"
          rel="noreferrer"
          className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-ring/60"
        >
          <FolderGit2 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold group-hover:text-primary">
            GitHub projects
            <ExternalLink className="ml-1 inline h-3.5 w-3.5 text-muted-foreground" />
          </h2>
          <p className="text-sm text-muted-foreground">
            Repos, READMEs, and release notes for every open-source project.
          </p>
        </a>

        <Link
          href="/blog"
          className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-ring/60"
        >
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold group-hover:text-primary">Blog guides</h2>
          <p className="text-sm text-muted-foreground">
            Write-ups on Next.js, Laravel, and the engineering decisions behind
            this site.
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-dashed p-6">
        <h2 className="font-semibold">API documentation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The Image Optimizer API is live — server-side image optimization with
          API keys, rate limits, and monthly quotas.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/docs/api">Read the API docs</Link>
        </Button>
      </div>
    </main>
  );
}
