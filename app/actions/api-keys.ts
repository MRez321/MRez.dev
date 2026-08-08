"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiKey } from "@/lib/schema";
import { generateApiKey } from "@/lib/api-keys";
import { getSession, requireUser } from "@/features/auth/api/queries";

const MB = 1024 * 1024;

const createApiKeySchema = z.object({
  name: z.string().trim().min(1, "Give the key a name.").max(60),
  /** Requests allowed per minute window. */
  rateLimitPerMinute: z.coerce.number().int().min(1).max(10_000).default(60),
  /** Monthly request quota; 0 = unlimited. */
  monthlyRequests: z.coerce.number().int().min(0).max(100_000_000).default(0),
  /** Monthly upload quota in MB; 0 = unlimited. */
  monthlyMegabytes: z.coerce.number().int().min(0).max(100_000).default(0),
  /** Max single-file size in MB. */
  maxFileMegabytes: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateApiKeyResult =
  | { ok: true; key: string; prefix: string }
  | { ok: false; error: string };

/**
 * Creates a key and returns the raw value — it is shown to the user exactly
 * once; only a SHA-256 hash is persisted.
 */
export async function createApiKey(input: FormData): Promise<CreateApiKeyResult> {
  const { user } = await requireUser();

  const parsed = createApiKeySchema.safeParse(Object.fromEntries(input));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid limits." };
  }

  const { raw, prefix, hash } = generateApiKey();
  const { name, rateLimitPerMinute, monthlyRequests, monthlyMegabytes, maxFileMegabytes } =
    parsed.data;

  db.insert(apiKey)
    .values({
      id: randomUUID(),
      userId: user.id,
      name,
      prefix,
      keyHash: hash,
      createdAt: new Date(),
      rateLimitPerMinute,
      monthlyRequests,
      monthlyBytes: monthlyMegabytes * MB,
      maxFileBytes: maxFileMegabytes * MB,
    })
    .run();

  revalidatePath("/dashboard/api-keys");
  return { ok: true, key: raw, prefix };
}

export type RevokeApiKeyResult = { ok: true } | { ok: false; error: string };

/** Owners can revoke their own keys; admins can revoke any key. */
export async function revokeApiKey(id: string): Promise<RevokeApiKeyResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in." };

  const row = db.select({ userId: apiKey.userId }).from(apiKey).where(eq(apiKey.id, id)).get();
  if (!row) return { ok: false, error: "Key not found." };

  const isOwner = row.userId === session.user.id;
  const isAdmin = !session.user.banned && session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return { ok: false, error: "You can only revoke your own keys." };
  }

  db.update(apiKey)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(eq(apiKey.id, id))
    .run();

  revalidatePath("/dashboard/api-keys");
  revalidatePath("/admin/api-keys");
  return { ok: true };
}
