"use client";

import { useRouter } from "next/navigation";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import type { DashboardSession, SessionCategory } from "@/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getDisplayStatus(
  session: DashboardSession,
): "upcoming" | "overdue" | "held" {
  if (session.status === "held") return "held";
  if (new Date() > new Date(session.sessionDate)) return "overdue";
  return "upcoming";
}

function formatSessionDate(date: string) {
  const d = new Date(date);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("ar-EG", { month: "long" }),
    time: d.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

const CATEGORY_LABELS: Record<SessionCategory, string> = {
  normal: "عادية",
  appeal: "استئناف",
  cassation: "نقض",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: DashboardSession;
}

export default function SessionCard({ session }: SessionCardProps) {
  const router = useRouter();
  const displayStatus = getDisplayStatus(session);
  const { day, month, time } = formatSessionDate(session.sessionDate);
  const category = session.category ?? "normal";
  const isMandatory = session.isMandatory ?? false;

  // Pick border/bg colors based on category for upcoming sessions
  function getUpcomingVariant() {
    if (category === "appeal") {
      return {
        wrapper:
          "border-2 border-warning bg-warning/5 hover:bg-warning/10 border-l-[6px] border-l-warning",
        dateBg: "bg-warning/10",
        dateText: "text-warning",
        badge: "bg-warning text-white",
        badgeLabel: CATEGORY_LABELS.appeal,
        actionClass: "bg-warning/10 text-warning hover:bg-warning/20",
      };
    }
    if (category === "cassation") {
      return {
        wrapper:
          "border-2 border-error bg-error/5 hover:bg-error/10 border-l-[6px] border-l-error",
        dateBg: "bg-error/10",
        dateText: "text-error",
        badge: "bg-error text-white",
        badgeLabel: CATEGORY_LABELS.cassation,
        actionClass: "bg-error/10 text-error hover:bg-error/20",
      };
    }
    return {
      wrapper:
        "border-2 border-primary bg-primary/5 hover:bg-primary/10 border-l-[6px]",
      dateBg: "bg-primary/10",
      dateText: "text-primary",
      badge: "bg-primary text-white",
      badgeLabel: "قادمة",
      actionClass: "bg-primary/10 text-primary hover:bg-primary/20",
    };
  }

  // ─── variant config ──────────────────────────────────────────────────────
  const upcomingV = getUpcomingVariant();

  const variants = {
    overdue: {
      wrapper:
        "border-2 border-error bg-error/5 hover:bg-error/10 border-l-[6px]",
      dateBg: "bg-error/15",
      dateText: "text-error",
      icon: AlertTriangle,
      iconClass: "text-error",
      badge: "bg-error text-white",
      badgeLabel:
        category !== "normal"
          ? `${CATEGORY_LABELS[category]} — متأخرة`
          : "متأخرة",
      titleClass: "text-text-primary",
      actionLabel: "سجّل الآن",
      actionClass: "bg-error text-white hover:bg-error/90",
      helperText: "يجب تسجيل نتيجة الجلسة",
    },
    upcoming: {
      wrapper: upcomingV.wrapper,
      dateBg: upcomingV.dateBg,
      dateText: upcomingV.dateText,
      icon: Clock,
      iconClass: upcomingV.dateText,
      badge: upcomingV.badge,
      badgeLabel: upcomingV.badgeLabel,
      titleClass: "text-text-primary",
      actionLabel: "تسجيل نتيجة",
      actionClass: upcomingV.actionClass,
      helperText: null,
    },
    held: {
      wrapper:
        "border border-border bg-surface opacity-70 hover:opacity-90 border-l-[6px] border-l-border",
      dateBg: "bg-beige",
      dateText: "text-text-muted",
      icon: CheckCircle2,
      iconClass: "text-success",
      badge: "bg-border text-text-muted",
      badgeLabel:
        category !== "normal" ? `${CATEGORY_LABELS[category]} — تمت` : "تمت",
      titleClass: "text-text-muted",
      actionLabel: "عرض",
      actionClass: "bg-beige text-text-secondary hover:bg-border",
      helperText: null,
    },
  } as const;

  const v = variants[displayStatus];
  const Icon = v.icon;

  return (
    <div
      onClick={() => router.push(`/cases/${session.caseId}`)}
      className={`rounded-xl p-4 mb-3 cursor-pointer transition-all ${v.wrapper}`}
    >
      <div className="flex gap-3">
        {/* Date block */}
        <div
          className={`rounded-xl flex flex-col items-center justify-center min-w-[58px] px-2 py-2 ${v.dateBg}`}
        >
          <span className={`text-xs font-medium ${v.dateText}`}>{month}</span>
          <span className={`text-2xl font-bold leading-tight ${v.dateText}`}>
            {day}
          </span>
          <span className={`text-xs ${v.dateText}`}>{time}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4
              className={`font-bold text-sm leading-tight truncate ${v.titleClass}`}
            >
              {session.caseTitle}
            </h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 flex items-center gap-1 ${v.badge}`}
            >
              <Icon className="w-3 h-3" />
              {v.badgeLabel}
            </span>
          </div>

          {/* Mandatory indicator */}
          {isMandatory && displayStatus !== "held" && (
            <div className="flex items-center gap-1 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs text-warning font-semibold">
                جلسة إلزامية
              </span>
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate">{session.clientName}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Landmark className="w-3 h-3 shrink-0" />
              <span className="truncate">{session.courtName}</span>
            </div>
          </div>

          {/* Helper text for overdue */}
          {v.helperText && (
            <p className="text-xs text-error font-medium mb-2">
              ⚠ {v.helperText}
            </p>
          )}

          {/* Action button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/cases/${session.caseId}`);
            }}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${v.actionClass}`}
          >
            {v.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
