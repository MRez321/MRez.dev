// features/api-keys/queries.ts
// Dashboard/admin data access for API keys with current-month usage.
import { and, count, desc, eq, gte, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKey, apiKeyUsage, user } from "@/lib/schema";

export type UsageTotals = { requests: number; bytesIn: number; bytesOut: number };

export type ApiKeyWithUsage = typeof apiKey.$inferSelect & { usage: UsageTotals };

export type AdminApiKeyWithUsage = ApiKeyWithUsage & { ownerEmail: string; ownerName: string };

const NO_USAGE: UsageTotals = { requests: 0, bytesIn: 0, bytesOut: 0 };

function currentMonthUsage(): Map<string, UsageTotals> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const rows = db
    .select({
      keyId: apiKeyUsage.keyId,
      requests: count(),
      bytesIn: sum(apiKeyUsage.bytesIn),
      bytesOut: sum(apiKeyUsage.bytesOut),
    })
    .from(apiKeyUsage)
    .where(and(eq(apiKeyUsage.status, "ok"), gte(apiKeyUsage.createdAt, monthStart)))
    .groupBy(apiKeyUsage.keyId)
    .all();
  return new Map(
    rows.map((r) => [
      r.keyId,
      { requests: r.requests, bytesIn: Number(r.bytesIn ?? 0), bytesOut: Number(r.bytesOut ?? 0) },
    ])
  );
}

export function getMyApiKeys(userId: string): ApiKeyWithUsage[] {
  const keys = db
    .select()
    .from(apiKey)
    .where(eq(apiKey.userId, userId))
    .orderBy(desc(apiKey.createdAt))
    .all();
  const usage = currentMonthUsage();
  return keys.map((k) => ({ ...k, usage: usage.get(k.id) ?? NO_USAGE }));
}

export function getAllApiKeysWithUsage(): AdminApiKeyWithUsage[] {
  const rows = db
    .select({ key: apiKey, ownerEmail: user.email, ownerName: user.name })
    .from(apiKey)
    .innerJoin(user, eq(apiKey.userId, user.id))
    .orderBy(desc(apiKey.createdAt))
    .all();
  const usage = currentMonthUsage();
  return rows.map((r) => ({
    ...r.key,
    ownerEmail: r.ownerEmail,
    ownerName: r.ownerName,
    usage: usage.get(r.key.id) ?? NO_USAGE,
  }));
}
