import Link from "next/link";
import {
  Scale,
  UserRound,
  StickyNote,
  CalendarDays,
  Clock,
} from "lucide-react";
import Badge from "./Badge";
import type { Case } from "@/types";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary";

function getStatusVariant(status: string): BadgeVariant {
  const s = status?.toString().toLowerCase();
  if (
    ["جارية", "نشطه", "نشطة", "active", "runing", "running", "جاري"].includes(s)
  )
    return "info";
  if (["قيد الانتظار", "قيد الإنتظار", "انتظار", "pending"].includes(s))
    return "warning";
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
    return "success";
  if (["مغلقة", "closed"].includes(s)) return "secondary";
  return "default";
}

function formatDate(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ar-EG");
}

interface CaseCardProps {
  caseItem: Case;
  hideLawyer?: boolean;
  href?: string;
}

export default function CaseCard({
  caseItem,
  hideLawyer = false,
  href,
}: CaseCardProps) {
  const link = href ?? `/cases/${caseItem.id}`;

  return (
    <Link
      href={link}
      className="block bg-surface border border-border rounded-xl p-7 shadow-sm hover:shadow-md transition"
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex gap-3 items-center">
          <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <Scale className="w-8 h-8 text-surface" />
          </div>
          <div>
            <h3 className="text-text-primary font-semibold text-lg">
              {caseItem.caseTitle}
            </h3>
            <p className="text-text-muted text-sm flex gap-1">
              <span>رقم:</span>
              <span className="text-text-primary">
                {caseItem.id.substring(0, 8)}
              </span>
            </p>
          </div>
        </div>
        <Badge variant={getStatusVariant(caseItem.caseStatus)}>
          {caseItem.caseStatus}
        </Badge>
      </div>

      <p className="text-text-secondary text-sm mt-2 line-clamp-2">
        {caseItem.caseDescription}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {!hideLawyer && (
          <p className="text-text-muted flex gap-1 items-center">
            <StickyNote className="w-4 h-4" /> المحامي:
            <span className="text-text-primary">
              {caseItem.lawyerID || "—"}
            </span>
          </p>
        )}
        <p className="text-text-muted flex gap-1 items-center">
          <UserRound className="w-4 h-4" /> العميل:
          <span className="text-text-primary">{caseItem.clientName}</span>
        </p>
        <p className="text-text-muted flex gap-1 items-center">
          <CalendarDays className="w-4 h-4" /> تاريخ البدء:
          <span className="text-text-primary">
            {formatDate(caseItem.startDate)}
          </span>
        </p>
        <p className="text-text-muted flex gap-1 items-center">
          <Clock className="w-4 h-4" /> الجلسة القادمة:
          <span className="text-text-primary">
            {formatDate(caseItem.nextSessionDate)}
          </span>
        </p>
      </div>
    </Link>
  );
}
