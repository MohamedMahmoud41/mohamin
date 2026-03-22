"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { User, NotificationSettings } from "@/types";

export async function updateUserProfile(
  updates: Partial<
    Pick<
      User,
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "specialization"
      | "experience"
      | "bio"
    >
  >,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "غير مصرح" };

  const { error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", authUser.id);

  revalidatePath("/settings/profile");
  return { error: error?.message ?? null };
}

export async function saveNotificationSettings(
  settings: NotificationSettings,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: "غير مصرح" };

  const { error } = await supabase
    .from("notification_settings")
    .upsert({ user_id: authUser.id, ...settings });

  return { error: error?.message ?? null };
}

export async function changePassword(
  newPassword: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}
