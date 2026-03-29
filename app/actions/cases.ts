"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { Case, CaseNote, CaseSession, CaseAttachment } from "@/types";

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
  courtNum?: string;
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
    court_hall: data.courtHall || "",
    court_num: data.courtNum || "",
    client_name: data.clientName,
    client_phone: data.clientPhone,
    client_email: data.clientEmail || "",
    client_address: data.clientAddress || "",
    client_type: data.clientType || "",
    opponent_name: data.opponentName,
    opponent_phone: data.opponentPhone || "",
    opponent_email: data.opponentEmail || "",
    opponent_address: data.opponentAddress || "",
    opponent_type: data.opponentType || "",
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
  if (data.courtHall !== undefined) row.court_hall = data.courtHall;
  if (data.courtNum !== undefined) row.court_num = data.courtNum;
  if (data.clientName !== undefined) row.client_name = data.clientName;
  if (data.clientPhone !== undefined) row.client_phone = data.clientPhone;
  if (data.clientEmail !== undefined) row.client_email = data.clientEmail;
  if (data.clientAddress !== undefined) row.client_address = data.clientAddress;
  if (data.clientType !== undefined) row.client_type = data.clientType;
  if (data.opponentName !== undefined) row.opponent_name = data.opponentName;
  if (data.opponentPhone !== undefined) row.opponent_phone = data.opponentPhone;
  if (data.opponentEmail !== undefined) row.opponent_email = data.opponentEmail;
  if (data.opponentAddress !== undefined)
    row.opponent_address = data.opponentAddress;
  if (data.opponentType !== undefined) row.opponent_type = data.opponentType;
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

  // Auto-create initial upcoming session if nextSessionDate is provided
  if (data.nextSessionDate) {
    await supabase.from("case_sessions").insert({
      case_id: result.id,
      session_date: data.nextSessionDate,
      status: "upcoming",
      notes: "",
    });
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
  noteData: { noteTitle?: string; notes?: string; noteOwner: string },
): Promise<{ data: CaseNote | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_notes")
    .insert({
      case_id: caseId,
      note_title: noteData.noteTitle ?? "",
      notes: noteData.notes ?? "",
      note_owner: noteData.noteOwner,
      note_date: new Date().toISOString(),
    })
    .select()
    .single();

  revalidatePath(`/cases/${caseId}`);
  if (error || !data) return { data: null, error: error?.message ?? null };
  return {
    data: {
      id: data.id,
      caseId: data.case_id,
      noteTitle: data.note_title,
      notes: data.notes,
      noteOwner: data.note_owner,
      noteDate: data.note_date,
      createdAt: data.created_at,
    },
    error: null,
  };
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
  sessionData: {
    sessionDate: string;
    notes?: string;
    status?: "upcoming" | "held";
  },
): Promise<{ data: CaseSession | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_sessions")
    .insert({
      case_id: caseId,
      session_date: sessionData.sessionDate,
      notes: sessionData.notes ?? "",
      status: sessionData.status ?? "upcoming",
    })
    .select()
    .single();

  revalidatePath(`/cases/${caseId}`);
  if (error || !data) return { data: null, error: error?.message ?? null };
  return {
    data: {
      id: data.id,
      caseId: data.case_id,
      sessionDate: data.session_date,
      status: data.status ?? "upcoming",
      decision: data.decision ?? null,
      notes: data.notes,
      createdAt: data.created_at,
    },
    error: null,
  };
}

export async function recordSessionResult(
  caseId: string,
  sessionId: string,
  payload: {
    decision: "adjourned" | "judgment_reserved" | "judged";
    notes: string;
    nextSessionDate?: string | null;
  },
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // 1. Validate nextSessionDate when required
  if (
    (payload.decision === "adjourned" ||
      payload.decision === "judgment_reserved") &&
    !payload.nextSessionDate
  ) {
    return { error: "تاريخ الجلسة القادمة مطلوب" };
  }

  // 2. Fetch current session to validate date ordering
  const { data: sessionRow, error: fetchErr } = await supabase
    .from("case_sessions")
    .select("session_date")
    .eq("id", sessionId)
    .single();

  if (fetchErr || !sessionRow) {
    return { error: fetchErr?.message ?? "الجلسة غير موجودة" };
  }

  if (payload.nextSessionDate) {
    const current = new Date(sessionRow.session_date);
    const next = new Date(payload.nextSessionDate);
    if (next <= current) {
      return {
        error: "يجب أن يكون تاريخ الجلسة القادمة بعد تاريخ الجلسة الحالية",
      };
    }
  }

  // 3. Mark current session as held
  const { error: updateErr } = await supabase
    .from("case_sessions")
    .update({
      status: "held",
      decision: payload.decision,
      notes: payload.notes,
    })
    .eq("id", sessionId);

  if (updateErr) return { error: updateErr.message };

  // 4. Handle post-decision logic
  if (payload.decision === "judged") {
    // Close the case
    await supabase
      .from("cases")
      .update({ case_status: "closed", updated_at: new Date().toISOString() })
      .eq("id", caseId);
  } else if (payload.nextSessionDate) {
    // Create the next upcoming session
    await supabase.from("case_sessions").insert({
      case_id: caseId,
      session_date: payload.nextSessionDate,
      status: "upcoming",
      notes: "",
    });

    // Keep nextSessionDate on the case in sync
    await supabase
      .from("cases")
      .update({
        next_session_date: payload.nextSessionDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId);
  }

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/cases");
  revalidatePath("/dashboard");
  return { error: null };
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

// ─── Attachments ───────────────────────────────────────────────────────────────────────────────

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function uploadCaseAttachment(
  caseId: string,
  formData: FormData,
): Promise<{ data: CaseAttachment | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "غير مصرح" };

  const file = formData.get("file") as File;
  if (!file || !file.size) return { data: null, error: "لم يتم اختيار ملف" };
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      data: null,
      error: "نوع الملف غير مدعوم (PDF، صورة، Word، Excel فقط)",
    };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${caseId}/${Date.now()}-${safeName}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("case-attachments")
    .upload(storagePath, bytes, { contentType: file.type, upsert: false });

  if (uploadError) return { data: null, error: uploadError.message };

  // Store the storage path (not a public URL) — signed URLs are generated on demand
  const { data: row, error: dbError } = await supabase
    .from("case_attachments")
    .insert({
      case_id: caseId,
      file_name: file.name,
      file_url: storagePath,
      file_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();

  if (dbError) return { data: null, error: dbError.message };

  revalidatePath(`/cases/${caseId}`);
  return {
    data: {
      id: row.id,
      caseId: row.case_id,
      fileName: row.file_name,
      fileUrl: row.file_url,
      fileType: row.file_type,
      fileSize: row.file_size,
      uploadedAt: row.uploaded_at,
    },
    error: null,
  };
}

export async function deleteCaseAttachment(
  caseId: string,
  attachmentId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: att } = await supabase
    .from("case_attachments")
    .select("file_url")
    .eq("id", attachmentId)
    .single();

  if (att?.file_url) {
    // Support both old full URLs and new plain storage paths
    const match = att.file_url.match(/\/case-attachments\/(.+)$/);
    const storagePath = match ? match[1] : att.file_url.replace(/^\//, "");
    await supabase.storage.from("case-attachments").remove([storagePath]);
  }

  const { error } = await supabase
    .from("case_attachments")
    .delete()
    .eq("id", attachmentId);

  revalidatePath(`/cases/${caseId}`);
  return { error: error?.message ?? null };
}

// ─── Signed URL ──────────────────────────────────────────────────────────────

/**
 * Generates a short-lived signed URL (10 min) for a private storage object.
 * Uses the admin client to bypass RLS — auth check is enforced here instead.
 */
export async function getCaseFileSignedUrl(
  path: string,
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "غير مصرح" };

  const cleanPath = path.replace(/^\//, "");
  if (!cleanPath) return { url: null, error: "مسار الملف غير صالح" };

  // Use admin client to guarantee access regardless of storage RLS policies
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("case-attachments")
    .createSignedUrl(cleanPath, 60 * 10); // 10 minutes

  if (error) {
    console.error(
      "[storage] createSignedUrl error:",
      error.message,
      "| path:",
      cleanPath,
    );
    return { url: null, error: error.message };
  }

  return { url: data?.signedUrl ?? null, error: null };
}
