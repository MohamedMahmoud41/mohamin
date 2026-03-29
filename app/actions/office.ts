"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setupOffice(data: {
  name: string;
  address: string;
  email: string;
  phone: string;
  description: string;
  lawyerIds: string[];
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  // Create the office
  const { data: office, error: officeError } = await supabase
    .from("offices")
    .insert({
      name: data.name,
      address: data.address,
      email: data.email,
      phone: data.phone,
      description: data.description,
      owner_id: user.id,
      members_ids: [user.id, ...data.lawyerIds],
      cases_ids: [],
    })
    .select()
    .single();

  if (officeError) return { error: officeError.message };

  // Update owner's office_id
  await supabase
    .from("users")
    .update({ office_id: office.id })
    .eq("id", user.id);

  // Update each lawyer's office_id
  if (data.lawyerIds.length > 0) {
    await supabase
      .from("users")
      .update({ office_id: office.id })
      .in("id", data.lawyerIds);
  }

  revalidatePath("/office");
  return { error: null };
}

export async function updateUserOffice(data: {
  name: string;
  address: string;
  email: string;
  phone: string;
  description: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data: currentUser } = await supabase
    .from("users")
    .select("office_id")
    .eq("id", user.id)
    .single();

  if (!currentUser?.office_id) return { error: "لا يوجد مكتب مرتبط بحسابك" };

  const { error: updateError } = await supabase
    .from("offices")
    .update({
      name: data.name,
      address: data.address,
      email: data.email,
      phone: data.phone,
      description: data.description,
    })
    .eq("id", currentUser.office_id)
    .eq("owner_id", user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/office");
  return { error: null };
}

export async function inviteLawyerToOffice(
  officeId: string,
  lawyerEmail: string,
): Promise<{
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  error: string | null;
}> {
  const supabase = await createClient();

  // Look up user by email
  const { data: lawyerUser, error: lookupError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .eq("email", lawyerEmail)
    .single();

  if (lookupError || !lawyerUser)
    return {
      data: null,
      error: "لم يتم العثور على المحامي بهذا البريد الإلكتروني",
    };

  return {
    data: {
      id: lawyerUser.id,
      firstName: lawyerUser.first_name,
      lastName: lawyerUser.last_name,
      email: lawyerUser.email,
    },
    error: null,
  };
}
