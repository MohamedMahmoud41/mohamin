"use client";

import { CalendarDays } from "lucide-react";
import { formatDate, formatDateTime } from "./helpers";
import type { Case } from "@/types";

export default function ImportantDates({
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
