// lib/rate-limiter.ts
import { redis } from "./redis";

export type RateLimitResult = {
  ok: boolean;
  /** Configured max requests per window. */
  limit: number;
  /** Requests still allowed in the current window (clamped at 0). */
  remaining: number;
  /** Unix seconds when the window resets. */
  resetAt: number;
};

const INCR_EXPIRE = /* lua */ `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return { current, ttl }
`;

/**
 * Fixed-window counter backed by Upstash Redis (atomic INCR + EXPIRE), so
 * limits hold across every server instance. If Redis is unreachable we
 * degrade to a per-process counter instead of failing open entirely — a
 * single Node instance still enforces the limit.
 */
export async function rateLimit(opts: {
  /** Unique limiter key, e.g. `rl:v1:key:<id>` or `rl:v1:ip:<addr>`. */
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = opts;
  const now = Math.floor(Date.now() / 1000);

  try {
    const [count, ttl] = (await redis.eval(INCR_EXPIRE, [key], [String(windowSeconds)])) as [number, number];
    const resetAt = ttl > 0 ? now + ttl : now + windowSeconds;
    return { ok: count <= limit, limit, remaining: Math.max(0, limit - count), resetAt };
  } catch (err) {
    // Fall back to an in-process counter (fixed window, lazy expiry).
    if (process.env.NODE_ENV !== "test") {
      console.warn("[rate-limiter] redis unavailable, using in-memory fallback:", (err as Error).message);
    }
    const entry = memory.get(key);
    const current = !entry || entry.expiresAt <= now ? 1 : entry.count + 1;
    const expiresAt = !entry || entry.expiresAt <= now ? now + windowSeconds : entry.expiresAt;
    memory.set(key, { count: current, expiresAt });
    if (memory.size > 10_000) {
      for (const [k, v] of memory) if (v.expiresAt <= now) memory.delete(k);
    }
    return { ok: current <= limit, limit, remaining: Math.max(0, limit - current), resetAt: expiresAt };
  }
}

const memory = new Map<string, { count: number; expiresAt: number }>();
