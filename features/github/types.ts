export type GitHubRepo = {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  fork: boolean;
  topics: string[];
  pushedAt: string | null;
  license: string | null;
};

export type GitHubProfile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  htmlUrl: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  followers: number;
  publicRepos: number;
};

export type GitHubData = {
  profile: GitHubProfile;
  repos: GitHubRepo[];
};
