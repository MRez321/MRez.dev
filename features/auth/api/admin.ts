"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { requireAdmin } from "./guards";
import { isRole, type Role } from "../permissions";

export type AdminActionResult = { ok: boolean; error?: string };

/** Admins can't demote or ban themselves — avoids accidental lockouts. */
function assertNotSelf(targetId: string, actorId: string): AdminActionResult | null {
  return targetId === actorId
    ? { ok: false, error: "You can't change your own account." }
    : null;
}

export async function updateUserRole(
  targetId: string,
  role: string
): Promise<AdminActionResult> {
  const actor = await requireAdmin();
  if (!isRole(role)) return { ok: false, error: "Invalid role." };
  const blocked = assertNotSelf(targetId, actor.id);
  if (blocked) return blocked;

  await db.update(user).set({ role: role as Role }).where(eq(user.id, targetId));
  revalidatePath("/admin/users");
  revalidatePath("/admin/analytics");
  return { ok: true };
}

export async function toggleUserBan(
  targetId: string,
  banned: boolean
): Promise<AdminActionResult> {
  const actor = await requireAdmin();
  const blocked = assertNotSelf(targetId, actor.id);
  if (blocked) return blocked;

  const target = await db.query.user.findFirst({
    where: eq(user.id, targetId),
    columns: { role: true },
  });
  if (!target) return { ok: false, error: "User not found." };
  if (target.role === "admin" && banned) {
    return { ok: false, error: "Admins can't be banned." };
  }

  await db.update(user).set({ banned }).where(eq(user.id, targetId));
  revalidatePath("/admin/users");
  return { ok: true };
}
