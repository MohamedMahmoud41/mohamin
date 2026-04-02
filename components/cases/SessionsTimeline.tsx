"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  ClipboardEdit,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarPlus,
  Trash2,
  Gavel,
  Upload,
  ShieldAlert,
} from "lucide-react";
import {
  addCaseSession,
  recordSessionResult,
  deleteCaseSession,
  uploadSessionAttachment,
} from "@/app/actions/cases";
import type { CaseSession, SessionDecision, SessionCategory } from "@/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(date: string | null | undefined) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getSessionDisplayStatus(
  session: CaseSession,
): "upcoming" | "overdue" | "held" {
  if (session.status === "held") return "held";
  if (new Date() > new Date(session.sessionDate)) return "overdue";
  return "upcoming";
}

const DECISION_LABELS: Record<SessionDecision, string> = {
  adjourned: "تأجيل",
  judgment_reserved: "حجز للحكم",
  judged: "صدر الحكم",
};

const CATEGORY_LABELS: Record<SessionCategory, string> = {
  normal: "عادية",
  appeal: "استئناف",
  cassation: "نقض",
};

const CATEGORY_COLORS: Record<SessionCategory, string> = {
  normal: "bg-secondary/20 text-text-secondary",
  appeal: "bg-warning/20 text-warning",
  cassation: "bg-error/20 text-error",
};

const DECISIONS_REQUIRING_NEXT: Array<SessionDecision> = [
  "adjourned",
  "judgment_reserved",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionsTimelineProps {
  sessions: CaseSession[];
  caseId: string;
  onClose: () => void;
  onSessionsChanged: (sessions: CaseSession[]) => void;
}

// ─── Record Result Form ───────────────────────────────────────────────────────

function RecordResultForm({
  session,
  caseId,
  onDone,
  onCancel,
}: {
  session: CaseSession;
  caseId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [decision, setDecision] = useState<SessionDecision | "">("");
  const [notes, setNotes] = useState("");
  const [nextSessionDate, setNextSessionDate] = useState("");
  const [followUpType, setFollowUpType] = useState<
    "appeal" | "cassation" | "none"
  >("none");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requiresNext =
    decision !== "" &&
    DECISIONS_REQUIRING_NEXT.includes(decision as SessionDecision);

  const isJudged = decision === "judged";
  const isMandatorySession = session.isMandatory;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!decision) {
      setError("القرار مطلوب");
      return;
    }
    if (!notes.trim()) {
      setError("الملاحظات مطلوبة");
      return;
    }
    if (requiresNext && !nextSessionDate) {
      setError("تاريخ الجلسة القادمة مطلوب");
      return;
    }
    // Mandatory session: require attachment
    if (isMandatorySession && isJudged && !attachmentFile) {
      setError("يجب إرفاق مستند (صيغة تنفيذية) للجلسات الإلزامية");
      return;
    }
    setError(null);

    startTransition(async () => {
      // 1. Record result
      const { error: err } = await recordSessionResult(caseId, session.id, {
        decision: decision as SessionDecision,
        notes,
        nextSessionDate: requiresNext ? nextSessionDate : null,
        followUpType: isJudged && followUpType !== "none" ? followUpType : null,
      });
      if (err) {
        setError(err);
        return;
      }

      // 2. Upload attachment if provided
      if (attachmentFile) {
        const formData = new FormData();
        formData.append("file", attachmentFile);
        const { error: uploadErr } = await uploadSessionAttachment(
          session.id,
          formData,
        );
        if (uploadErr) {
          setError(uploadErr);
          return;
        }
      }

      onDone();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-4 bg-background border border-border rounded-xl space-y-3"
    >
      <h4 className="text-text-primary font-semibold text-sm">
        تسجيل نتيجة الجلسة
      </h4>

      {/* Decision */}
      <div>
        <label className="block text-text-muted text-xs mb-1">
          القرار <span className="text-error">*</span>
        </label>
        <select
          value={decision}
          onChange={(e) => {
            setDecision(e.target.value as SessionDecision | "");
            setNextSessionDate("");
            setFollowUpType("none");
            setError(null);
          }}
          className="w-full border border-border rounded-lg p-2.5 bg-surface text-text-primary text-sm focus:outline-none focus:border-primary"
        >
          <option value="">— اختر القرار —</option>
          <option value="adjourned">{DECISION_LABELS.adjourned}</option>
          <option value="judgment_reserved">
            {DECISION_LABELS.judgment_reserved}
          </option>
          <option value="judged">{DECISION_LABELS.judged}</option>
        </select>
      </div>

      {/* Follow-up type — shown when decision is "judged" */}
      {isJudged && (
        <div className="p-3 bg-warning/5 border border-warning/30 rounded-xl space-y-2">
          <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Gavel className="w-4 h-4 text-warning" />
            هل تريد إنشاء جلسة متابعة؟
          </p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-primary">
              <input
                type="radio"
                name="followUp"
                value="none"
                checked={followUpType === "none"}
                onChange={() => setFollowUpType("none")}
                className="accent-primary"
              />
              لا — إغلاق القضية
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-primary">
              <input
                type="radio"
                name="followUp"
                value="appeal"
                checked={followUpType === "appeal"}
                onChange={() => setFollowUpType("appeal")}
                className="accent-warning"
              />
              إنشاء جلسة استئناف
              <span className="text-xs text-text-muted">
                (بعد 40 يوم تلقائياً)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-primary">
              <input
                type="radio"
                name="followUp"
                value="cassation"
                checked={followUpType === "cassation"}
                onChange={() => setFollowUpType("cassation")}
                className="accent-error"
              />
              إنشاء جلسة نقض
              <span className="text-xs text-text-muted">
                (بعد 60 يوم تلقائياً)
              </span>
            </label>
          </div>
          {followUpType !== "none" && (
            <p className="text-xs text-warning bg-warning/10 p-2 rounded-lg">
              ⚡ سيتم إنشاء جلسة {followUpType === "appeal" ? "استئناف" : "نقض"}{" "}
              تلقائياً بعد {followUpType === "appeal" ? "40" : "60"} يوم من
              تاريخ الجلسة الحالية
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-text-muted text-xs mb-1">
          الملاحظات <span className="text-error">*</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="أدخل ملاحظات الجلسة..."
          className="w-full border border-border rounded-lg p-2.5 bg-surface text-text-primary text-sm resize-none focus:outline-none focus:border-primary placeholder:text-text-muted"
        />
      </div>

      {/* Next session date — shown only when required */}
      {requiresNext && (
        <div>
          <label className="block text-text-muted text-xs mb-1">
            تاريخ الجلسة القادمة <span className="text-error">*</span>
          </label>
          <input
            type="datetime-local"
            value={nextSessionDate}
            onChange={(e) => setNextSessionDate(e.target.value)}
            min={new Date(new Date(session.sessionDate).getTime() + 60_000)
              .toISOString()
              .slice(0, 16)}
            className="w-full border border-border rounded-lg p-2.5 bg-surface text-text-primary text-sm focus:outline-none focus:border-primary"
          />
          <p className="text-text-muted text-xs mt-1">
            يجب أن يكون بعد تاريخ الجلسة الحالية
          </p>
        </div>
      )}

      {/* Attachment upload — for mandatory sessions when judged */}
      {isMandatorySession && isJudged && (
        <div>
          <label className="block text-text-muted text-xs mb-1">
            المستند (الصيغة التنفيذية) <span className="text-error">*</span>
          </label>
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition">
            <Upload className="w-5 h-5 text-text-muted" />
            <span className="text-sm text-text-secondary">
              {attachmentFile ? attachmentFile.name : "اضغط لاختيار ملف"}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      {error && (
        <p className="text-error text-xs bg-error/10 p-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition"
        >
          {isPending ? "جاري الحفظ..." : "حفظ النتيجة"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border text-text-secondary rounded-lg text-sm hover:bg-beige transition"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SessionsTimeline({
  sessions,
  caseId,
  onClose,
  onSessionsChanged,
}: SessionsTimelineProps) {
  const router = useRouter();
  const [localSessions, setLocalSessions] = useState<CaseSession[]>(sessions);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [addError, setAddError] = useState<string | null>(null);

  const sorted = [...localSessions].sort(
    (a, b) =>
      new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
  );

  const hasUpcoming = localSessions.some((s) => s.status === "upcoming");

  function sync(updated: CaseSession[]) {
    setLocalSessions(updated);
    onSessionsChanged(updated);
  }

  function handleDelete(session: CaseSession) {
    if (session.isMandatory && session.status === "upcoming") {
      // Don't allow deleting mandatory sessions
      return;
    }
    startTransition(async () => {
      const { error } = await deleteCaseSession(caseId, session.id);
      if (!error) {
        sync(localSessions.filter((s) => s.id !== session.id));
        router.refresh();
      }
    });
  }

  function handleAddSession() {
    if (!newDate) return;
    setAddError(null);
    startTransition(async () => {
      const { data, error } = await addCaseSession(caseId, {
        sessionDate: newDate,
        status: "upcoming",
      });
      if (error || !data) {
        setAddError(error ?? "حدث خطأ");
        return;
      }
      sync([...localSessions, data]);
      setNewDate("");
      setShowAddForm(false);
      router.refresh();
    });
  }

  function handleResultSaved() {
    setRecordingId(null);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h2 className="text-text-primary text-xl font-bold">جلسات القضية</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige rounded-full transition"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Action bar */}
          <div className="flex gap-2">
            {hasUpcoming ? (
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning/10 border border-warning/30 text-warning text-sm font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                يوجد جلسة قادمة — سجّل نتيجتها أولاً قبل إضافة جلسة جديدة
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
              >
                <CalendarPlus className="w-4 h-4" />
                إضافة جلسة جديدة
              </button>
            )}
          </div>

          {/* Add Session Form */}
          {showAddForm && !hasUpcoming && (
            <div className="p-4 border border-border rounded-xl bg-background space-y-3">
              <h4 className="text-text-primary font-semibold text-sm">
                تحديد موعد الجلسة
              </h4>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border border-border rounded-lg p-2.5 bg-surface text-text-primary text-sm focus:outline-none focus:border-primary"
              />
              {addError && <p className="text-error text-xs">{addError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleAddSession}
                  disabled={!newDate || isPending}
                  className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDate("");
                  }}
                  className="px-4 py-2 border border-border text-text-secondary rounded-lg text-sm hover:bg-beige transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Session list — timeline */}
          {sorted.length === 0 && (
            <p className="text-center text-text-muted py-8">
              لا توجد جلسات مسجلة
            </p>
          )}

          {sorted.map((session) => {
            const displayStatus = getSessionDisplayStatus(session);
            const isRecording = recordingId === session.id;

            return (
              <div key={session.id}>
                <TimelineSessionCard
                  session={session}
                  displayStatus={displayStatus}
                  isRecording={isRecording}
                  isPending={isPending}
                  onRecord={() =>
                    setRecordingId(isRecording ? null : session.id)
                  }
                  onDelete={() => handleDelete(session)}
                />

                {isRecording && (
                  <RecordResultForm
                    session={session}
                    caseId={caseId}
                    onDone={handleResultSaved}
                    onCancel={() => setRecordingId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Session Card ────────────────────────────────────────────────────

function TimelineSessionCard({
  session,
  displayStatus,
  isRecording,
  isPending,
  onRecord,
  onDelete,
}: {
  session: CaseSession;
  displayStatus: "upcoming" | "overdue" | "held";
  isRecording: boolean;
  isPending: boolean;
  onRecord: () => void;
  onDelete: () => void;
}) {
  const isAppealOrCassation =
    session.category === "appeal" || session.category === "cassation";

  const wrapperClass =
    displayStatus === "overdue"
      ? "border-2 border-error bg-error/5"
      : displayStatus === "upcoming" && isAppealOrCassation
        ? session.category === "appeal"
          ? "border-2 border-warning bg-warning/5"
          : "border-2 border-error bg-error/5"
        : displayStatus === "upcoming"
          ? "border-2 border-primary bg-primary/5"
          : "border border-border bg-surface opacity-75";

  const badge = {
    upcoming: { label: "قادمة", cls: "bg-primary text-white" },
    overdue: { label: "⚠ متأخرة", cls: "bg-error text-white" },
    held: { label: "منعقدت", cls: "bg-border text-text-muted" },
  }[displayStatus];

  const StatusIcon =
    displayStatus === "held"
      ? CheckCircle2
      : displayStatus === "overdue"
        ? AlertTriangle
        : Clock;

  return (
    <div className={`rounded-xl p-4 ${wrapperClass}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left side: icon + date */}
        <div className="flex items-start gap-3">
          <StatusIcon
            className={`w-5 h-5 mt-0.5 shrink-0 ${
              displayStatus === "overdue"
                ? "text-error"
                : displayStatus === "upcoming" &&
                    session.category === "cassation"
                  ? "text-error"
                  : displayStatus === "upcoming" &&
                      session.category === "appeal"
                    ? "text-warning"
                    : displayStatus === "upcoming"
                      ? "text-primary"
                      : "text-text-muted"
            }`}
          />
          <div>
            <span
              className={`font-semibold text-sm ${
                displayStatus === "held"
                  ? "text-text-muted"
                  : "text-text-primary"
              }`}
            >
              {formatDateTime(session.sessionDate)}
            </span>

            {/* Category badge */}
            {session.category !== "normal" && (
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full font-bold mr-2 ${CATEGORY_COLORS[session.category]}`}
              >
                {CATEGORY_LABELS[session.category]}
              </span>
            )}

            {/* Mandatory indicator */}
            {session.isMandatory && session.status === "upcoming" && (
              <div className="flex items-center gap-1 mt-1">
                <ShieldAlert className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs text-warning font-semibold">
                  جلسة إلزامية
                </span>
              </div>
            )}

            {session.notes && (
              <p className="text-text-muted text-xs mt-1 leading-relaxed">
                {session.notes}
              </p>
            )}
            {session.decision && (
              <p className="text-text-secondary text-xs mt-1 font-medium">
                القرار:{" "}
                <span className="text-primary">
                  {DECISION_LABELS[session.decision]}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Right side: badge + actions */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${badge.cls}`}
          >
            {badge.label}
          </span>

          {(displayStatus === "upcoming" || displayStatus === "overdue") && (
            <button
              onClick={onRecord}
              disabled={isPending}
              title="تسجيل نتيجة الجلسة"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 ${
                isRecording
                  ? "bg-border text-text-secondary"
                  : "bg-secondary text-white hover:bg-secondary/90"
              }`}
            >
              <ClipboardEdit className="w-3.5 h-3.5" />
              {isRecording ? "إلغاء" : "تسجيل النتيجة"}
            </button>
          )}

          {/* Don't allow deleting mandatory upcoming sessions */}
          {!(session.isMandatory && session.status === "upcoming") && (
            <button
              onClick={onDelete}
              disabled={isPending}
              title="حذف الجلسة"
              className="p-1.5 text-error hover:bg-error/10 rounded-lg transition disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
