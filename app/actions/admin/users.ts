"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User, UserRole } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    specialization: row.specialization ?? "",
    experience: row.experience ?? "",
    bio: row.bio ?? "",
    profileImageUrl: row.profile_image_url ?? "",
    privateCasesIds: row.private_cases_ids ?? [],
    officeCasesIds: row.office_cases_ids ?? [],
    fcmToken: row.fcm_token,
    isBanned: row.is_banned ?? false,
    isTest: row.is_test ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { supabase, error: "غير مصرح" as const };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (!profile?.role?.includes("admin"))
    return { supabase, error: "غير مصرح" as const };
  return { supabase, error: null };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function adminCreateUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  specialization: string;
  experience: string;
  roles: UserRole[];
  isTest: boolean;
}): Promise<{ error: string | null; user?: User }> {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const admin = createAdminClient();

  // Create auth user (email_confirm: true skips confirmation email)
  const { data: newAuth, error: signUpError } =
    await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

  if (signUpError || !newAuth.user)
    return { error: signUpError?.message ?? "فشل إنشاء الحساب" };

  const { data: newProfile, error: profileError } = await admin
    .from("users")
    .upsert(
      {
        id: newAuth.user.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        specialization: data.specialization,
        experience: data.experience,
        role: data.roles,
        is_test: data.isTest,
        is_banned: false,
        office_id: null,
        private_cases_ids: [],
        office_cases_ids: [],
        profile_image_url: "",
        bio: "",
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (profileError) {
    // Rollback the auth user to keep DB consistent
    await admin.auth.admin.deleteUser(newAuth.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/admin/users");
  return { error: null, user: mapUser(newProfile) };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function adminUpdateUser(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    specialization?: string;
    experience?: string;
    roles?: UserRole[];
  },
): Promise<{ error: string | null }> {
  const { supabase, error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.firstName !== undefined) updates.first_name = data.firstName;
  if (data.lastName !== undefined) updates.last_name = data.lastName;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.specialization !== undefined)
    updates.specialization = data.specialization;
  if (data.experience !== undefined) updates.experience = data.experience;
  if (data.roles !== undefined) updates.role = data.roles;

  const { error } = await supabase.from("users").update(updates).eq("id", id);

  revalidatePath("/admin/users");
  return { error: error?.message ?? null };
}

// ─── Ban / Unban ──────────────────────────────────────────────────────────────

export async function adminBanUser(
  id: string,
): Promise<{ error: string | null }> {
  const { supabase, error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const { error } = await supabase
    .from("users")
    .update({ is_banned: true, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/users");
  return { error: error?.message ?? null };
}

export async function adminUnbanUser(
  id: string,
): Promise<{ error: string | null }> {
  const { supabase, error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const { error } = await supabase
    .from("users")
    .update({ is_banned: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/users");
  return { error: error?.message ?? null };
}

// ─── Toggle Test ─────────────────────────────────────────────────────────────

export async function adminToggleTest(
  id: string,
  isTest: boolean,
): Promise<{ error: string | null }> {
  const { supabase, error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const { error } = await supabase
    .from("users")
    .update({ is_test: isTest, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/users");
  return { error: error?.message ?? null };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function adminDeleteUser(
  id: string,
): Promise<{ error: string | null }> {
  const { error: authErr } = await requireAdmin();
  if (authErr) return { error: authErr };

  const admin = createAdminClient();

  // Delete profile row first, then auth user
  await admin.from("users").delete().eq("id", id);
  const { error } = await admin.auth.admin.deleteUser(id);

  revalidatePath("/admin/users");
  return { error: error?.message ?? null };
}
