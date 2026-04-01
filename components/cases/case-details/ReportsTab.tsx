"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 as Trash2Icon } from "lucide-react";
import ImportantDates from "./ImportantDates";
import { DOCUMENT_TYPE_OPTIONS } from "./constants";
import { formatDate } from "./helpers";
import {
  SearchableSelectField,
  CreatableSelectField,
} from "@/components/ui/SearchableSelect";
import { addCaseReport, deleteCaseReport } from "@/app/actions/cases";
import toast from "react-hot-toast";
import type { Case, CaseReport } from "@/types";

export default function ReportsTab({
  caseItem,
  reports,
  lookups,
  courtOptions,
  onOpenSessions,
}: {
  caseItem: Case;
  reports: CaseReport[];
  lookups: Record<string, string>;
  courtOptions: { value: string; label: string }[];
  onOpenSessions: () => void;
}) {
  const [localReports, setLocalReports] = useState<CaseReport[]>(reports);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [courtId, setCourtId] = useState("");
  const [bailiffOffice, setBailiffOffice] = useState("");

  const resetForm = () => {
    setDocumentType("");
    setDocumentNumber("");
    setDeliveryDate("");
    setReceiverName("");
    setCourtId("");
    setBailiffOffice("");
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!documentType.trim()) {
      toast.error("نوع المحضر مطلوب");
      return;
    }
    startTransition(async () => {
      const { data, error } = await addCaseReport(caseItem.id, {
        documentType: documentType.trim(),
        documentNumber: documentNumber.trim() || undefined,
        deliveryDate: deliveryDate || undefined,
        receiverName: receiverName.trim() || undefined,
        courtId: courtId || undefined,
        bailiffOffice: bailiffOffice.trim() || undefined,
      });
      if (data && !error) {
        setLocalReports((prev) => [data, ...prev]);
        resetForm();
        toast.success("تم إضافة المحضر");
      } else {
        toast.error(error || "فشل إضافة المحضر");
      }
    });
  };

  const handleDelete = (reportId: string) => {
    startTransition(async () => {
      const { error } = await deleteCaseReport(caseItem.id, reportId);
      if (!error) {
        setLocalReports((prev) => prev.filter((r) => r.id !== reportId));
        toast.success("تم حذف المحضر");
      } else {
        toast.error("فشل حذف المحضر");
      }
    });
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-surface rounded-lg border border-border shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-text-primary text-xl font-semibold">
            محاضر المحكمة
          </h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            إضافة محضر
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-beige border border-border rounded-xl p-5 mb-6">
            <h3 className="text-text-primary font-semibold mb-4">محضر جديد</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Document type - Creatable */}
              <CreatableSelectField
                name="documentType"
                label="نوع المحضر"
                value={documentType}
                onChange={setDocumentType}
                options={DOCUMENT_TYPE_OPTIONS}
                placeholder="اختر أو اكتب نوع المحضر"
                required
              />

              {/* Document number */}
              <div className="flex flex-col gap-2">
                <label className="text-text-primary font-semibold">
                  رقم المحضر
                </label>
                <input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="رقم المحضر"
                  className="w-full px-3 py-2.5 border-2 border-border rounded-lg bg-background text-text-primary text-sm focus:outline-none focus:border-primary placeholder:text-text-muted min-h-[3.25rem]"
                />
              </div>

              {/* Delivery date */}
              <div className="flex flex-col gap-2">
                <label className="text-text-primary font-semibold">
                  تاريخ التسليم
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-border rounded-lg bg-background text-text-primary text-sm focus:outline-none focus:border-primary min-h-[3.25rem]"
                />
              </div>

              {/* Receiver name */}
              <div className="flex flex-col gap-2">
                <label className="text-text-primary font-semibold">
                  اسم المستلم
                </label>
                <input
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="اسم المستلم"
                  className="w-full px-3 py-2.5 border-2 border-border rounded-lg bg-background text-text-primary text-sm focus:outline-none focus:border-primary placeholder:text-text-muted min-h-[3.25rem]"
                />
              </div>

              {/* Court */}
              <SearchableSelectField
                name="courtId"
                label="المحكمة"
                value={courtId}
                onChange={setCourtId}
                options={courtOptions}
                placeholder="اختر المحكمة"
              />

              {/* Bailiff office */}
              <div className="flex flex-col gap-2">
                <label className="text-text-primary font-semibold">
                  جهة المحضرين
                </label>
                <input
                  value={bailiffOffice}
                  onChange={(e) => setBailiffOffice(e.target.value)}
                  placeholder="جهة المحضرين"
                  className="w-full px-3 py-2.5 border-2 border-border rounded-lg bg-background text-text-primary text-sm focus:outline-none focus:border-primary placeholder:text-text-muted min-h-[3.25rem]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-border text-text-secondary rounded-xl hover:bg-surface transition text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={handleAdd}
                disabled={isPending || !documentType.trim()}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition text-sm font-semibold disabled:opacity-50"
              >
                {isPending ? "جاري الإضافة..." : "حفظ المحضر"}
              </button>
            </div>
          </div>
        )}

        {/* Reports list */}
        {localReports.length === 0 && !showForm && (
          <p className="text-center text-text-muted py-8">
            لا توجد محاضر مسجلة
          </p>
        )}

        <div className="flex flex-col gap-4">
          {localReports.map((report) => (
            <div
              key={report.id}
              className="bg-background border border-border rounded-xl p-5 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start">
                <button
                  onClick={() => handleDelete(report.id)}
                  disabled={isPending}
                  className="text-error hover:text-red-700 text-xs flex items-center gap-1 shrink-0"
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                  حذف
                </button>
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-2 mb-2 justify-end">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {report.documentType}
                    </span>
                    {report.documentNumber && (
                      <span className="text-text-muted text-xs">
                        رقم: {report.documentNumber}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-3">
                    {report.deliveryDate && (
                      <div>
                        <span className="text-text-muted text-xs block">
                          تاريخ التسليم
                        </span>
                        <span className="text-text-primary font-semibold">
                          {formatDate(report.deliveryDate)}
                        </span>
                      </div>
                    )}
                    {report.receiverName && (
                      <div>
                        <span className="text-text-muted text-xs block">
                          المستلم
                        </span>
                        <span className="text-text-primary font-semibold">
                          {report.receiverName}
                        </span>
                      </div>
                    )}
                    {report.courtId && lookups[report.courtId] && (
                      <div>
                        <span className="text-text-muted text-xs block">
                          المحكمة
                        </span>
                        <span className="text-text-primary font-semibold">
                          {lookups[report.courtId]}
                        </span>
                      </div>
                    )}
                    {report.bailiffOffice && (
                      <div>
                        <span className="text-text-muted text-xs block">
                          جهة المحضرين
                        </span>
                        <span className="text-text-primary font-semibold">
                          {report.bailiffOffice}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ImportantDates caseItem={caseItem} onOpenSessions={onOpenSessions} />
    </div>
  );
}
