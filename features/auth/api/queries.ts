import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, post, user } from "@/lib/schema";

/**
 * Returns the current session, or null when logged out.
 * Use in server components / route handlers.
 */
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Authorization guard for protected pages.
 * Redirects unauthenticated visitors to /signin.
 */
export async function requireUser() {
  const session = await getSession();
  if (!session) {
    redirect("/signin");
  }
  return session;
}

/** OAuth/credential accounts linked to a user (providerId: google | github | credential). */
export async function getUserAccounts(userId: string) {
  return db.select().from(account).where(eq(account.userId, userId));
}

/** Admin: every user with providers, post counts, and moderation flags. */
export async function getAllUsers() {
  const [rows, accounts, postCounts] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        banned: user.banned,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.createdAt),
    db.select({ userId: account.userId, providerId: account.providerId }).from(account),
    db
      .select({ authorId: post.authorId, count: count(post.id) })
      .from(post)
      .groupBy(post.authorId),
  ]);

  const countsByAuthor = new Map(postCounts.map((p) => [p.authorId, p.count]));
  const providersByUser = new Map<string, Set<string>>();
  for (const a of accounts) {
    const set = providersByUser.get(a.userId) ?? new Set<string>();
    set.add(a.providerId);
    providersByUser.set(a.userId, set);
  }

  return rows.map((r) => ({
    ...r,
    providers: [...(providersByUser.get(r.id) ?? [])],
    postCount: countsByAuthor.get(r.id) ?? 0,
  }));
}
