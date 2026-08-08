// lib/api-keys.ts
// Server-side plumbing for the public v1 API: key generation, Bearer
// authentication, per-key rate limits + monthly quotas, and usage logging.
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, count, eq, gte, sum } from "drizzle-orm";
import { db } from "./db";
import { apiKey, apiKeyUsage } from "./schema";
import { rateLimit, type RateLimitResult } from "./rate-limiter";

export const API_KEY_PREFIX = "mrez_live_";
export const KEY_BYTES = 24; // -> 48 hex chars after the prefix
export const GLOBAL_IP_RATE_LIMIT_PER_MINUTE = 60;
export const API_DOCS_URL = "/docs/api";
export const OPENAPI_URL = "/api/v1/docs";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = API_KEY_PREFIX + randomBytes(KEY_BYTES).toString("hex");
  return {
    raw,
    prefix: raw.slice(0, API_KEY_PREFIX.length + 8),
    hash: sha256(raw),
  };
}

/** Reads the key from `Authorization: Bearer <key>` or `X-API-Key: <key>`. */
export function extractApiKey(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const key = auth.slice("bearer ".length).trim();
    if (key) return key;
  }
  const alt = request.headers.get("x-api-key");
  if (alt?.trim()) return alt.trim();
  return null;
}

/** Error shape all v1 routes agree on. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly extra?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiErrorResponse(err: unknown): Response {
  if (err instanceof ApiError) {
    return Response.json(
      {
        error: {
          code: err.code,
          message: err.message,
          documentation_url: API_DOCS_URL,
          ...err.extra,
        },
      },
      {
        status: err.status,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  }
  console.error("[api] unhandled error:", err);
  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong while processing the request.",
        documentation_url: API_DOCS_URL,
      },
    },
    { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }
  );
}

/** Limits the caller can actually use (independent of DB row shape). */
export type ApiKeyAuth = {
  id: string;
  userId: string;
  rateLimitPerMinute: number;
  monthlyRequests: number;
  monthlyBytes: number;
  maxFileBytes: number;
  rateLimit: RateLimitResult;
};

export function logUsage(
  keyId: string,
  endpoint: string,
  status: "ok" | "rejected",
  bytesIn: number,
  bytesOut: number,
  durationMs: number
) {
  db.insert(apiKeyUsage)
    .values({
      id: randomUUID(),
      keyId,
      endpoint,
      status,
      bytesIn,
      bytesOut,
      durationMs,
      createdAt: new Date(),
    })
    .run();
}

export async function getMonthlyUsage(
  keyId: string
): Promise<{ requests: number; bytesIn: number }> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [row] = db
    .select({ requests: count(), bytesIn: sum(apiKeyUsage.bytesIn) })
    .from(apiKeyUsage)
    .where(
      and(
        eq(apiKeyUsage.keyId, keyId),
        eq(apiKeyUsage.status, "ok"),
        gte(apiKeyUsage.createdAt, monthStart)
      )
    )
    .all();
  return { requests: row?.requests ?? 0, bytesIn: Number(row?.bytesIn ?? 0) };
}

/**
 * Validates the caller's API key and enforces, in order:
 *   1. a global per-IP safety net,
 *   2. the key's per-minute rate limit (Redis),
 *   3. the key's monthly request and byte quotas (usage log).
 *
 * Throws `ApiError` (401/403/429) on failure. Rejected calls are logged so
 * the dashboard shows why a key was throttled.
 */
export async function authenticateApiKey(
  request: Request,
  ip: string | null
): Promise<ApiKeyAuth> {
  const endpoint = new URL(request.url).pathname;

  if (ip) {
    const ipLimit = await rateLimit({
      key: `rl:v1:ip:${ip}`,
      limit: GLOBAL_IP_RATE_LIMIT_PER_MINUTE,
      windowSeconds: 60,
    });
    if (!ipLimit.ok) {
      throw new ApiError(429, "RATE_LIMITED", "Too many requests from this IP.", {
        retry_after: Math.max(0, ipLimit.resetAt - Math.floor(Date.now() / 1000)),
        limit: ipLimit.limit,
        reset_at: ipLimit.resetAt,
      });
    }
  }

  const raw = extractApiKey(request);
  if (!raw) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "Missing API key. Send it as `Authorization: Bearer <key>` or `X-API-Key: <key>`."
    );
  }

  const row = db
    .select()
    .from(apiKey)
    .where(eq(apiKey.keyHash, sha256(raw)))
    .get();
  if (!row) {
    throw new ApiError(401, "INVALID_API_KEY", "The API key is not valid.");
  }
  if (row.status === "revoked") {
    throw new ApiError(403, "KEY_REVOKED", "This API key has been revoked.");
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    throw new ApiError(403, "KEY_EXPIRED", "This API key has expired.");
  }

  const rateLimitResult = await rateLimit({
    key: `rl:v1:key:${row.id}`,
    limit: row.rateLimitPerMinute,
    windowSeconds: 60,
  });
  if (!rateLimitResult.ok) {
    logUsage(row.id, endpoint, "rejected", 0, 0, 0);
    throw new ApiError(
      429,
      "RATE_LIMITED",
      `Rate limit exceeded — ${row.rateLimitPerMinute} requests per minute.`,
      {
        retry_after: Math.max(0, rateLimitResult.resetAt - Math.floor(Date.now() / 1000)),
        limit: row.rateLimitPerMinute,
        reset_at: rateLimitResult.resetAt,
      }
    );
  }

  const usage = await getMonthlyUsage(row.id);
  if (row.monthlyRequests > 0 && usage.requests >= row.monthlyRequests) {
    logUsage(row.id, endpoint, "rejected", 0, 0, 0);
    throw new ApiError(
      429,
      "QUOTA_EXCEEDED",
      `Monthly request quota (${row.monthlyRequests}) reached for this key.`,
      { limit: row.monthlyRequests, used: usage.requests }
    );
  }
  if (row.monthlyBytes > 0 && usage.bytesIn >= row.monthlyBytes) {
    logUsage(row.id, endpoint, "rejected", 0, 0, 0);
    throw new ApiError(
      429,
      "QUOTA_EXCEEDED",
      `Monthly upload quota reached for this key (${Math.round(row.monthlyBytes / 1_048_576)} MB).`,
      { limit: row.monthlyBytes, used: usage.bytesIn }
    );
  }

  return {
    id: row.id,
    userId: row.userId,
    rateLimitPerMinute: row.rateLimitPerMinute,
    monthlyRequests: row.monthlyRequests,
    monthlyBytes: row.monthlyBytes,
    maxFileBytes: row.maxFileBytes,
    rateLimit: rateLimitResult,
  };
}

export function recordUsage(
  keyId: string,
  endpoint: string,
  status: "ok" | "rejected",
  bytesIn: number,
  bytesOut: number,
  durationMs: number
) {
  logUsage(keyId, endpoint, status, bytesIn, bytesOut, durationMs);
}

export function touchLastUsed(keyId: string) {
  db.update(apiKey).set({ lastUsedAt: new Date() }).where(eq(apiKey.id, keyId)).run();
}

export function rateLimitHeaders(rl: RateLimitResult): Record<string, string> {
  return {
    "x-ratelimit-limit": String(rl.limit),
    "x-ratelimit-remaining": String(rl.remaining),
    "x-ratelimit-reset": String(rl.resetAt),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
