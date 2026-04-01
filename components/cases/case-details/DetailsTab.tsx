"use client";

import { User, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import ImportantDates from "./ImportantDates";
import { formatDate, formatDateTime } from "./helpers";
import type { Case, CaseSession, Lawyer } from "@/types";
import {
  displayCaseCategory,
  civilDegreeMap,
  displayClientRole,
  displayOpponentRole,
} from "@/lib/enums";

export default function DetailsTab({
  caseItem,
  sessions,
  lawyers,
  lookups,
  onOpenSessions,
}: {
  caseItem: Case;
  sessions: CaseSession[];
  lawyers: Lawyer[];
  lookups: Record<string, string>;
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

        {/* Case info */}
        <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-text-primary text-xl font-semibold mb-4">
            معلومات القضية
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-text-muted text-xs">تصنيف القضية</span>
              <span className="text-text-secondary font-semibold">
                {caseItem.caseCategory
                  ? displayCaseCategory(caseItem.caseCategory)
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-text-muted text-xs">نوع القضية</span>
              <span className="text-text-secondary font-semibold">
                {(caseItem.caseTypeId && lookups[caseItem.caseTypeId]) ||
                  caseItem.caseType ||
                  "—"}
              </span>
            </div>
            {caseItem.civilDegree && (
              <div className="flex flex-col">
                <span className="text-text-muted text-xs">الدرجة</span>
                <span className="text-text-secondary font-semibold">
                  {(civilDegreeMap as Record<string, string>)[
                    caseItem.civilDegree
                  ] ?? caseItem.civilDegree}
                </span>
              </div>
            )}
            {/* Assigned lawyers */}
            {lawyers.length > 0 && (
              <div className="flex flex-col col-span-2">
                <span className="text-text-muted text-xs">
                  المحامون المسؤولون
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(() => {
                    const ids = caseItem.lawyerIDs?.length
                      ? caseItem.lawyerIDs
                      : caseItem.lawyerID
                        ? [caseItem.lawyerID]
                        : [];
                    const assigned = lawyers.filter((l) => ids.includes(l.id));
                    return assigned.length > 0 ? (
                      assigned.map((l) => (
                        <span
                          key={l.id}
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                        >
                          {l.firstName} {l.lastName}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-secondary font-semibold">
                        —
                      </span>
                    );
                  })()}
                </div>
              </div>
            )}
            {/* Case numbers */}
            {caseItem.caseNumbers?.length > 0 && (
              <div className="flex flex-col col-span-2">
                <span className="text-text-muted text-xs">أرقام القضية</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {caseItem.caseNumbers.map((cn, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-border text-text-primary text-xs font-semibold"
                    >
                      {cn.caseNumber} / {cn.caseYear}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Court info */}
        <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-text-primary text-xl font-semibold mb-4">
            معلومات المحكمة
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Resolved court name from courtId, fallback courtName */}
            <div className="flex flex-col">
              <span className="text-text-muted text-xs">المحكمة</span>
              <span className="text-text-secondary font-semibold">
                {(caseItem.courtId && lookups[caseItem.courtId]) ||
                  caseItem.courtName ||
                  "—"}
              </span>
            </div>
            {caseItem.courtHall && (
              <div className="flex flex-col">
                <span className="text-text-muted text-xs">القاعة</span>
                <span className="text-text-secondary font-semibold">
                  {caseItem.courtHall}
                </span>
              </div>
            )}
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
            {/* Criminal-specific fields */}
            {caseItem.courtDivisionId && lookups[caseItem.courtDivisionId] && (
              <div className="flex flex-col">
                <span className="text-text-muted text-xs">الدائرة</span>
                <span className="text-text-secondary font-semibold">
                  {lookups[caseItem.courtDivisionId]}
                </span>
              </div>
            )}
            {caseItem.governorateId && lookups[caseItem.governorateId] && (
              <div className="flex flex-col">
                <span className="text-text-muted text-xs">المحافظة</span>
                <span className="text-text-secondary font-semibold">
                  {lookups[caseItem.governorateId]}
                </span>
              </div>
            )}
            {caseItem.policeStationId && lookups[caseItem.policeStationId] && (
              <div className="flex flex-col">
                <span className="text-text-muted text-xs">قسم الشرطة</span>
                <span className="text-text-secondary font-semibold">
                  {lookups[caseItem.policeStationId]}
                </span>
              </div>
            )}
            {caseItem.partialProsecutionId &&
              lookups[caseItem.partialProsecutionId] && (
                <div className="flex flex-col">
                  <span className="text-text-muted text-xs">
                    النيابة الجزئية
                  </span>
                  <span className="text-text-secondary font-semibold">
                    {lookups[caseItem.partialProsecutionId]}
                  </span>
                </div>
              )}
            {/* Personal-specific fields */}
            {caseItem.personalCourtDivisionId &&
              lookups[caseItem.personalCourtDivisionId] && (
                <div className="flex flex-col">
                  <span className="text-text-muted text-xs">الدائرة</span>
                  <span className="text-text-secondary font-semibold">
                    {lookups[caseItem.personalCourtDivisionId]}
                  </span>
                </div>
              )}
            {caseItem.familyCourtId && lookups[caseItem.familyCourtId] && (
              <div className="flex flex-col">
                <span className="text-text-muted text-xs">محكمة الأسرة</span>
                <span className="text-text-secondary font-semibold">
                  {lookups[caseItem.familyCourtId]}
                </span>
              </div>
            )}
            {caseItem.personalPartialProsecutionId &&
              lookups[caseItem.personalPartialProsecutionId] && (
                <div className="flex flex-col">
                  <span className="text-text-muted text-xs">
                    النيابة الجزئية
                  </span>
                  <span className="text-text-secondary font-semibold">
                    {lookups[caseItem.personalPartialProsecutionId]}
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
            {caseItem.clientType && (
              <div>
                <span className="text-text-muted text-xs block">النوع</span>
                <span className="text-text-primary font-semibold">
                  {caseItem.clientType}
                </span>
              </div>
            )}
            {caseItem.clientRole && (
              <div>
                <span className="text-text-muted text-xs block">الصفة</span>
                <span className="text-text-primary font-semibold">
                  {displayClientRole(caseItem.clientRole)}
                </span>
              </div>
            )}
            {caseItem.clientNationalId && (
              <div>
                <span className="text-text-muted text-xs block">
                  الرقم القومي
                </span>
                <span className="text-text-primary font-semibold">
                  {caseItem.clientNationalId}
                </span>
              </div>
            )}
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
            {caseItem.opponentType && (
              <div>
                <span className="text-text-muted text-xs block">النوع</span>
                <span className="text-text-primary font-semibold">
                  {caseItem.opponentType}
                </span>
              </div>
            )}
            {caseItem.opponentRole && (
              <div>
                <span className="text-text-muted text-xs block">الصفة</span>
                <span className="text-text-primary font-semibold">
                  {displayOpponentRole(caseItem.opponentRole)}
                </span>
              </div>
            )}
            {caseItem.opponentNationalId && (
              <div>
                <span className="text-text-muted text-xs block">
                  الرقم القومي
                </span>
                <span className="text-text-primary font-semibold">
                  {caseItem.opponentNationalId}
                </span>
              </div>
            )}
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
      </div>

      {/* Sidebar: important dates */}
      <ImportantDates caseItem={caseItem} onOpenSessions={onOpenSessions} />
    </div>
  );
}
