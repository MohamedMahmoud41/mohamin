/**
 * Users service
 *
 * Replaces: src/Store/Slices/userSlice.js (Firestore user document reads/writes)
 * Now uses:  Supabase `users` table
 */
import { createClient } from "@/lib/supabase/server";
import type { User, NotificationSettings, ApiResponse } from "@/types";

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  return { data: data as User | null, error: error?.message ?? null };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>,
): Promise<ApiResponse<User>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { data: data as User | null, error: error?.message ?? null };
}

export async function getNotificationSettings(
  userId: string,
): Promise<ApiResponse<NotificationSettings>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  return {
    data: data as NotificationSettings | null,
    error: error?.message ?? null,
  };
}

export async function saveNotificationSettings(
  userId: string,
  settings: NotificationSettings,
): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notification_settings")
    .upsert({ user_id: userId, ...settings });

  return { data: null, error: error?.message ?? null };
}
