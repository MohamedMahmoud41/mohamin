"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  Pencil,
  Trash2,
  ClipboardList,
  MessageSquare,
  FileText,
  CalendarDays,
  User,
  MessageSquarePlus,
  Upload,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui";
import SessionsTimeline from "@/components/cases/SessionsTimeline";
import {
  deleteCase,
  addCaseNote,
  deleteCaseNote,
  uploadCaseAttachment,
  getCaseFileSignedUrl,
} from "@/app/actions/cases";
import { extractStoragePath } from "@/lib/storage";
import toast from "react-hot-toast";
import type {
  Case,
  CaseNote,
  CaseSession,
  CaseAttachment,
  User as UserType,
} from "@/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ar-EG");
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

function getStatusClass(status: string) {
  const s = status?.toLowerCase();
  if (
    ["جارية", "نشطه", "نشطة", "active", "runing", "running", "جاري"].includes(s)
  )
    return "bg-info/10 text-info";
  if (["قيد الانتظار", "pending", "انتظار", "قيد الإنتظار"].includes(s))
    return "bg-warning/10 text-warning";
  if (
    [
      "مكسوبة",
      "مكسوبه",
      "completed",
      "won",
      "مكتملة",
      "منتهية لصالح الموكل",
    ].includes(s)
  )
    return "bg-success/10 text-success";
  return "bg-border text-text-secondary";
}

type TabId = "details" | "notes" | "documents";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CaseDetailsPanelProps {
  caseItem: Case;
  sessions: CaseSession[];
  notes: CaseNote[];
  attachments: CaseAttachment[];
  currentUser: UserType;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CaseDetailsPanel({
  caseItem,
  sessions,
  notes,
  attachments,
  currentUser,
}: CaseDetailsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localSessions, setLocalSessions] = useState<CaseSession[]>(sessions);
  const [localAttachments, setLocalAttachments] =
    useState<CaseAttachment[]>(attachments);
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  // ─── Delete case ────────────────────────────────────────────────────────────
  const handleDeleteCase = () => {
    startTransition(async () => {
      const { error } = await deleteCase(caseItem.id);
      if (!error) {
        setShowDeleteModal(false);
        router.push("/cases");
        router.refresh();
      }
    });
  };

  const isOwner = currentUser.role?.includes("officeOwner");

  return (
    <div className="bg-background min-h-full p-4 md:p-8">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-2xl flex items-center justify-center">
            <Scale className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-text-primary text-2xl font-semibold">
              {caseItem.caseTitle}
            </h1>
            <span className="text-text-muted text-sm mt-1">
              رقم القضية: {caseItem.id}
            </span>
          </div>
          <span
            className={`px-4 py-1 rounded-full text-sm ${getStatusClass(caseItem.caseStatus)}`}
          >
            {caseItem.caseStatus}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/cases/${caseItem.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-2xl hover:bg-primary hover:text-white transition font-bold"
          >
            تعديل القضية
            <Pencil className="w-5 h-5" />
          </Link>
          {isOwner && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-error bg-error text-white rounded-2xl cursor-pointer"
            >
              حذف القضية
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-10 border-b border-border pb-2 mb-6">
        {(
          [
            { id: "details" as TabId, label: "التفاصيل", icon: ClipboardList },
            { id: "notes" as TabId, label: "الملاحظات", icon: MessageSquare },
            { id: "documents" as TabId, label: "المستندات", icon: FileText },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1 pb-3 transition text-base ${
              activeTab === id
                ? "text-primary font-semibold border-b-2 border-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon className="w-5 h-5 ml-1" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Details ───────────────────────────────────────────────────── */}
      {showSessionsModal && (
        <SessionsTimeline
          sessions={localSessions}
          caseId={caseItem.id}
          onClose={() => setShowSessionsModal(false)}
          onSessionsChanged={(updated) => setLocalSessions(updated)}
        />
      )}

      {activeTab === "details" && (
        <DetailsTab
          caseItem={caseItem}
          sessions={localSessions}
          onOpenSessions={() => setShowSessionsModal(true)}
        />
      )}

      {activeTab === "notes" && (
        <NotesTab
          caseItem={caseItem}
          notes={notes}
          currentUser={currentUser}
          onOpenSessions={() => setShowSessionsModal(true)}
        />
      )}

      {activeTab === "documents" && (
        <DocumentsTab
          attachments={localAttachments}
          caseItem={caseItem}
          onOpenSessions={() => setShowSessionsModal(true)}
          onUploaded={(att) => setLocalAttachments((prev) => [...prev, att])}
        />
      )}

      {/* ─── Confirm delete ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="حذف القضية"
        message="هل أنت متأكد أنك تريد حذف هذه القضية نهائيًا؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، حذف"
        cancelText="إلغاء"
        onConfirm={handleDeleteCase}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

// ─── Details Tab ──────────────────────────────────────────────────────────────

function DetailsTab({
  caseItem,
  sessions,
  onOpenSessions,
}: {
  caseItem: Case;
  sessions: CaseSession[];
  onOpenSessions: () => void;
}) {
  const now = new Date();
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
  );
  const displayedSessions = sorted.slice(0, 3);

  function getDisplayStatus(s: CaseSession): "upcoming" | "overdue" | "held" {
    if (s.status === "held") return "held";
    if (now > new Date(s.sessionDate)) return "overdue";
    return "upcoming";
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 flex flex-col gap-6">
        {/* Description */}
        <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-text-primary text-xl font-semibold mb-4">
            وصف القضية
          </h2>
          <p className="text-text-secondary leading-relaxed text-sm">
            {caseItem.caseDescription}
          </p>
        </div>

        {/* Court info */}
        <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-text-primary text-xl font-semibold mb-4">
            معلومات المحكمة
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-text-muted text-xs">المحكمة</span>
              <span className="text-text-secondary font-semibold">
                {caseItem.courtName || "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-muted text-xs">القاعة</span>
              <span className="text-text-secondary font-semibold">
                {caseItem.courtHall || "—"}
              </span>
            </div>
            {caseItem.courtNum && (
              <div className="flex flex-col">
                <span className="text-text-muted text-xs">
                  رقم القضية بالمحكمة
                </span>
                <span className="text-text-secondary font-semibold">
                  {caseItem.courtNum}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-text-primary text-xl font-semibold mb-6">
            تواريخ الجلسات
          </h2>
          {displayedSessions.length > 0 ? (
            displayedSessions.map((s) => {
              const ds = getDisplayStatus(s);
              const wrapperClass =
                ds === "overdue"
                  ? "border-2 border-error bg-error/5"
                  : ds === "upcoming"
                    ? "border-2 border-primary bg-primary/5"
                    : "border border-border bg-beige opacity-75";
              const badge = {
                upcoming: { label: "قادمة", cls: "bg-primary text-white" },
                overdue: { label: "⚠ متأخرة", cls: "bg-error text-white" },
                held: { label: "منعقدت", cls: "bg-border text-text-muted" },
              }[ds];
              const Icon =
                ds === "held"
                  ? CheckCircle2
                  : ds === "overdue"
                    ? AlertTriangle
                    : Clock;
              return (
                <div
                  key={s.id}
                  className={`rounded-xl p-4 mb-3 flex items-center justify-between ${wrapperClass}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        ds === "overdue"
                          ? "text-error"
                          : ds === "upcoming"
                            ? "text-primary"
                            : "text-text-muted"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span
                        className={`font-semibold text-sm ${
                          ds === "held"
                            ? "text-text-muted"
                            : "text-text-primary"
                        }`}
                      >
                        {formatDateTime(s.sessionDate)}
                      </span>
                      {s.notes && (
                        <p className="text-text-muted text-xs mt-0.5">
                          {s.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-text-muted">لا توجد جلسات مجدولة</p>
          )}
        </div>

        {/* Client info */}
        <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-6 h-6 text-text-secondary" />
            <h2 className="text-text-primary text-xl font-semibold">
              معلومات العميل
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted text-xs block">الاسم</span>
              <span className="text-text-primary font-semibold">
                {caseItem.clientName}
              </span>
            </div>
            <div>
              <span className="text-text-muted text-xs block">الهاتف</span>
              <span className="text-text-primary font-semibold">
                {caseItem.clientPhone || "—"}
              </span>
            </div>
            <div>
              <span className="text-text-muted text-xs block">
                البريد الإلكتروني
              </span>
              <span className="text-text-primary font-semibold">
                {caseItem.clientEmail || "—"}
              </span>
            </div>
            {caseItem.clientAddress && (
              <div className="col-span-2">
                <span className="text-text-muted text-xs block">العنوان</span>
                <span className="text-text-primary font-semibold">
                  {caseItem.clientAddress}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Opponent info */}
        {(caseItem.opponentEmail || caseItem.opponentAddress) && (
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-text-primary text-xl font-semibold mb-4">
              معلومات الخصم
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted text-xs block">الاسم</span>
                <span className="text-text-primary font-semibold">
                  {caseItem.opponentName || "—"}
                </span>
              </div>
              <div>
                <span className="text-text-muted text-xs block">الهاتف</span>
                <span className="text-text-primary font-semibold">
                  {caseItem.opponentPhone || "—"}
                </span>
              </div>
              {caseItem.opponentEmail && (
                <div>
                  <span className="text-text-muted text-xs block">
                    البريد الإلكتروني
                  </span>
                  <span className="text-text-primary font-semibold">
                    {caseItem.opponentEmail}
                  </span>
                </div>
              )}
              {caseItem.opponentAddress && (
                <div className="col-span-2">
                  <span className="text-text-muted text-xs block">العنوان</span>
                  <span className="text-text-primary font-semibold">
                    {caseItem.opponentAddress}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar: important dates */}
      <ImportantDates caseItem={caseItem} onOpenSessions={onOpenSessions} />
    </div>
  );
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────

function NotesTab({
  caseItem,
  notes,
  currentUser,
  onOpenSessions,
}: {
  caseItem: Case;
  notes: CaseNote[];
  currentUser: UserType;
  onOpenSessions: () => void;
}) {
  const [noteText, setNoteText] = useState("");
  const [localNotes, setLocalNotes] = useState<CaseNote[]>(notes);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!noteText.trim()) return;
    startTransition(async () => {
      const { data, error } = await addCaseNote(caseItem.id, {
        noteTitle: noteText,
        noteOwner: `${currentUser.firstName} ${currentUser.lastName}`,
      });
      if (data && !error) {
        setLocalNotes((prev) => [data, ...prev]);
        setNoteText("");
      }
    });
  };

  const handleDelete = (noteId: string) => {
    startTransition(async () => {
      const { error } = await deleteCaseNote(caseItem.id, noteId);
      if (!error) {
        setLocalNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    });
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-surface rounded-lg border border-border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-text-primary text-xl font-semibold">الملاحظات</h2>
        </div>

        {/* Add note */}
        <div className="flex gap-3 mb-6">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="أضف ملاحظة..."
            className="flex-1 px-4 py-3 border border-border rounded-xl bg-background text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted"
          />
          <button
            onClick={handleAdd}
            disabled={isPending || !noteText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
          >
            <MessageSquarePlus className="w-5 h-5" />
            إضافة
          </button>
        </div>

        {localNotes.length === 0 && (
          <p className="text-center text-text-muted">لا توجد ملاحظات</p>
        )}

        {localNotes.map((note) => (
          <div
            key={note.id}
            className="bg-beige border border-border rounded-lg p-4 mb-4 text-right"
          >
            <div className="flex justify-between items-start">
              <button
                onClick={() => handleDelete(note.id)}
                disabled={isPending}
                className="text-error hover:text-red-700 text-xs"
              >
                حذف
              </button>
              <div>
                <span className="text-text-muted text-xs">
                  {formatDateTime(note.noteDate || note.createdAt)}
                </span>
                <br />
                <span className="text-text-primary font-semibold text-base">
                  {note.noteOwner}
                </span>
              </div>
            </div>
            <p className="text-text-secondary text-sm mt-2">{note.noteTitle}</p>
          </div>
        ))}
      </div>

      <ImportantDates caseItem={caseItem} onOpenSessions={onOpenSessions} />
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({
  attachments,
  caseItem,
  onOpenSessions,
  onUploaded,
}: {
  attachments: CaseAttachment[];
  caseItem: Case;
  onOpenSessions: () => void;
  onUploaded: (att: CaseAttachment) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadCaseAttachment(caseItem.id, fd);
    setIsUploading(false);
    if (result.error) {
      setUploadError(result.error);
    } else if (result.data) {
      onUploaded(result.data);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleOpenFile(doc: CaseAttachment) {
    if (openingFileId) return;
    setOpeningFileId(doc.id);
    const path = extractStoragePath(doc.fileUrl);
    const { url, error } = await getCaseFileSignedUrl(path);
    setOpeningFileId(null);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      console.error("[handleOpenFile] failed for path:", path, error);
      toast.error("تعذّر فتح الملف، يرجى المحاولة مجدداً");
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-surface rounded-lg border border-border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-text-primary text-xl font-semibold">
            المستندات المرفقة
          </h2>
          <label
            className={`flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition text-sm font-semibold ${
              isUploading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "جاري الرفع..." : "رفع مستند"}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>

        {uploadError && (
          <p className="text-error text-sm bg-error/10 p-3 rounded-lg mb-4">
            {uploadError}
          </p>
        )}

        {attachments.length === 0 && (
          <p className="text-center text-text-muted py-8">
            لا توجد مستندات مرفقة
          </p>
        )}

        <div className="flex flex-col gap-4">
          {attachments.map((doc) => {
            const isLoading = openingFileId === doc.id;
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-surface border border-border rounded-lg p-5 hover:shadow-md transition-all"
              >
                <button
                  onClick={() => handleOpenFile(doc)}
                  disabled={!!openingFileId}
                  className="flex gap-5 text-right flex-1 min-w-0 disabled:opacity-60"
                >
                  <div className="w-12 h-12 bg-beige rounded-2xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-text-secondary" />
                  </div>
                  <div className="flex flex-col text-right min-w-0">
                    <span className="text-text-primary font-semibold hover:text-primary transition-colors truncate">
                      {doc.fileName || "مستند بدون اسم"}
                    </span>
                    <span className="text-text-muted text-xs">
                      {doc.fileSize
                        ? `${Math.round(doc.fileSize / 1024)} KB • `
                        : ""}
                      {formatDateTime(doc.uploadedAt)}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handleOpenFile(doc)}
                  disabled={!!openingFileId}
                  className="p-3 text-text-secondary hover:text-text-primary hover:bg-beige rounded-2xl transition disabled:opacity-50 shrink-0"
                  title="فتح الملف"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 block border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <ImportantDates caseItem={caseItem} onOpenSessions={onOpenSessions} />
    </div>
  );
}

// ─── Shared: Important Dates sidebar ──────────────────────────────────────────

function ImportantDates({
  caseItem,
  onOpenSessions,
}: {
  caseItem: Case;
  onOpenSessions: () => void;
}) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm p-6 flex flex-col gap-6 h-max">
      <h2 className="text-text-primary text-xl font-semibold">
        التواريخ المهمة
      </h2>

      <div className="flex items-center gap-3">
        <CalendarDays className="w-6 h-6 text-text-secondary" />
        <div className="flex flex-col">
          <span className="text-text-muted text-xs">تاريخ البدء</span>
          <span className="text-text-primary text-sm font-semibold">
            {formatDate(caseItem.startDate)}
          </span>
        </div>
      </div>

      <button
        onClick={onOpenSessions}
        className="w-full rounded-2xl bg-secondary text-white py-3 text-sm font-semibold hover:bg-secondary/90 transition"
      >
        الجلسة القادمة
        <br />
        {formatDateTime(caseItem.nextSessionDate)}
      </button>

      <div className="flex items-center gap-3">
        <CalendarDays className="w-6 h-6 text-text-secondary" />
        <div className="flex flex-col">
          <span className="text-text-muted text-xs">آخر تحديث</span>
          <span className="text-text-primary text-sm font-semibold">
            {formatDateTime(caseItem.updatedAt) ||
              formatDateTime(caseItem.createdAt) ||
              "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
