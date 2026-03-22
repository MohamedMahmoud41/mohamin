"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui";
import {
  deleteCase,
  addCaseNote,
  deleteCaseNote,
  addCaseSession,
  deleteCaseSession,
} from "@/app/actions/cases";
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
  if (["مكسوبة", "مكسوبه", "completed", "won", "مكتملة"].includes(s))
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
    <div className="bg-background min-h-full p-8">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
            <Scale className="w-7 h-7 text-white" />
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
      {activeTab === "details" && (
        <DetailsTab caseItem={caseItem} sessions={sessions} />
      )}

      {/* ─── Tab: Notes ─────────────────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <NotesTab caseItem={caseItem} notes={notes} currentUser={currentUser} />
      )}

      {/* ─── Tab: Documents ─────────────────────────────────────────────────── */}
      {activeTab === "documents" && (
        <DocumentsTab attachments={attachments} caseItem={caseItem} />
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
}: {
  caseItem: Case;
  sessions: CaseSession[];
}) {
  const now = new Date();
  const upcomingSessions = sessions
    .filter((s) => new Date(s.sessionDate) > now)
    .sort(
      (a, b) =>
        new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
    );
  const pastSessions = sessions
    .filter((s) => new Date(s.sessionDate) <= now)
    .sort(
      (a, b) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
    );
  const displayedSessions = [...upcomingSessions, ...pastSessions].slice(0, 3);

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
                {(caseItem as Case & { courtHall?: string }).courtHall || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-text-primary text-xl font-semibold mb-6">
            تواريخ الجلسات
          </h2>
          {displayedSessions.length > 0 ? (
            displayedSessions.map((s) => {
              const isUpcoming = new Date(s.sessionDate) > now;
              return (
                <div
                  key={s.id}
                  className="border border-border rounded-lg bg-beige p-4 mb-4 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-text-secondary font-semibold">
                      {formatDateTime(s.sessionDate)}
                    </span>
                    {s.notes && (
                      <p className="text-text-secondary text-sm mt-1">
                        {s.notes}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${isUpcoming ? "bg-primary text-white" : "text-text-muted bg-surface border border-border"}`}
                  >
                    {isUpcoming ? "قادمة" : "منتهية"}
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
          </div>
        </div>
      </div>

      {/* Sidebar: important dates */}
      <ImportantDates caseItem={caseItem} />
    </div>
  );
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────

function NotesTab({
  caseItem,
  notes,
  currentUser,
}: {
  caseItem: Case;
  notes: CaseNote[];
  currentUser: UserType;
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

      <ImportantDates caseItem={caseItem} />
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({
  attachments,
  caseItem,
}: {
  attachments: CaseAttachment[];
  caseItem: Case;
}) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-surface rounded-lg border border-border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-text-primary text-xl font-semibold">
            المستندات المرفقة
          </h2>
          <p className="text-text-muted text-sm">
            رفع المستندات متاح من صفحة تعديل القضية
          </p>
        </div>

        {attachments.length === 0 && (
          <p className="text-center text-text-muted py-8">
            لا توجد مستندات مرفقة
          </p>
        )}

        <div className="flex flex-col gap-4">
          {attachments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-surface border border-border rounded-lg p-5 hover:shadow-md transition-all"
            >
              <div className="flex gap-5">
                <div className="w-12 h-12 bg-beige rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-text-secondary" />
                </div>
                <div className="flex flex-col text-right">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-primary font-semibold hover:text-primary hover:underline transition-colors"
                  >
                    {doc.fileName || "مستند بدون اسم"}
                  </a>
                  <span className="text-text-muted text-xs">
                    {doc.fileSize
                      ? `${Math.round(doc.fileSize / 1024)} KB • `
                      : ""}
                    {formatDateTime(doc.uploadedAt)}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  doc.fileUrl && window.open(doc.fileUrl, "_blank")
                }
                className="p-3 text-text-secondary hover:text-text-primary hover:bg-beige rounded-2xl transition"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ImportantDates caseItem={caseItem} />
    </div>
  );
}

// ─── Shared: Important Dates sidebar ──────────────────────────────────────────

function ImportantDates({ caseItem }: { caseItem: Case }) {
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

      <button className="w-full rounded-2xl bg-secondary text-white py-3 text-sm font-semibold">
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
