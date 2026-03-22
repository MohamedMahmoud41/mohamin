"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adminCreateOffice(data: {
  name: string;
  address: string;
  email: string;
  phone: string;
  description: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("offices").insert({
    name: data.name,
    address: data.address,
    email: data.email,
    phone: data.phone,
    description: data.description,
    members_ids: [],
    cases_ids: [],
  });
  revalidatePath("/admin/owners");
  return { error: error?.message ?? null };
}

export async function adminUpdateOffice(
  id: string,
  data: Partial<{
    name: string;
    address: string;
    email: string;
    phone: string;
    description: string;
  }>,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("offices").update(data).eq("id", id);
  revalidatePath("/admin/owners");
  return { error: error?.message ?? null };
}

export async function adminDeleteOffice(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("offices").delete().eq("id", id);
  revalidatePath("/admin/owners");
  return { error: error?.message ?? null };
}
