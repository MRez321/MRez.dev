import { ArrowUpRight, GitFork, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GitHubRepo } from "@/features/github/types";
import { formatCount, timeAgo } from "@/lib/format";
import { LanguageDot } from "./language-dot";

export function ProjectCard({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.htmlUrl}
      target="_blank"
      rel="noreferrer"
      className="group relative flex flex-col rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex min-w-0 items-center gap-2 font-semibold">
          <span className="truncate">{repo.name}</span>
          {repo.fork && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              fork
            </Badge>
          )}
        </h3>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
        {repo.description ?? "No description provided."}
      </p>

      {repo.topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-4 pt-4 text-muted-foreground">
        <LanguageDot language={repo.language} />
        <span className="flex items-center gap-1 text-xs">
          <Star className="h-3.5 w-3.5" />
          {formatCount(repo.stargazersCount)}
        </span>
        <span className="flex items-center gap-1 text-xs">
          <GitFork className="h-3.5 w-3.5" />
          {formatCount(repo.forksCount)}
        </span>
        <span className="ml-auto text-xs">{timeAgo(repo.pushedAt)}</span>
      </div>
    </a>
  );
}
