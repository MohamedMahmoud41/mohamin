"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Mission } from "@/types";

export async function createMission(data: {
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string | null;
  contextType: "user" | "office";
  contextId: string;
}): Promise<{ data: Mission | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "غير مصرح" };

  const { data: result, error } = await supabase
    .from("missions")
    .insert({
      title: data.title,
      description: data.description,
      due_date: data.dueDate,
      assigned_to: data.assignedTo ?? user.id,
      context_type: data.contextType,
      context_id: data.contextId,
      is_completed: false,
      created_by: user.id,
    })
    .select()
    .single();

  revalidatePath("/missions");
  revalidatePath("/office");
  if (error) return { data: null, error: error.message };
  return {
    data: result
      ? {
          id: result.id,
          title: result.title,
          description: result.description,
          isCompleted: result.is_completed ?? false,
          assignedTo: result.assigned_to ?? null,
          contextType: result.context_type,
          contextId: result.context_id,
          dueDate: result.due_date,
          createdAt: result.created_at,
        }
      : null,
    error: null,
  };
}

export async function toggleMission(
  missionId: string,
  isCompleted: boolean,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("missions")
    .update({ is_completed: isCompleted })
    .eq("id", missionId);

  revalidatePath("/missions");
  revalidatePath("/office");
  return { error: error?.message ?? null };
}

export async function deleteMission(
  missionId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("missions")
    .delete()
    .eq("id", missionId);
  revalidatePath("/missions");
  revalidatePath("/office");
  return { error: error?.message ?? null };
}
