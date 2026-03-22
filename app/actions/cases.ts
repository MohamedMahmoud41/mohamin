"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Case, CaseNote, CaseSession } from "@/types";

// ─── Case CRUD ────────────────────────────────────────────────────────────────

export async function createCase(
  data: Omit<Case, "id" | "createdAt" | "updatedAt">,
): Promise<{ data: Case | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "غير مصرح" };

  const { data: result, error } = await supabase
    .from("cases")
    .insert({ ...data, created_by: user.id })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Update the assigned lawyer's private_cases_ids (denormalized array)
  const assignedLawyerId = data.lawyerID || user.id;
  const { data: lawyerRecord } = await supabase
    .from("users")
    .select("private_cases_ids")
    .eq("id", assignedLawyerId)
    .single();

  const existing: string[] = lawyerRecord?.private_cases_ids ?? [];
  if (!existing.includes(result.id)) {
    await supabase
      .from("users")
      .update({ private_cases_ids: [...existing, result.id] })
      .eq("id", assignedLawyerId);
  }

  revalidatePath("/cases");
  revalidatePath("/dashboard");
  return { data: result as Case, error: null };
}

export async function updateCase(
  caseId: string,
  data: Partial<Case>,
): Promise<{ data: Case | null; error: string | null }> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("cases")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", caseId)
    .select()
    .single();

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/cases");
  revalidatePath("/dashboard");
  return { data: result as Case | null, error: error?.message ?? null };
}

export async function deleteCase(
  caseId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("cases").delete().eq("id", caseId);
  revalidatePath("/cases");
  revalidatePath("/dashboard");
  return { error: error?.message ?? null };
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function addCaseNote(
  caseId: string,
  noteData: { noteTitle: string; noteOwner: string },
): Promise<{ data: CaseNote | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_notes")
    .insert({ ...noteData, case_id: caseId })
    .select()
    .single();

  revalidatePath(`/cases/${caseId}`);
  return { data: data as CaseNote | null, error: error?.message ?? null };
}

export async function deleteCaseNote(
  caseId: string,
  noteId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("case_notes").delete().eq("id", noteId);

  revalidatePath(`/cases/${caseId}`);
  return { error: error?.message ?? null };
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function addCaseSession(
  caseId: string,
  sessionData: { sessionDate: string; notes?: string },
): Promise<{ data: CaseSession | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_sessions")
    .insert({ ...sessionData, case_id: caseId })
    .select()
    .single();

  revalidatePath(`/cases/${caseId}`);
  return { data: data as CaseSession | null, error: error?.message ?? null };
}

export async function deleteCaseSession(
  caseId: string,
  sessionId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("case_sessions")
    .delete()
    .eq("id", sessionId);

  revalidatePath(`/cases/${caseId}`);
  return { error: error?.message ?? null };
}
