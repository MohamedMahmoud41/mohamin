"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  User,
  MessageSquarePlus,
  Paperclip,
  Plus,
  Pencil,
  Trash,
  Save,
  X,
  ChevronRight,
} from "lucide-react";
import {
  updateCase,
  addCaseNote,
  deleteCaseNote,
  addCaseSession,
  deleteCaseSession,
} from "@/app/actions/cases";
import type {
  Case,
  CaseSession,
  CaseNote,
  CaseAttachment,
  Court,
  Lawyer,
  User as UserType,
} from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditCaseFormProps {
  caseItem: Case;
  sessions: CaseSession[];
  notes: CaseNote[];
  attachments: CaseAttachment[];
  courts: Court[];
  lawyers: Lawyer[];
  currentUser: UserType;
}

interface FormData {
  caseTitle: string;
  caseType: string;
  caseStatus: string;
  caseDescription: string;
  startDate: string;
  nextSessionDate: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  opponentName: string;
  opponentEmail: string;
  opponentPhone: string;
  opponentAddress: string;
  courtName: string;
  courtHall: string;
  lawyerID: string;
  lawyerName: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PHONE_RE = /^01[0-9]{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("ar-EG");
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("ar-EG")} — ${d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return dateStr;
  }
}

function toDatetimeLocal(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm p-6 text-right">
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  color = "text-secondary",
}: {
  icon: React.ElementType;
  title: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <Icon className={`w-6 h-6 ${color}`} />
      <h2 className="text-text-primary text-2xl font-semibold">{title}</h2>
    </div>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-primary text-sm font-bold mb-2 block">
      {children}
      {required && " *"}
    </label>
  );
}

const inputClass =
  "p-3 bg-surface border-2 border-border rounded-lg text-text-primary focus:outline-1 focus:outline-primary w-full";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditCaseForm({
  caseItem,
  sessions,
  notes,
  attachments,
  courts,
  lawyers,
  currentUser,
}: EditCaseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCourtSuggestions, setShowCourtSuggestions] = useState(false);

  // Form data initialized from case
  const [formData, setFormData] = useState<FormData>({
    caseTitle: caseItem.caseTitle || "",
    caseType: caseItem.caseType || "",
    caseStatus: caseItem.caseStatus || "",
    caseDescription: caseItem.caseDescription || "",
    startDate: caseItem.startDate ? caseItem.startDate.slice(0, 10) : "",
    nextSessionDate: toDatetimeLocal(caseItem.nextSessionDate),
    clientName: caseItem.clientName || "",
    clientEmail: caseItem.clientEmail || "",
    clientPhone: caseItem.clientPhone || "",
    clientAddress: (caseItem as any).clientAddress || "",
    opponentName: caseItem.opponentName || "",
    opponentEmail: (caseItem as any).opponentEmail || "",
    opponentPhone: caseItem.opponentPhone || "",
    opponentAddress: (caseItem as any).opponentAddress || "",
    courtName: caseItem.courtName || "",
    courtHall: (caseItem as any).courtHall || "",
    lawyerID: caseItem.lawyerID || "",
    lawyerName: "",
  });

  // Sessions state
  const [localSessions, setLocalSessions] = useState<CaseSession[]>(sessions);
  const [newSession, setNewSession] = useState({ datetime: "", notes: "" });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Notes state
  const [localNotes, setLocalNotes] = useState<CaseNote[]>(notes);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Attachments state
  const [localAttachments] = useState<CaseAttachment[]>(attachments);
  const [isUploading] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm(): string | null {
    if (!formData.caseTitle.trim()) return "عنوان القضية مطلوب";
    if (!formData.clientName.trim()) return "اسم الموكل مطلوب";
    if (!formData.courtName.trim()) return "اسم المحكمة مطلوب";
    if (formData.clientPhone && !PHONE_RE.test(formData.clientPhone))
      return "رقم هاتف الموكل غير صحيح (يجب أن يبدأ بـ 01 ويتكون من 11 رقم)";
    if (formData.clientEmail && !EMAIL_RE.test(formData.clientEmail))
      return "البريد الإلكتروني للموكل غير صحيح";
    if (formData.opponentPhone && !PHONE_RE.test(formData.opponentPhone))
      return "رقم هاتف الخصم غير صحيح";
    if (formData.opponentEmail && !EMAIL_RE.test(formData.opponentEmail))
      return "البريد الإلكتروني للخصم غير صحيح";
    if (
      formData.nextSessionDate &&
      new Date(formData.nextSessionDate) <= new Date()
    )
      return "تاريخ الجلسة القادمة يجب أن يكون في المستقبل";
    return null;
  }

  function handleSave() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    startTransition(async () => {
      const payload: Partial<Case> = {
        caseTitle: formData.caseTitle,
        caseType: formData.caseType,
        caseStatus: formData.caseStatus,
        caseDescription: formData.caseDescription,
        startDate: formData.startDate || "",
        nextSessionDate: formData.nextSessionDate || null,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        opponentName: formData.opponentName,
        opponentPhone: formData.opponentPhone,
        courtName: formData.courtName,
        lawyerID: formData.lawyerID || currentUser.id,
      };
      const result = await updateCase(caseItem.id, payload);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push(`/cases/${caseItem.id}`);
      router.refresh();
    });
  }

  // Sessions
  function handleAddSession() {
    if (!newSession.datetime) return;
    startTransition(async () => {
      if (editingSessionId) {
        // Inline optimistic update for edit (update via action not shown in old code — just delete+add)
        const sessionData = {
          sessionDate: newSession.datetime,
          notes: newSession.notes,
        };
        await deleteCaseSession(caseItem.id, editingSessionId);
        const result = await addCaseSession(caseItem.id, sessionData);
        if (!result?.error) {
          setLocalSessions((prev) =>
            prev
              .filter((s) => s.id !== editingSessionId)
              .concat({
                id: result.data?.id ?? Date.now().toString(),
                caseId: caseItem.id,
                sessionDate: newSession.datetime,
                notes: newSession.notes,
                createdAt: new Date().toISOString(),
              }),
          );
        }
        setEditingSessionId(null);
      } else {
        const sessionData = {
          sessionDate: newSession.datetime,
          notes: newSession.notes,
        };
        const result = await addCaseSession(caseItem.id, sessionData);
        if (!result?.error) {
          setLocalSessions((prev) => [
            ...prev,
            {
              id: result.data?.id ?? Date.now().toString(),
              caseId: caseItem.id,
              sessionDate: newSession.datetime,
              notes: newSession.notes,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      }
      setNewSession({ datetime: "", notes: "" });
    });
  }

  function handleEditSession(session: CaseSession) {
    setEditingSessionId(session.id);
    setNewSession({
      datetime: toDatetimeLocal(session.sessionDate),
      notes: session.notes || "",
    });
  }

  function handleDeleteSession(sessionId: string) {
    startTransition(async () => {
      await deleteCaseSession(caseItem.id, sessionId);
      setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId));
    });
  }

  // Notes
  function handleAddNote() {
    if (!newNote.trim()) return;
    startTransition(async () => {
      if (editingNoteId) {
        // Re-add as new note (old approach) — just update optimistically
        const noteData = {
          noteTitle: "",
          noteOwner: `${currentUser.firstName} ${currentUser.lastName}`,
        };
        await deleteCaseNote(caseItem.id, editingNoteId);
        const result = await addCaseNote(caseItem.id, noteData);
        if (!result?.error) {
          setLocalNotes((prev) =>
            prev
              .filter((n) => n.id !== editingNoteId)
              .concat({
                id: result.data?.id ?? Date.now().toString(),
                caseId: caseItem.id,
                noteTitle: "",
                notes: newNote,
                noteOwner: `${currentUser.firstName} ${currentUser.lastName}`,
                noteDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              }),
          );
        }
        setEditingNoteId(null);
      } else {
        const noteData = {
          noteTitle: "",
          noteOwner: `${currentUser.firstName} ${currentUser.lastName}`,
        };
        const result = await addCaseNote(caseItem.id, noteData);
        if (!result?.error) {
          setLocalNotes((prev) => [
            ...prev,
            {
              id: result.data?.id ?? Date.now().toString(),
              caseId: caseItem.id,
              noteTitle: "",
              notes: newNote,
              noteOwner: `${currentUser.firstName} ${currentUser.lastName}`,
              noteDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      }
      setNewNote("");
    });
  }

  function handleEditNote(note: CaseNote) {
    setEditingNoteId(note.id);
    setNewNote(note.notes || "");
  }

  function handleDeleteNote(noteId: string) {
    startTransition(async () => {
      await deleteCaseNote(caseItem.id, noteId);
      setLocalNotes((prev) => prev.filter((n) => n.id !== noteId));
    });
  }

  // ─── Court suggestions ───────────────────────────────────────────────────────

  const courtMatches = courts.filter((c) =>
    c.name.toLowerCase().includes((formData.courtName || "").toLowerCase()),
  );

  // ─── Sessions display ────────────────────────────────────────────────────────

  const now = new Date();
  const sortedSessions = [...localSessions].sort(
    (a, b) =>
      new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
  );
  const upcomingSessions = sortedSessions.filter(
    (s) => new Date(s.sessionDate) > now,
  );
  const pastSessions = sortedSessions
    .filter((s) => new Date(s.sessionDate) <= now)
    .reverse();
  const displaySessions = [...upcomingSessions, ...pastSessions];

  // Owner check — if the case is a private case of this user, they can't reassign it
  const isOwner = currentUser.role.includes("officeOwner");
  const isPrivateCase = currentUser.privateCasesIds?.includes(caseItem.id);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div dir="rtl" className="min-h-screen bg-background p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseItem.id}`}
            className="p-2 hover:bg-surface rounded-lg text-text-muted transition"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-text-primary text-2xl font-bold">
              تعديل القضية
            </h1>
            <p className="text-text-muted text-sm">
              #{caseItem.id.substring(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/cases/${caseItem.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-beige-light transition font-semibold"
          >
            <X className="w-4 h-4" />
            إلغاء
          </Link>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-4 p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Basic Info */}
          <SectionCard>
            <SectionHeader icon={Scale} title="معلومات القضية" />
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel required>عنوان القضية</FieldLabel>
                <input
                  className={inputClass}
                  value={formData.caseTitle}
                  onChange={(e) => handleChange("caseTitle", e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>رقم القضية</FieldLabel>
                <input
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                  value={caseItem.id.substring(0, 8)}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>نوع القضية</FieldLabel>
                  <select
                    className={inputClass}
                    value={formData.caseType}
                    onChange={(e) => handleChange("caseType", e.target.value)}
                  >
                    <option value="">اختر نوع القضية</option>
                    {[
                      "مدني",
                      "جنائي",
                      "تجاري",
                      "إداري",
                      "أسرة",
                      "عمالي",
                      "أخرى",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>حالة القضية</FieldLabel>
                  <select
                    className={inputClass}
                    value={formData.caseStatus}
                    onChange={(e) => handleChange("caseStatus", e.target.value)}
                  >
                    <option value="">اختر الحالة</option>
                    <option value="نشطة">نشطة</option>
                    <option value="قيد الانتظار">قيد الانتظار</option>
                    <option value="مكتملة">مكتملة</option>
                    <option value="closed">مغلقة</option>
                  </select>
                </div>
              </div>
              <div>
                <FieldLabel>وصف القضية</FieldLabel>
                <textarea
                  className={`${inputClass} min-h-[100px] resize-y`}
                  value={formData.caseDescription}
                  onChange={(e) =>
                    handleChange("caseDescription", e.target.value)
                  }
                />
              </div>
            </div>
          </SectionCard>

          {/* Client Info */}
          <SectionCard>
            <SectionHeader icon={User} title="معلومات الموكل" />
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel required>اسم الموكل</FieldLabel>
                <input
                  className={inputClass}
                  value={formData.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>البريد الإلكتروني</FieldLabel>
                  <input
                    className={inputClass}
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      handleChange("clientEmail", e.target.value)
                    }
                  />
                </div>
                <div>
                  <FieldLabel>رقم الهاتف</FieldLabel>
                  <input
                    className={inputClass}
                    value={formData.clientPhone}
                    onChange={(e) =>
                      handleChange("clientPhone", e.target.value)
                    }
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
              <div>
                <FieldLabel>العنوان</FieldLabel>
                <input
                  className={inputClass}
                  value={formData.clientAddress}
                  onChange={(e) =>
                    handleChange("clientAddress", e.target.value)
                  }
                />
              </div>
            </div>
          </SectionCard>

          {/* Opponent Info */}
          <SectionCard>
            <SectionHeader
              icon={User}
              title="معلومات الخصم"
              color="text-error"
            />
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel>اسم الخصم</FieldLabel>
                <input
                  className={inputClass}
                  value={formData.opponentName}
                  onChange={(e) => handleChange("opponentName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>البريد الإلكتروني</FieldLabel>
                  <input
                    className={inputClass}
                    type="email"
                    value={formData.opponentEmail}
                    onChange={(e) =>
                      handleChange("opponentEmail", e.target.value)
                    }
                  />
                </div>
                <div>
                  <FieldLabel>رقم الهاتف</FieldLabel>
                  <input
                    className={inputClass}
                    value={formData.opponentPhone}
                    onChange={(e) =>
                      handleChange("opponentPhone", e.target.value)
                    }
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
              <div>
                <FieldLabel>العنوان</FieldLabel>
                <input
                  className={inputClass}
                  value={formData.opponentAddress}
                  onChange={(e) =>
                    handleChange("opponentAddress", e.target.value)
                  }
                />
              </div>
            </div>
          </SectionCard>

          {/* Court Info */}
          <SectionCard>
            <SectionHeader icon={Scale} title="معلومات المحكمة" />
            <div className="flex flex-col gap-4">
              {/* Court name with autocomplete */}
              <div className="relative">
                <FieldLabel required>المحكمة</FieldLabel>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.courtName}
                  onChange={(e) => {
                    handleChange("courtName", e.target.value);
                    setShowCourtSuggestions(true);
                  }}
                  onFocus={() => setShowCourtSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowCourtSuggestions(false), 200)
                  }
                  autoComplete="off"
                  placeholder="اختر محكمة أو اكتب اسم جديد"
                />
                {showCourtSuggestions && (
                  <ul className="absolute z-10 w-full bg-surface border border-border mt-1 rounded-lg max-h-60 overflow-auto shadow-lg top-full left-0">
                    {courtMatches.map((court) => (
                      <li
                        key={court.id}
                        className="p-3 hover:bg-beige-light cursor-pointer text-text-primary border-b border-border/50 last:border-0"
                        onClick={() => {
                          handleChange("courtName", court.name);
                          setShowCourtSuggestions(false);
                        }}
                      >
                        {court.name}
                      </li>
                    ))}
                    {courtMatches.length === 0 && (
                      <li className="p-3 text-text-muted text-sm">
                        لا توجد نتائج (سيتم حفظ الاسم الجديد)
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div>
                <FieldLabel>القاعة</FieldLabel>
                <input
                  className={inputClass}
                  value={formData.courtHall}
                  onChange={(e) => handleChange("courtHall", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>تاريخ البدء</FieldLabel>
                  <input
                    type="date"
                    className={inputClass}
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>الجلسة القادمة</FieldLabel>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={formData.nextSessionDate}
                    onChange={(e) =>
                      handleChange("nextSessionDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Sessions */}
          <SectionCard>
            <h2 className="text-text-primary text-2xl font-semibold mb-6">
              تواريخ الجلسات
            </h2>

            {/* Add/Edit session */}
            <div className="w-full bg-beige-light rounded-lg p-5 border border-border flex flex-col gap-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={newSession.datetime}
                  onChange={(e) =>
                    setNewSession({ ...newSession, datetime: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="ملاحظات الجلسة"
                  className={inputClass}
                  value={newSession.notes}
                  onChange={(e) =>
                    setNewSession({ ...newSession, notes: e.target.value })
                  }
                />
              </div>
              <button
                onClick={handleAddSession}
                disabled={isPending}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold transition disabled:opacity-50 ${editingSessionId ? "bg-secondary text-white hover:bg-secondary-dark" : "bg-primary text-background hover:bg-primary-dark"}`}
              >
                {editingSessionId ? (
                  <Pencil className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {editingSessionId ? "تحديث الجلسة" : "إضافة جلسة"}
              </button>
              {editingSessionId && (
                <button
                  onClick={() => {
                    setEditingSessionId(null);
                    setNewSession({ datetime: "", notes: "" });
                  }}
                  className="text-text-muted text-sm hover:text-error transition"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            {/* Sessions list */}
            {displaySessions.map((session) => {
              const isPast = new Date(session.sessionDate) <= now;
              return (
                <div
                  key={session.id}
                  className={`w-full border border-border rounded-lg bg-surface p-5 flex items-center justify-between mb-4 ${isPast ? "opacity-75" : ""}`}
                >
                  <div className="flex flex-col text-right">
                    <span
                      className={`font-semibold text-lg ${isPast ? "text-text-muted line-through" : "text-text-primary"}`}
                    >
                      {formatDateTime(session.sessionDate)}
                    </span>
                    {session.notes && (
                      <span className="text-text-muted text-sm mt-1">
                        {session.notes}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-bold ${!isPast ? "bg-primary-light text-background" : "text-text-muted bg-beige-light border border-border"}`}
                    >
                      {isPast ? "منتهية" : "قادمة"}
                    </span>
                    <button
                      onClick={() => handleEditSession(session)}
                      className="p-2 hover:bg-beige-light rounded-full text-secondary transition"
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 hover:bg-beige-light rounded-full text-error transition"
                      title="حذف"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {displaySessions.length === 0 && (
              <p className="text-text-muted text-center py-4">
                لا توجد جلسات مسجلة
              </p>
            )}
          </SectionCard>

          {/* Notes */}
          <SectionCard>
            <SectionHeader
              icon={MessageSquarePlus}
              title="الملاحظات والتحديثات"
              color="text-info"
            />

            <textarea
              placeholder="إضافة ملاحظة أو تحديث جديد..."
              className={`${inputClass} min-h-[100px] resize-y`}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />

            <button
              onClick={handleAddNote}
              disabled={isPending}
              className={`w-full py-3 mt-4 rounded-lg text-lg font-semibold transition flex justify-center items-center gap-2 disabled:opacity-50 ${editingNoteId ? "bg-secondary text-white hover:bg-secondary-dark" : "bg-primary text-background hover:bg-primary-dark"}`}
            >
              {editingNoteId ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {editingNoteId ? "تحديث الملاحظة" : "إضافة ملاحظة"}
            </button>
            {editingNoteId && (
              <button
                onClick={() => {
                  setEditingNoteId(null);
                  setNewNote("");
                }}
                className="w-full text-center mt-2 text-text-muted text-sm hover:text-error transition"
              >
                إلغاء التعديل
              </button>
            )}

            <div className="flex flex-col gap-4 mt-6">
              {[...localNotes]
                .sort(
                  (a, b) =>
                    new Date(b.noteDate).getTime() -
                    new Date(a.noteDate).getTime(),
                )
                .map((note) => (
                  <div
                    key={note.id}
                    className="bg-beige-light border border-border rounded-lg p-4 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-text-muted text-xs font-semibold">
                          {formatDateTime(note.noteDate) ||
                            formatDateTime(note.createdAt)}
                        </span>
                        <span className="text-text-primary font-semibold text-base">
                          {note.noteOwner}
                        </span>
                        {note.noteTitle && (
                          <span className="text-text-muted text-sm font-medium">
                            {note.noteTitle}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1 hover:bg-white rounded text-secondary"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-white rounded text-error"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {note.notes && (
                      <p className="text-text-secondary text-base leading-relaxed mt-2 border-t border-border/50 pt-2">
                        {note.notes}
                      </p>
                    )}
                  </div>
                ))}
              {localNotes.length === 0 && (
                <p className="text-text-muted text-center py-4">
                  لا توجد ملاحظات حتى الآن
                </p>
              )}
            </div>
          </SectionCard>

          {/* Attachments */}
          <SectionCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-text-primary text-xl font-semibold flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-secondary" />
                المرفقات
              </h2>
              <p className="text-text-muted text-sm">
                رفع المرفقات غير متاح حالياً من هذه الصفحة
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {localAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-beige-light"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-surface rounded-lg border border-border">
                      <Paperclip className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col overflow-hidden text-right">
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-primary font-semibold hover:text-secondary truncate block hover:underline"
                        title={att.fileName}
                      >
                        {att.fileName}
                      </a>
                      <span className="text-text-muted text-xs">
                        {formatDate(att.uploadedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {localAttachments.length === 0 && (
                <p className="text-text-muted text-center py-4">
                  لا توجد مرفقات حتى الآن
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Lawyer assignment — owner only and not private case */}
          {isOwner && !isPrivateCase && (
            <SectionCard>
              <h2 className="text-text-primary text-xl font-semibold mb-4">
                المحامي المسؤول
              </h2>
              <FieldLabel>اختر المحامي</FieldLabel>
              <select
                className={`${inputClass} mt-2`}
                value={formData.lawyerID}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedLawyer = lawyers.find(
                    (l) => l.id === selectedId,
                  );
                  setFormData((prev) => ({
                    ...prev,
                    lawyerID: selectedId,
                    lawyerName: selectedLawyer
                      ? `${selectedLawyer.firstName} ${selectedLawyer.lastName}`
                      : "",
                  }));
                }}
              >
                <option value="" disabled>
                  اختر المحامي
                </option>
                {lawyers
                  .filter((l) => l.id !== currentUser.id)
                  .map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.firstName} {lawyer.lastName}
                    </option>
                  ))}
              </select>
            </SectionCard>
          )}

          {/* Quick stats */}
          <SectionCard>
            <h2 className="text-text-primary text-xl font-semibold mb-4">
              إحصائيات سريعة
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <span className="text-text-muted text-base">عدد الجلسات</span>
                <span className="text-text-primary text-xl font-bold">
                  {localSessions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted text-base">عدد الملاحظات</span>
                <span className="text-info text-xl font-bold">
                  {localNotes.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted text-base">عدد المرفقات</span>
                <span className="text-warning text-xl font-bold">
                  {localAttachments.length}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Tips */}
          <SectionCard>
            <h2 className="text-text-primary text-xl font-semibold mb-4">
              نصائح
            </h2>
            <ul className="text-text-muted text-sm flex flex-col gap-2">
              <li>• احرص على تحديث حالة القضية باستمرار</li>
              <li>• أضف ملاحظات بعد كل جلسة لمتابعة التطورات</li>
              <li>• تأكد من صحة بيانات الاتصال بالموكل</li>
              <li>• سجّل مواعيد الجلسات القادمة لتلقي التنبيهات</li>
            </ul>
          </SectionCard>

          {/* Save / Cancel bottom buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="w-full py-3 bg-primary text-background rounded-lg hover:bg-primary-dark transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
            <Link
              href={`/cases/${caseItem.id}`}
              className="w-full py-3 bg-surface border border-border rounded-lg text-text-primary hover:bg-beige-light transition font-semibold flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              إلغاء
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
