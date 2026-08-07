"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { requireUser } from "@/features/auth/api/queries";

export type ProfileActionResult = { ok: boolean; error?: string };

export async function updateDisplayName(formData: FormData): Promise<ProfileActionResult> {
  const session = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 60) {
    return { ok: false, error: "Name must be 1–60 characters." };
  }
  await db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
