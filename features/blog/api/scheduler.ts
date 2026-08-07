import { and, eq, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { post } from "@/lib/schema";

/**
 * Publishes every scheduled post whose time has come.
 * Shared by the BullMQ worker sweep (run every minute) and any server-side
 * callers. `revalidate` is off in the worker process, where `revalidatePath`
 * has no request context to invalidate.
 */
export async function publishDuePosts(revalidate = true): Promise<number> {
  const now = new Date();
  const due = await db.query.post.findMany({
    where: and(eq(post.status, "scheduled"), lte(post.scheduledFor!, now)),
    columns: { id: true, slug: true },
  });

  for (const row of due) {
    await db
      .update(post)
      .set({
        status: "published",
        publishedAt: now,
        scheduledFor: null,
        updatedAt: now,
      })
      .where(eq(post.id, row.id));
  }

  if (due.length > 0 && revalidate) {
    for (const row of due) {
      revalidatePath(`/blog/${row.slug}`);
    }
    revalidatePath("/blog");
    revalidatePath("/admin/posts");
    revalidatePath("/admin/analytics");
  }

  return due.length;
}
