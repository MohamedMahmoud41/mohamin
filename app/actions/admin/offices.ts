"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Office, User, UserRole } from "@/types";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: Record<string, any>): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? "",
    role: row.role as UserRole[],
    officeId: row.office_id ?? null,
    specialization: row.specialization ?? "",
    experience: row.experience ?? "",
    bio: row.bio ?? "",
    profileImageUrl: row.profile_image_url ?? "",
    privateCasesIds: row.private_cases_ids ?? [],
    officeCasesIds: row.office_cases_ids ?? [],
    isBanned: row.is_banned ?? false,
    isTest: row.is_test ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Fetch users eligible for office roles ────────────────────────────────────

export async function adminGetOfficeEligibleUsers(): Promise<{
  owners: User[];
  lawyers: User[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or("role.cs.{officeOwner},role.cs.{lawyer}")
    .eq("is_banned", false)
    .order("first_name");

  if (error) return { owners: [], lawyers: [], error: error.message };

  const users = (data ?? []).map(mapUser);
  return {
    // Only show officeOwners who don't already belong to an office
    owners: users.filter((u) => u.role.includes("officeOwner") && !u.officeId),
    lawyers: users.filter((u) => u.role.includes("lawyer")),
    error: null,
  };
}

// ─── Create office ────────────────────────────────────────────────────────────

export async function adminCreateOffice(data: {
  name: string;
  address: string;
  email: string;
  phone: string;
  description: string;
  ownerId?: string;
  lawyerIds?: string[];
}): Promise<{ error: string | null; office?: Office }> {
  const supabase = await createClient();

  const membersIds = Array.from(
    new Set([
      ...(data.ownerId ? [data.ownerId] : []),
      ...(data.lawyerIds ?? []),
    ]),
  );

  const { data: row, error } = await supabase
    .from("offices")
    .insert({
      name: data.name,
      address: data.address,
      email: data.email,
      phone: data.phone,
      description: data.description,
      owner_id: data.ownerId || null,
      members_ids: membersIds,
      cases_ids: [],
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const officeId = row.id;

  // Update user records: set office_id for owner + lawyers
  if (membersIds.length > 0) {
    await supabase
      .from("users")
      .update({ office_id: officeId })
      .in("id", membersIds);
  }

  revalidatePath("/admin/owners");
  return { error: null, office: mapOffice(row) };
}

// ─── Update office ────────────────────────────────────────────────────────────

export async function adminUpdateOffice(
  id: string,
  data: Partial<{
    name: string;
    address: string;
    email: string;
    phone: string;
    description: string;
    ownerId: string;
    lawyerIds: string[];
  }>,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Build the update payload for the offices table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const officeUpdate: Record<string, any> = {};
  if (data.name !== undefined) officeUpdate.name = data.name;
  if (data.address !== undefined) officeUpdate.address = data.address;
  if (data.email !== undefined) officeUpdate.email = data.email;
  if (data.phone !== undefined) officeUpdate.phone = data.phone;
  if (data.description !== undefined)
    officeUpdate.description = data.description;

  // Handle owner + members update
  if (data.ownerId !== undefined || data.lawyerIds !== undefined) {
    // Fetch current office to know existing members (so we can clear old ones)
    const { data: existing } = await supabase
      .from("offices")
      .select("owner_id, members_ids")
      .eq("id", id)
      .single();

    const oldMembers: string[] = existing?.members_ids ?? [];

    const newMembers = Array.from(
      new Set([
        ...(data.ownerId
          ? [data.ownerId]
          : existing?.owner_id
            ? [existing.owner_id]
            : []),
        ...(data.lawyerIds ?? []),
      ]),
    );

    officeUpdate.owner_id = data.ownerId ?? existing?.owner_id ?? null;
    officeUpdate.members_ids = newMembers;

    // Clear office_id for members who were removed
    const removed = oldMembers.filter((m) => !newMembers.includes(m));
    if (removed.length > 0) {
      await supabase
        .from("users")
        .update({ office_id: null })
        .in("id", removed);
    }

    // Set office_id for new members
    if (newMembers.length > 0) {
      await supabase
        .from("users")
        .update({ office_id: id })
        .in("id", newMembers);
    }
  }

  const { error } = await supabase
    .from("offices")
    .update(officeUpdate)
    .eq("id", id);
  revalidatePath("/admin/owners");
  return { error: error?.message ?? null };
}

// ─── Delete office ────────────────────────────────────────────────────────────

export async function adminDeleteOffice(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Clear office_id for all members before deleting
  await supabase.from("users").update({ office_id: null }).eq("office_id", id);

  const { error } = await supabase.from("offices").delete().eq("id", id);
  revalidatePath("/admin/owners");
  return { error: error?.message ?? null };
}
