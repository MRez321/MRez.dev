// Optional GA4 Data API client for the admin dashboard.
//
// Enabled only when GA4_PROPERTY_ID + GA4_CLIENT_EMAIL + GA4_PRIVATE_KEY are
// set (a Google service account with "Google Analytics Data API" enabled and
// Viewer access to the property). The access token is minted via the
// service-account JWT flow using node:crypto — no extra dependencies.

import { createPrivateKey, sign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE = "https://analyticsdata.googleapis.com/v1beta";
const SCOPES = "https://www.googleapis.com/auth/analytics.readonly";

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GA4_PRIVATE_KEY;

export type GA4Summary = {
  users: number;
  sessions: number;
  pageviews: number;
  topPages: { page: string; views: number }[];
};

let cachedToken: { token: string; expiresAt: number } | null = null;

function isConfigured() {
  return Boolean(PROPERTY_ID && CLIENT_EMAIL && PRIVATE_KEY);
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

/** Sign a service-account JWT and exchange it for an OAuth access token. */
async function getAccessToken(): Promise<string | null> {
  if (!isConfigured()) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = base64url(
      JSON.stringify({
        iss: CLIENT_EMAIL,
        scope: SCOPES,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      })
    );
    const signingInput = `${header}.${claims}`;
    const key = createPrivateKey((PRIVATE_KEY ?? "").replace(/\\n/g, "\n"));
    const signature = sign("RSA-SHA256", Buffer.from(signingInput), key);
    const assertion = `${signingInput}.${base64url(signature)}`;

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return cachedToken.token;
  } catch {
    return null;
  }
}

type RunReportResponse = {
  rows?: {
    dimensionValues?: { value?: string }[];
    metricValues?: { value?: string }[];
  }[];
};

async function runReport(body: unknown): Promise<RunReportResponse | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/properties/${PROPERTY_ID}:runReport`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as RunReportResponse;
  } catch {
    return null;
  }
}

/** Returns null when unconfigured or any API call fails. */
export async function getGA4Summary(): Promise<GA4Summary | null> {
  if (!isConfigured()) return null;

  const [summary, pages] = await Promise.all([
    runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
    }),
    runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 8,
    }),
  ]);

  const metrics = summary?.rows?.[0]?.metricValues ?? [];
  const num = (value: string | undefined) => Number(value ?? 0);

  return {
    users: num(metrics[0]?.value),
    sessions: num(metrics[1]?.value),
    pageviews: num(metrics[2]?.value),
    topPages: (pages?.rows ?? [])
      .map((row) => ({
        page: row.dimensionValues?.[0]?.value ?? "/",
        views: num(row.metricValues?.[0]?.value),
      }))
      .filter((p) => p.views > 0),
  };
}
