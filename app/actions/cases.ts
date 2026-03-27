"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Case, CaseNote, CaseSession } from "@/types";

// ─── camelCase form data → snake_case DB row ─────────────────────────────────

export interface CaseInput {
  caseTitle: string;
  caseType: string;
  caseStatus: string;
  caseDescription: string;
  startDate: string;
  nextSessionDate?: string | null;
  officeId: string;
  lawyerID: string;
  lawyerName?: string;
  courtName: string;
  courtHall?: string;
  clientName: string;
  clientType?: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  opponentName: string;
  opponentType?: string;
  opponentPhone?: string;
  opponentEmail?: string;
  opponentAddress?: string;
}

function toDbRow(data: CaseInput) {
  return {
    case_title: data.caseTitle,
    case_type: data.caseType,
    case_status: data.caseStatus,
    case_description: data.caseDescription,
    start_date: data.startDate,
    next_session_date: data.nextSessionDate || null,
    office_id: data.officeId,
    lawyer_id: data.lawyerID,
    court_name: data.courtName,
    client_name: data.clientName,
    client_phone: data.clientPhone,
    client_email: data.clientEmail || "",
    opponent_name: data.opponentName,
    opponent_phone: data.opponentPhone || "",
  };
}

function toDbPartial(data: Partial<CaseInput>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {};
  if (data.caseTitle !== undefined) row.case_title = data.caseTitle;
  if (data.caseType !== undefined) row.case_type = data.caseType;
  if (data.caseStatus !== undefined) row.case_status = data.caseStatus;
  if (data.caseDescription !== undefined)
    row.case_description = data.caseDescription;
  if (data.startDate !== undefined) row.start_date = data.startDate;
  if (data.nextSessionDate !== undefined)
    row.next_session_date = data.nextSessionDate || null;
  if (data.officeId !== undefined) row.office_id = data.officeId;
  if (data.lawyerID !== undefined) row.lawyer_id = data.lawyerID;
  if (data.courtName !== undefined) row.court_name = data.courtName;
  if (data.clientName !== undefined) row.client_name = data.clientName;
  if (data.clientPhone !== undefined) row.client_phone = data.clientPhone;
  if (data.clientEmail !== undefined) row.client_email = data.clientEmail;
  if (data.opponentName !== undefined) row.opponent_name = data.opponentName;
  if (data.opponentPhone !== undefined) row.opponent_phone = data.opponentPhone;
  return row;
}

// ─── Case CRUD ────────────────────────────────────────────────────────────────

export async function createCase(
  data: CaseInput,
): Promise<{ data: Case | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "غير مصرح" };

  const row = { ...toDbRow(data), created_by: user.id };

  const { data: result, error } = await supabase
    .from("cases")
    .insert(row)
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
  data: Partial<CaseInput>,
): Promise<{ data: Case | null; error: string | null }> {
  const supabase = await createClient();
  const row = { ...toDbPartial(data), updated_at: new Date().toISOString() };

  const { data: result, error } = await supabase
    .from("cases")
    .update(row)
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
