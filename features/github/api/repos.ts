import { redis } from "@/lib/redis";
import type { GitHubData, GitHubProfile, GitHubRepo } from "../types";

const CACHE_KEY = "github:showcase:v1";
const CACHE_TTL_SECONDS = 60 * 30; // 30 minutes

const GITHUB_API = "https://api.github.com";

type RawRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  topics: string[];
  pushed_at: string | null;
  license: { spdx_id: string } | null;
};

type RawProfile = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  followers: number;
  public_repos: number;
};

function pickRepo(raw: RawRepo): GitHubRepo {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    htmlUrl: raw.html_url,
    description: raw.description,
    homepage: raw.homepage,
    language: raw.language,
    stargazersCount: raw.stargazers_count,
    forksCount: raw.forks_count,
    fork: raw.fork,
    topics: raw.topics,
    pushedAt: raw.pushed_at,
    license: raw.license?.spdx_id ?? null,
  };
}

function pickProfile(raw: RawProfile): GitHubProfile {
  return {
    login: raw.login,
    name: raw.name,
    avatarUrl: raw.avatar_url,
    bio: raw.bio,
    htmlUrl: raw.html_url,
    location: raw.location,
    company: raw.company,
    blog: raw.blog,
    followers: raw.followers,
    publicRepos: raw.public_repos,
  };
}

async function readCache(): Promise<GitHubData | null> {
  try {
    // @upstash/redis auto-deserializes JSON values, so `get` already
    // returns the parsed GitHubData — do NOT JSON.parse it again.
    return await redis.get<GitHubData>(CACHE_KEY);
  } catch {
    return null;
  }
}

async function writeCache(data: GitHubData) {
  try {
    await redis.set(CACHE_KEY, JSON.stringify(data), {
      ex: CACHE_TTL_SECONDS,
    });
  } catch {
    // Cache is best-effort; the page still works without it.
  }
}

/**
 * Fetches the GitHub profile + repos with a 30-minute Redis cache.
 *
 * Failure semantics:
 * - Redis down -> fetch fresh from GitHub (cache is best-effort).
 * - GitHub down -> serve stale cache when available, else null (page shows
 *   a friendly empty state instead of crashing).
 * - GITHUB_USERNAME unset -> null.
 */
export async function getGitHubData(): Promise<GitHubData | null> {
  const username = process.env.GITHUB_USERNAME;
  if (!username) {
    return null;
  }

  const cached = await readCache();
  if (cached) {
    return cached;
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "mrez.dev",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`${GITHUB_API}/users/${username}`, { headers }),
      fetch(`${GITHUB_API}/users/${username}/repos?sort=updated&per_page=100`, {
        headers,
      }),
    ]);

    if (!profileRes.ok || !reposRes.ok) {
      return await readCache();
    }

    const [profileRaw, reposRaw] = (await Promise.all([
      profileRes.json(),
      reposRes.json(),
    ])) as [RawProfile, RawRepo[]];

    const data: GitHubData = {
      profile: pickProfile(profileRaw),
      repos: reposRaw
        .filter((r) => !r.archived)
        .map(pickRepo),
    };

    await writeCache(data);
    return data;
  } catch {
    return await readCache();
  }
}
