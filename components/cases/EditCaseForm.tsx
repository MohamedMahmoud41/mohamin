"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import {
  Scale,
  User,
  MessageSquarePlus,
  Paperclip,
  Plus,
  Pencil,
  Trash,
  Trash2,
  Save,
  X,
  ChevronRight,
  Hash,
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
  CaseType,
  CourtDivision,
  Governorate,
  PoliceStation,
  PartialProsecution,
  Lawyer,
  User as UserType,
  Client,
} from "@/types";
import {
  editCaseSchema,
  zodToFormikValidate,
  type EditCaseFormValues,
} from "@/lib/validations/cases";
import {
  caseCategoryOptions,
  civilDegreeOptions,
  clientRoleOptions,
  clientTypeOptions,
  opponentRoleOptions,
} from "@/lib/enums";
import {
  SearchableSelectField,
  CreatableSelectField,
  MultiSelectField,
} from "@/components/ui/SearchableSelect";
import ClientSelect from "@/components/cases/ClientSelect";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditCaseFormProps {
  caseItem: Case;
  sessions: CaseSession[];
  notes: CaseNote[];
  attachments: CaseAttachment[];
  allCourts: Court[];
  allCaseTypes: CaseType[];
  allCourtDivisions: CourtDivision[];
  allGovernorates: Governorate[];
  allPoliceStations: PoliceStation[];
  allPartialProsecutions: PartialProsecution[];
  lawyers: Lawyer[];
  currentUser: UserType;
  clients: Client[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  allCourts,
  allCaseTypes,
  allCourtDivisions,
  allGovernorates,
  allPoliceStations,
  allPartialProsecutions,
  lawyers,
  currentUser,
  clients,
}: EditCaseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Formik setup
  const formik = useFormik<EditCaseFormValues>({
    initialValues: {
      caseTitle: caseItem.caseTitle || "",
      caseCategory: caseItem.caseCategory || "civil",
      caseStatus: caseItem.caseStatus || "",
      caseDescription: caseItem.caseDescription || "",
      startDate: caseItem.startDate ? caseItem.startDate.slice(0, 10) : "",
      nextSessionDate: toDatetimeLocal(caseItem.nextSessionDate),
      caseNumbers: caseItem.caseNumbers?.length
        ? caseItem.caseNumbers
        : [{ caseNumber: "", caseYear: "" }],
      clientName: caseItem.clientName || "",
      clientType: caseItem.clientType || "فرد",
      clientRole: caseItem.clientRole || "",
      clientEmail: caseItem.clientEmail || "",
      clientPhone: caseItem.clientPhone || "",
      clientAddress: caseItem.clientAddress || "",
      clientNationalId: caseItem.clientNationalId || "",
      opponentName: caseItem.opponentName || "",
      opponentType: caseItem.opponentType || "فرد",
      opponentRole: caseItem.opponentRole || "",
      opponentEmail: caseItem.opponentEmail || "",
      opponentPhone: caseItem.opponentPhone || "",
      opponentAddress: caseItem.opponentAddress || "",
      opponentNationalId: caseItem.opponentNationalId || "",
      civilDegree: caseItem.civilDegree || "",
      courtId: caseItem.courtId || "",
      caseTypeId: caseItem.caseTypeId || "",
      courtDivisionId: caseItem.courtDivisionId || "",
      governorateId: caseItem.governorateId || "",
      policeStationId: caseItem.policeStationId || "",
      partialProsecutionId: caseItem.partialProsecutionId || "",
      personalServiceTypeId: caseItem.personalServiceTypeId || "",
      personalCourtDivisionId: caseItem.personalCourtDivisionId || "",
      familyCourtId: caseItem.familyCourtId || "",
      personalPartialProsecutionId: caseItem.personalPartialProsecutionId || "",
      clientId: caseItem.clientId || "",
      lawyerIDs: caseItem.lawyerIDs?.length
        ? caseItem.lawyerIDs
        : caseItem.lawyerID
          ? [caseItem.lawyerID]
          : [],
    },
    validate: zodToFormikValidate(editCaseSchema),
    onSubmit: (values) => {
      setError(null);
      startTransition(async () => {
        const result = await updateCase(caseItem.id, {
          caseTitle: values.caseTitle,
          caseCategory: values.caseCategory,
          caseStatus: values.caseStatus,
          caseDescription: values.caseDescription,
          startDate: values.startDate || "",
          nextSessionDate: values.nextSessionDate || null,
          caseNumbers: values.caseNumbers,
          clientName: values.clientName,
          clientType: values.clientType,
          clientRole: values.clientRole,
          clientEmail: values.clientEmail,
          clientPhone: values.clientPhone,
          clientAddress: values.clientAddress,
          clientNationalId: values.clientNationalId,
          opponentName: values.opponentName,
          opponentType: values.opponentType,
          opponentRole: values.opponentRole,
          opponentEmail: values.opponentEmail,
          opponentPhone: values.opponentPhone,
          opponentAddress: values.opponentAddress,
          opponentNationalId: values.opponentNationalId,
          civilDegree: values.civilDegree,
          courtId: values.courtId,
          caseTypeId: values.caseTypeId,
          courtDivisionId: values.courtDivisionId,
          governorateId: values.governorateId,
          policeStationId: values.policeStationId,
          partialProsecutionId: values.partialProsecutionId,
          personalServiceTypeId: values.personalServiceTypeId,
          personalCourtDivisionId: values.personalCourtDivisionId,
          familyCourtId: values.familyCourtId,
          personalPartialProsecutionId: values.personalPartialProsecutionId,
          lawyerID: values.lawyerIDs?.[0] || currentUser.id,
          lawyerIDs: values.lawyerIDs?.length
            ? values.lawyerIDs
            : [currentUser.id],
          clientId: values.clientId || undefined,
        });
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.push(`/cases/${caseItem.id}`);
        router.refresh();
      });
    },
  });

  // Helper to get field error (deep path support)
  const fieldError = (name: string) => {
    const parts = name.split(".");
    let touched: unknown = formik.touched;
    let err: unknown = formik.errors;
    for (const p of parts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      touched = (touched as any)?.[p];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      err = (err as any)?.[p];
    }
    return touched && typeof err === "string" ? err : "";
  };

  // ─── Computed filtered lists ──────────────────────────────────────────

  const category = formik.values.caseCategory;
  const civilDegreeVal = formik.values.civilDegree;
  const selectedCourtId = formik.values.courtId;
  const selectedGovernorateId = formik.values.governorateId;

  const civilCourts =
    civilDegreeVal === "partial" || !civilDegreeVal
      ? []
      : allCourts.filter((c) => c.courtDegree === civilDegreeVal);
  const civilCaseTypes = selectedCourtId
    ? allCaseTypes.filter(
        (ct) =>
          ct.category === "civil" && ct.courtIds.includes(selectedCourtId),
      )
    : [];
  const criminalDivisions = allCourtDivisions.filter(
    (d) => d.category === "criminal",
  );
  const criminalPoliceStations = selectedGovernorateId
    ? allPoliceStations.filter(
        (ps) => ps.governorateId === selectedGovernorateId,
      )
    : [];
  const criminalCourts = selectedGovernorateId
    ? allCourts.filter((c) => c.governorateId === selectedGovernorateId)
    : [];
  const personalServiceTypes = allCaseTypes.filter(
    (ct) => ct.category === "personal",
  );
  const personalDivisions = allCourtDivisions.filter(
    (d) => d.category === "personal",
  );
  const familyCourts = allCourts.filter((c) => c.courtDegree === "family");

  // ─── Reset dependent fields on parent change ─────────────────────────

  const resetCategoryFields = useCallback(() => {
    formik.setFieldValue("civilDegree", "");
    formik.setFieldValue("courtId", "");
    formik.setFieldValue("caseTypeId", "");
    formik.setFieldValue("courtDivisionId", "");
    formik.setFieldValue("governorateId", "");
    formik.setFieldValue("policeStationId", "");
    formik.setFieldValue("partialProsecutionId", "");
    formik.setFieldValue("personalServiceTypeId", "");
    formik.setFieldValue("personalCourtDivisionId", "");
    formik.setFieldValue("familyCourtId", "");
    formik.setFieldValue("personalPartialProsecutionId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [prevCategory, setPrevCategory] = useState(category);
  useEffect(() => {
    if (category !== prevCategory) {
      resetCategoryFields();
      setPrevCategory(category);
    }
  }, [category, prevCategory, resetCategoryFields]);

  const [prevDegree, setPrevDegree] = useState(civilDegreeVal);
  useEffect(() => {
    if (civilDegreeVal !== prevDegree) {
      formik.setFieldValue("courtId", "");
      formik.setFieldValue("caseTypeId", "");
      setPrevDegree(civilDegreeVal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [civilDegreeVal, prevDegree]);

  const [prevCourt, setPrevCourt] = useState(selectedCourtId);
  useEffect(() => {
    if (selectedCourtId !== prevCourt) {
      formik.setFieldValue("caseTypeId", "");
      setPrevCourt(selectedCourtId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourtId, prevCourt]);

  const [prevGov, setPrevGov] = useState(selectedGovernorateId);
  useEffect(() => {
    if (selectedGovernorateId !== prevGov) {
      formik.setFieldValue("policeStationId", "");
      formik.setFieldValue("courtId", "");
      setPrevGov(selectedGovernorateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGovernorateId, prevGov]);

  // ─── Case Numbers ─────────────────────────────────────────────────────

  const addCaseNumber = () => {
    const current = formik.values.caseNumbers;
    if (current.length < 5)
      formik.setFieldValue("caseNumbers", [
        ...current,
        { caseNumber: "", caseYear: "" },
      ]);
  };
  const removeCaseNumber = (index: number) => {
    const current = formik.values.caseNumbers;
    if (current.length > 1)
      formik.setFieldValue(
        "caseNumbers",
        current.filter((_, i) => i !== index),
      );
  };

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

  async function handleSave() {
    // Touch all fields to show errors
    const allFields = Object.keys(
      formik.values,
    ) as (keyof EditCaseFormValues)[];
    allFields.forEach((f) => formik.setFieldTouched(f, true));
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      setError("يرجى تصحيح الأخطاء قبل الحفظ");
      return;
    }
    formik.handleSubmit();
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
          setLocalSessions((prev) => [
            ...prev.filter((s) => s.id !== editingSessionId),
            {
              id: result.data?.id ?? Date.now().toString(),
              caseId: caseItem.id,
              sessionDate: newSession.datetime,
              status: "upcoming" as const,
              notes: newSession.notes,
              createdAt: new Date().toISOString(),
            },
          ]);
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
              status: "upcoming" as const,
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
          notes: newNote,
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
          notes: newNote,
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
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
                  name="caseTitle"
                  className={inputClass}
                  value={formik.values.caseTitle}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {fieldError("caseTitle") && (
                  <p className="text-error text-xs mt-1">
                    {fieldError("caseTitle")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SearchableSelectField
                  name="caseCategory"
                  label="تصنيف القضية *"
                  value={formik.values.caseCategory}
                  onChange={(val) => formik.setFieldValue("caseCategory", val)}
                  onBlur={() => formik.setFieldTouched("caseCategory", true)}
                  error={fieldError("caseCategory")}
                  placeholder="اختر تصنيف القضية"
                  options={caseCategoryOptions}
                />
                <SearchableSelectField
                  name="caseStatus"
                  label="حالة القضية"
                  value={formik.values.caseStatus}
                  onChange={(val) => formik.setFieldValue("caseStatus", val)}
                  onBlur={() => formik.setFieldTouched("caseStatus", true)}
                  placeholder="اختر الحالة"
                  options={[
                    { value: "جارية", label: "جارية" },
                    { value: "قيد الانتظار", label: "قيد الانتظار" },
                    {
                      value: "منتهية لصالح الموكل",
                      label: "منتهية لصالح الموكل",
                    },
                    { value: "مغلقة", label: "مغلقة" },
                  ]}
                />
              </div>

              {/* Case Numbers */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={addCaseNumber}
                    disabled={formik.values.caseNumbers.length >= 5}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" /> إضافة رقم
                  </button>
                  <FieldLabel required>أرقام القضية</FieldLabel>
                </div>
                {formik.values.caseNumbers.map((cn, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-background p-3 rounded-lg border border-border"
                  >
                    {formik.values.caseNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCaseNumber(idx)}
                        className="mt-3 text-error hover:text-error/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-text-muted text-xs">
                          رقم القضية
                        </label>
                        <div className="relative">
                          <input
                            name={`caseNumbers.${idx}.caseNumber`}
                            value={cn.caseNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="p-3 w-full bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary pr-9 placeholder:text-text-muted"
                            placeholder="مثال: 1234"
                          />
                          <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        </div>
                        {fieldError(`caseNumbers.${idx}.caseNumber`) && (
                          <p className="text-error text-xs">
                            {fieldError(`caseNumbers.${idx}.caseNumber`)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-text-muted text-xs">السنة</label>
                        <input
                          name={`caseNumbers.${idx}.caseYear`}
                          value={cn.caseYear}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="p-3 w-full bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted"
                          placeholder="مثال: 2026"
                        />
                        {fieldError(`caseNumbers.${idx}.caseYear`) && (
                          <p className="text-error text-xs">
                            {fieldError(`caseNumbers.${idx}.caseYear`)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {typeof formik.errors.caseNumbers === "string" && (
                  <p className="text-error text-xs">
                    {formik.errors.caseNumbers}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel>وصف القضية</FieldLabel>
                <textarea
                  name="caseDescription"
                  className={`${inputClass} min-h-[100px] resize-y`}
                  value={formik.values.caseDescription}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {fieldError("caseDescription") && (
                  <p className="text-error text-xs mt-1">
                    {fieldError("caseDescription")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>تاريخ البدء</FieldLabel>
                  <input
                    type="date"
                    name="startDate"
                    className={inputClass}
                    value={formik.values.startDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div>
                  <FieldLabel>الجلسة القادمة</FieldLabel>
                  <input
                    type="datetime-local"
                    name="nextSessionDate"
                    className={inputClass}
                    value={formik.values.nextSessionDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {fieldError("nextSessionDate") && (
                    <p className="text-error text-xs mt-1">
                      {fieldError("nextSessionDate")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Client Info */}
          <SectionCard>
            <SectionHeader icon={User} title="بيانات العميل" />
            <div className="flex flex-col gap-4">
              {/* Client Selector */}
              <ClientSelect
                clients={clients}
                selectedClientId={formik.values.clientId}
                onClientSelect={(client) => {
                  formik.setFieldValue("clientId", client?.id || "");
                }}
                onFillFields={(client) => {
                  formik.setFieldValue("clientName", client.name);
                  formik.setFieldValue(
                    "clientType",
                    client.type === "company" ? "شركة" : "فرد",
                  );
                  formik.setFieldValue("clientPhone", client.phone);
                  formik.setFieldValue("clientEmail", client.email);
                  formik.setFieldValue("clientAddress", client.address);
                  formik.setFieldValue("clientNationalId", client.nationalId);
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>اسم الموكل</FieldLabel>
                  <input
                    name="clientName"
                    className={inputClass}
                    value={formik.values.clientName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {fieldError("clientName") && (
                    <p className="text-error text-xs mt-1">
                      {fieldError("clientName")}
                    </p>
                  )}
                </div>
                <SearchableSelectField
                  name="clientType"
                  label="نوع الموكل"
                  value={formik.values.clientType ?? ""}
                  onChange={(val) => formik.setFieldValue("clientType", val)}
                  onBlur={() => formik.setFieldTouched("clientType", true)}
                  error={fieldError("clientType")}
                  placeholder="اختر النوع"
                  options={clientTypeOptions}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CreatableSelectField
                  name="clientRole"
                  label="صفة الموكل"
                  value={formik.values.clientRole}
                  onChange={(val) => formik.setFieldValue("clientRole", val)}
                  onBlur={() => formik.setFieldTouched("clientRole", true)}
                  error={fieldError("clientRole")}
                  placeholder="اختر أو اكتب صفة الموكل"
                  options={clientRoleOptions}
                />
                <div>
                  <FieldLabel>رقم الهاتف</FieldLabel>
                  <input
                    name="clientPhone"
                    className={inputClass}
                    value={formik.values.clientPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="01XXXXXXXXX"
                  />
                  {fieldError("clientPhone") && (
                    <p className="text-error text-xs mt-1">
                      {fieldError("clientPhone")}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>البريد الإلكتروني</FieldLabel>
                  <input
                    name="clientEmail"
                    className={inputClass}
                    type="email"
                    value={formik.values.clientEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {fieldError("clientEmail") && (
                    <p className="text-error text-xs mt-1">
                      {fieldError("clientEmail")}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel>الرقم القومي</FieldLabel>
                  <input
                    name="clientNationalId"
                    className={inputClass}
                    value={formik.values.clientNationalId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="14 رقم"
                  />
                  {fieldError("clientNationalId") && (
                    <p className="text-error text-xs mt-1">
                      {fieldError("clientNationalId")}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <FieldLabel>العنوان</FieldLabel>
                <input
                  name="clientAddress"
                  className={inputClass}
                  value={formik.values.clientAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>اسم الخصم</FieldLabel>
                  <input
                    name="opponentName"
                    className={inputClass}
                    value={formik.values.opponentName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <SearchableSelectField
                  name="opponentType"
                  label="نوع الخصم"
                  value={formik.values.opponentType ?? ""}
                  onChange={(val) => formik.setFieldValue("opponentType", val)}
                  onBlur={() => formik.setFieldTouched("opponentType", true)}
                  error={fieldError("opponentType")}
                  placeholder="اختر نوع الخصم"
                  options={[
                    { value: "فرد", label: "فرد" },
                    { value: "شركة", label: "شركة" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CreatableSelectField
                  name="opponentRole"
                  label="صفة الخصم"
                  value={formik.values.opponentRole ?? ""}
                  onChange={(val) => formik.setFieldValue("opponentRole", val)}
                  onBlur={() => formik.setFieldTouched("opponentRole", true)}
                  error={fieldError("opponentRole")}
                  placeholder="اختر أو اكتب صفة الخصم"
                  options={opponentRoleOptions}
                />
                <div>
                  <FieldLabel>الرقم القومي</FieldLabel>
                  <input
                    name="opponentNationalId"
                    className={inputClass}
                    value={formik.values.opponentNationalId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="14 رقم"
                  />
                  {fieldError("opponentNationalId") && (
                    <p className="text-error text-xs mt-1">
                      {fieldError("opponentNationalId")}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>البريد الإلكتروني</FieldLabel>
                  <input
                    name="opponentEmail"
                    className={inputClass}
                    type="email"
                    value={formik.values.opponentEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {fieldError("opponentEmail") && (
                    <p className="text-error text-xs mt-1">
                      {fieldError("opponentEmail")}
                    </p>
                  )}
                </div>
                <div>
                  <FieldLabel>رقم الهاتف</FieldLabel>
                  <input
                    name="opponentPhone"
                    className={inputClass}
                    value={formik.values.opponentPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="01XXXXXXXXX"
                  />
                  {fieldError("opponentPhone") && (
                    <p className="text-error text-xs mt-1">
                      {fieldError("opponentPhone")}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <FieldLabel>العنوان</FieldLabel>
                <input
                  name="opponentAddress"
                  className={inputClass}
                  value={formik.values.opponentAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>
          </SectionCard>

          {/* Dynamic Court/Category Fields */}
          <SectionCard>
            <SectionHeader icon={Scale} title="بيانات المحكمة والتوزيع" />

            {/* Civil Fields */}
            {category === "civil" && (
              <div className="flex flex-col gap-4">
                <SearchableSelectField
                  name="civilDegree"
                  label="الدرجة *"
                  value={formik.values.civilDegree}
                  onChange={(val) => formik.setFieldValue("civilDegree", val)}
                  onBlur={() => formik.setFieldTouched("civilDegree", true)}
                  error={fieldError("civilDegree")}
                  placeholder="اختر الدرجة"
                  options={civilDegreeOptions}
                />
                {civilDegreeVal && (
                  <SearchableSelectField
                    name="courtId"
                    label={
                      civilDegreeVal === "partial"
                        ? "النيابة الجزئية"
                        : "المحكمة"
                    }
                    value={formik.values.courtId}
                    onChange={(val) => formik.setFieldValue("courtId", val)}
                    onBlur={() => formik.setFieldTouched("courtId", true)}
                    error={fieldError("courtId")}
                    placeholder={
                      civilDegreeVal === "partial"
                        ? "اختر النيابة"
                        : "اختر المحكمة"
                    }
                    options={
                      civilDegreeVal === "partial"
                        ? allPartialProsecutions.map((pp) => ({
                            value: pp.id,
                            label: pp.name,
                          }))
                        : civilCourts.map((c) => ({
                            value: c.id,
                            label: c.name,
                          }))
                    }
                  />
                )}
                {selectedCourtId && civilDegreeVal !== "partial" && (
                  <SearchableSelectField
                    name="caseTypeId"
                    label="نوع القضية"
                    value={formik.values.caseTypeId}
                    onChange={(val) => formik.setFieldValue("caseTypeId", val)}
                    onBlur={() => formik.setFieldTouched("caseTypeId", true)}
                    placeholder="اختر نوع القضية"
                    options={civilCaseTypes.map((ct) => ({
                      value: ct.id,
                      label: ct.name,
                    }))}
                  />
                )}
              </div>
            )}

            {/* Criminal Fields */}
            {category === "criminal" && (
              <div className="flex flex-col gap-4">
                <SearchableSelectField
                  name="courtDivisionId"
                  label="الدائرة *"
                  value={formik.values.courtDivisionId}
                  onChange={(val) =>
                    formik.setFieldValue("courtDivisionId", val)
                  }
                  onBlur={() => formik.setFieldTouched("courtDivisionId", true)}
                  error={fieldError("courtDivisionId")}
                  placeholder="اختر الدائرة"
                  options={criminalDivisions.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                />
                <SearchableSelectField
                  name="governorateId"
                  label="المحافظة *"
                  value={formik.values.governorateId}
                  onChange={(val) => formik.setFieldValue("governorateId", val)}
                  onBlur={() => formik.setFieldTouched("governorateId", true)}
                  error={fieldError("governorateId")}
                  placeholder="اختر المحافظة"
                  options={allGovernorates.map((g) => ({
                    value: g.id,
                    label: g.name,
                  }))}
                />
                {selectedGovernorateId && (
                  <>
                    <SearchableSelectField
                      name="policeStationId"
                      label="جهة القيد (قسم الشرطة)"
                      value={formik.values.policeStationId}
                      onChange={(val) =>
                        formik.setFieldValue("policeStationId", val)
                      }
                      onBlur={() =>
                        formik.setFieldTouched("policeStationId", true)
                      }
                      placeholder="اختر قسم الشرطة"
                      options={criminalPoliceStations.map((ps) => ({
                        value: ps.id,
                        label: ps.name,
                      }))}
                    />
                    <SearchableSelectField
                      name="courtId"
                      label="المحكمة"
                      value={formik.values.courtId}
                      onChange={(val) => formik.setFieldValue("courtId", val)}
                      onBlur={() => formik.setFieldTouched("courtId", true)}
                      placeholder="اختر المحكمة"
                      options={criminalCourts.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                    />
                  </>
                )}
                <SearchableSelectField
                  name="partialProsecutionId"
                  label="النيابة الجزئية"
                  value={formik.values.partialProsecutionId}
                  onChange={(val) =>
                    formik.setFieldValue("partialProsecutionId", val)
                  }
                  onBlur={() =>
                    formik.setFieldTouched("partialProsecutionId", true)
                  }
                  placeholder="اختر النيابة"
                  options={allPartialProsecutions.map((pp) => ({
                    value: pp.id,
                    label: pp.name,
                  }))}
                />
              </div>
            )}

            {/* Personal Fields */}
            {category === "personal" && (
              <div className="flex flex-col gap-4">
                <SearchableSelectField
                  name="personalServiceTypeId"
                  label="نوع الخدمة *"
                  value={formik.values.personalServiceTypeId}
                  onChange={(val) =>
                    formik.setFieldValue("personalServiceTypeId", val)
                  }
                  onBlur={() =>
                    formik.setFieldTouched("personalServiceTypeId", true)
                  }
                  error={fieldError("personalServiceTypeId")}
                  placeholder="اختر نوع الخدمة"
                  options={personalServiceTypes.map((st) => ({
                    value: st.id,
                    label: st.name,
                  }))}
                />
                <SearchableSelectField
                  name="personalCourtDivisionId"
                  label="الدائرة *"
                  value={formik.values.personalCourtDivisionId}
                  onChange={(val) =>
                    formik.setFieldValue("personalCourtDivisionId", val)
                  }
                  onBlur={() =>
                    formik.setFieldTouched("personalCourtDivisionId", true)
                  }
                  error={fieldError("personalCourtDivisionId")}
                  placeholder="اختر الدائرة"
                  options={personalDivisions.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                />
                <SearchableSelectField
                  name="familyCourtId"
                  label="النيابة الكلية (محكمة الأسرة)"
                  value={formik.values.familyCourtId}
                  onChange={(val) => formik.setFieldValue("familyCourtId", val)}
                  onBlur={() => formik.setFieldTouched("familyCourtId", true)}
                  placeholder="اختر محكمة الأسرة"
                  options={familyCourts.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
                <SearchableSelectField
                  name="personalPartialProsecutionId"
                  label="النيابة الجزئية"
                  value={formik.values.personalPartialProsecutionId}
                  onChange={(val) =>
                    formik.setFieldValue("personalPartialProsecutionId", val)
                  }
                  onBlur={() =>
                    formik.setFieldTouched("personalPartialProsecutionId", true)
                  }
                  placeholder="اختر النيابة"
                  options={allPartialProsecutions.map((pp) => ({
                    value: pp.id,
                    label: pp.name,
                  }))}
                />
              </div>
            )}

            {!category && (
              <p className="text-text-muted text-sm">
                يرجى اختيار تصنيف القضية لعرض الحقول المناسبة
              </p>
            )}
          </SectionCard>

          {/* Sessions */}
          <SectionCard>
            <h2 className="text-text-primary text-2xl font-semibold mb-6">
              تواريخ الجلسات
            </h2>

            {/* Add/Edit session */}
            <div className="w-full bg-beige-light rounded-lg p-5 border border-border flex flex-col gap-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                المحامين المسؤولين
              </h2>
              <MultiSelectField
                name="lawyerIDs"
                label="اختر محامي أو أكثر"
                values={formik.values.lawyerIDs}
                onChange={(vals) => formik.setFieldValue("lawyerIDs", vals)}
                placeholder="اختر محامي أو أكثر"
                options={[
                  {
                    value: currentUser.id,
                    label: `${currentUser.firstName} ${currentUser.lastName} (أنا)`,
                  },
                  ...lawyers
                    .filter((l) => l.id !== currentUser.id)
                    .map((lawyer) => ({
                      value: lawyer.id,
                      label: `${lawyer.firstName} ${lawyer.lastName}`,
                    })),
                ]}
              />
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
