// Optional Plausible Stats API client for the admin dashboard.
// Enabled only when PLAUSIBLE_API_KEY + PLAUSIBLE_SITE_ID are set in the env.

export type PlausibleSummary = {
  visitors: number;
  pageviews: number;
  bounceRate: number | null;
  visitDuration: number | null;
  topPages: { page: string; visitors: number; pageviews: number }[];
};

const API_BASE = process.env.PLAUSIBLE_BASE_URL ?? "https://plausible.io";
const API_KEY = process.env.PLAUSIBLE_API_KEY;
const SITE_ID = process.env.PLAUSIBLE_SITE_ID;

function isConfigured() {
  return Boolean(API_KEY && SITE_ID);
}

async function fetchJson(path: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 300 }, // 5 min
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

type AggregateResponse = {
  results?: {
    visitors?: { value: number };
    pageviews?: { value: number };
    bounce_rate?: { value: number };
    visit_duration?: { value: number };
  };
};

type BreakdownResponse = {
  results?: {
    page?: string;
    visitors?: number;
    pageviews?: number;
  }[];
};

/** Returns null when unconfigured or the API is unreachable. */
export async function getPlausibleSummary(): Promise<PlausibleSummary | null> {
  if (!isConfigured()) return null;

  const query = `?site_id=${encodeURIComponent(SITE_ID!)}&period=30d`;
  const [aggregate, breakdown] = await Promise.all([
    fetchJson(
      `/api/v1/stats/aggregate${query}&metrics=visitors,pageviews,bounce_rate,visit_duration`
    ) as Promise<AggregateResponse | null>,
    fetchJson(
      `/api/v1/stats/breakdown${query}&property=event:page&limit=8`
    ) as Promise<BreakdownResponse | null>,
  ]);

  const results = aggregate?.results;
  if (!results) return null;

  return {
    visitors: results.visitors?.value ?? 0,
    pageviews: results.pageviews?.value ?? 0,
    bounceRate: results.bounce_rate?.value ?? null,
    visitDuration: results.visit_duration?.value ?? null,
    topPages: (breakdown?.results ?? [])
      .filter((r) => r && typeof r.page === "string")
      .map((r) => ({
        page: r.page!,
        visitors: r.visitors ?? 0,
        pageviews: r.pageviews ?? 0,
      })),
  };
}
