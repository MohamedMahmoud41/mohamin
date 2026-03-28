/**
 * Users service
 *
 * Replaces: src/Store/Slices/userSlice.js (Firestore user document reads/writes)
 * Now uses:  Supabase `users` table
 */
import { createClient } from "@/lib/supabase/server";
import type {
  User,
  UserRole,
  NotificationSettings,
  ApiResponse,
} from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: Record<string, any>): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    role: row.role as UserRole[],
    officeId: row.office_id ?? null,
    specialization: row.specialization,
    experience: row.experience,
    bio: row.bio,
    profileImageUrl: row.profile_image_url,
    privateCasesIds: row.private_cases_ids ?? [],
    officeCasesIds: row.office_cases_ids ?? [],
    fcmToken: row.fcm_token,
    isBanned: row.is_banned ?? false,
    isTest: row.is_test ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

  return { data: data ? mapUser(data) : null, error: error?.message ?? null };
}

export async function getAllUsers(): Promise<ApiResponse<User[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data ? data.map(mapUser) : [], error: error?.message ?? null };
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

  return { data: data ? mapUser(data) : null, error: error?.message ?? null };
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
