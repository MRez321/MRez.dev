import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { account } from "@/lib/schema";
import { eq } from "drizzle-orm";

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
