import Link from "next/link";
import { ExternalLink, MapPin, Users } from "lucide-react";
import { getGitHubData } from "@/features/github/api/repos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/portfolio/project-card";
import { GitHubIcon } from "@/components/auth/social-icons";

export const metadata = {
  title: "GitHub — MRez",
  description: "Open-source projects by Mohammadreza Mousavi (@mrezdev).",
};

export default async function GitHubPage() {
  const data = await getGitHubData();

  if (!data) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <GitHubIcon className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">
          Repositories unavailable
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Couldn&apos;t load GitHub data right now. Check back in a bit — the
          page retries automatically.
        </p>
      </main>
    );
  }

  const { profile, repos } = data;
  const initials = (profile.name ?? profile.login)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
      <section className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        <Avatar size="lg" className="h-24 w-24">
          <AvatarImage src={profile.avatarUrl} alt={profile.name ?? profile.login} />
          <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {profile.name ?? profile.login}
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              @{profile.login}
            </p>
          </div>

          {profile.bio && (
            <p className="max-w-xl text-sm text-muted-foreground">{profile.bio}</p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {profile.followers} followers
            </span>
            <span>{profile.publicRepos} public repos</span>
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            )}
            {profile.company && <span>{profile.company}</span>}
          </div>

          <Button asChild>
            <a href={profile.htmlUrl} target="_blank" rel="noreferrer">
              <GitHubIcon className="mr-2 h-4 w-4" />
              View GitHub profile
              <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70" />
            </a>
          </Button>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight">Projects</h2>
          <Badge variant="secondary">Redis-cached · 30 min refresh</Badge>
        </div>

        {repos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No public repositories yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <ProjectCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Want to collaborate?{" "}
        <Link href="/portfolio" className="underline-offset-4 hover:underline">
          Get in touch
        </Link>
      </p>
    </main>
  );
}
