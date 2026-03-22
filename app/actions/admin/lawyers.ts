"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adminCreateLawyer(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  specialization: string;
  experience: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Create auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (signUpError || !authData.user)
    return { error: signUpError?.message ?? "فشل إنشاء الحساب" };

  // Insert user profile
  const { error: insertError } = await supabase.from("users").insert({
    id: authData.user.id,
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    phone: data.phone,
    specialization: data.specialization,
    experience: data.experience,
    role: ["lawyer"],
    office_id: null,
    private_cases_ids: [],
    office_cases_ids: [],
    profile_image_url: "",
    bio: "",
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/lawyers");
  return { error: null };
}

export async function adminUpdateLawyer(
  id: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    specialization: string;
    experience: string;
  }>,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      ...(data.firstName !== undefined && { first_name: data.firstName }),
      ...(data.lastName !== undefined && { last_name: data.lastName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.specialization !== undefined && {
        specialization: data.specialization,
      }),
      ...(data.experience !== undefined && { experience: data.experience }),
    })
    .eq("id", id);

  revalidatePath("/admin/lawyers");
  return { error: error?.message ?? null };
}

export async function adminDeleteLawyer(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("users").delete().eq("id", id);
  revalidatePath("/admin/lawyers");
  return { error: error?.message ?? null };
}
