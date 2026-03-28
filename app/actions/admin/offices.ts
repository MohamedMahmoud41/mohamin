"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Office } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOffice(row: Record<string, any>): Office {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    description: row.description ?? "",
    ownerId: row.owner_id ?? "",
    membersIds: row.members_ids ?? [],
    casesIds: row.cases_ids ?? [],
    createdAt: row.created_at,
  };
}

export async function adminCreateOffice(data: {
  name: string;
  address: string;
  email: string;
  phone: string;
  description: string;
}): Promise<{ error: string | null; office?: Office }> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("offices")
    .insert({
      name: data.name,
      address: data.address,
      email: data.email,
      phone: data.phone,
      description: data.description,
      members_ids: [],
      cases_ids: [],
    })
    .select()
    .single();
  revalidatePath("/admin/owners");
  if (error) return { error: error.message };
  return { error: null, office: mapOffice(row) };
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
