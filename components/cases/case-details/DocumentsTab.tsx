"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Download } from "lucide-react";
import ImportantDates from "./ImportantDates";
import { formatDateTime } from "./helpers";
import {
  uploadCaseAttachment,
  getCaseFileSignedUrl,
} from "@/app/actions/cases";
import { extractStoragePath } from "@/lib/storage";
import toast from "react-hot-toast";
import type { Case, CaseAttachment } from "@/types";

export default function DocumentsTab({
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
