"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  Pencil,
  Trash2,
  ClipboardList,
  MessageSquare,
  FileText,
  Scroll,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui";
import SessionsTimeline from "@/components/cases/SessionsTimeline";
import { deleteCase, updateCase } from "@/app/actions/cases";
import toast from "react-hot-toast";
import type {
  Case,
  CaseNote,
  CaseSession,
  CaseAttachment,
  CaseReport,
  Lawyer,
  User as UserType,
} from "@/types";
import { getStatusClass } from "./helpers";
import { STATUS_OPTIONS } from "./constants";
import DetailsTab from "./DetailsTab";
import NotesTab from "./NotesTab";
import DocumentsTab from "./DocumentsTab";
import ReportsTab from "./ReportsTab";

type TabId = "details" | "notes" | "documents" | "reports";

interface CaseDetailsPanelProps {
  caseItem: Case;
  sessions: CaseSession[];
  notes: CaseNote[];
  attachments: CaseAttachment[];
  reports: CaseReport[];
  currentUser: UserType;
  lawyers: Lawyer[];
  lookups: Record<string, string>;
  courtOptions: { value: string; label: string }[];
}

export default function CaseDetailsPanel({
  caseItem,
  sessions,
  notes,
  attachments,
  reports,
  currentUser,
  lawyers,
  lookups,
  courtOptions,
}: CaseDetailsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localSessions, setLocalSessions] = useState<CaseSession[]>(sessions);
  const [localAttachments, setLocalAttachments] =
    useState<CaseAttachment[]>(attachments);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(caseItem.caseStatus);
  const statusRef = useRef<HTMLDivElement>(null);

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

  // ─── Change status ──────────────────────────────────────────────────────────
  const handleStatusChange = (newStatus: string) => {
    setShowStatusMenu(false);
    if (newStatus === currentStatus) return;
    const prev = currentStatus;
    setCurrentStatus(newStatus);
    startTransition(async () => {
      const { error } = await updateCase(caseItem.id, {
        caseStatus: newStatus,
      });
      if (error) {
        setCurrentStatus(prev);
        toast.error("فشل تحديث الحالة");
      } else {
        toast.success("تم تحديث الحالة");
        router.refresh();
      }
    });
  };

  // Close status menu on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    }
    if (showStatusMenu) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showStatusMenu]);

  const currentStatusConfig = STATUS_OPTIONS.find(
    (s) => s.value === currentStatus,
  );

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
            className={`px-4 py-1 rounded-full text-sm ${getStatusClass(currentStatus)}`}
          >
            {currentStatus}
          </span>
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setShowStatusMenu((v) => !v)}
              disabled={isPending}
              className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-xl text-text-secondary hover:bg-surface transition text-sm disabled:opacity-50"
            >
              تغيير الحالة
              <ChevronDown className="w-4 h-4" />
            </button>
            {showStatusMenu && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-surface border border-border rounded-xl shadow-lg py-1 min-w-[200px]">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`w-full text-right flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-beige transition ${
                      opt.value === currentStatus ? "font-bold" : ""
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`}
                    />
                    {opt.label}
                    {opt.value === currentStatus && (
                      <CheckCircle2 className="w-4 h-4 mr-auto text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
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
            { id: "reports" as TabId, label: "محاضر المحكمة", icon: Scroll },
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

      {/* ─── Tab content ────────────────────────────────────────────────────── */}
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
          lawyers={lawyers}
          lookups={lookups}
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

      {activeTab === "reports" && (
        <ReportsTab
          caseItem={caseItem}
          reports={reports}
          lookups={lookups}
          courtOptions={courtOptions}
          onOpenSessions={() => setShowSessionsModal(true)}
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
