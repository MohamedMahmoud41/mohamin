"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ar } from "date-fns/locale";
import {
  CalendarDays,
  List,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import type { DashboardSession, SessionCategory } from "@/types";
// @ts-expect-error -- react-big-calendar CSS import handled by Next.js bundler
import "react-big-calendar/lib/css/react-big-calendar.css";

// ─── date-fns localizer ───────────────────────────────────────────────────────

const locales = { "ar-EG": ar };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 6 }),
  getDay,
  locales,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

type DisplayStatus = "upcoming" | "overdue" | "held";

function getDisplayStatus(session: DashboardSession): DisplayStatus {
  if (session.status === "held") return "held";
  if (new Date() > new Date(session.sessionDate)) return "overdue";
  return "upcoming";
}

const CATEGORY_LABELS: Record<SessionCategory, string> = {
  normal: "عادية",
  appeal: "استئناف",
  cassation: "نقض",
};

const CATEGORY_BG: Record<SessionCategory, string> = {
  normal: "#6366f1",
  appeal: "#f59e0b",
  cassation: "#ef4444",
};

// ─── Calendar event type ──────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: DashboardSession;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SessionsPageClientProps {
  sessions: DashboardSession[];
}

export default function SessionsPageClient({
  sessions,
}: SessionsPageClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [calendarView, setCalendarView] = useState<View>("month");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [filterCategory, setFilterCategory] = useState<SessionCategory | "all">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<DisplayStatus | "all">(
    "all",
  );

  // Filter sessions
  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const cat = s.category ?? "normal";
      if (filterCategory !== "all" && cat !== filterCategory) return false;
      if (filterStatus !== "all" && getDisplayStatus(s) !== filterStatus)
        return false;
      return true;
    });
  }, [sessions, filterCategory, filterStatus]);

  // Calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return filtered.map((s) => {
      const start = new Date(s.sessionDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1-hour default
      return {
        id: s.sessionId,
        title: s.caseTitle,
        start,
        end,
        resource: s,
      };
    });
  }, [filtered]);

  // Event styling for calendar
  function eventStyleGetter(event: CalendarEvent) {
    const cat = (event.resource.category ?? "normal") as SessionCategory;
    const status = getDisplayStatus(event.resource);
    const bgColor = status === "held" ? "#9ca3af" : CATEGORY_BG[cat];
    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: "6px",
        opacity: status === "held" ? 0.6 : 1,
        color: "#fff",
        border: "none",
        fontSize: "12px",
        padding: "2px 6px",
      },
    };
  }

  // ─── Sorted list for list view ──────────────────────────────────────────
  const sortedList = useMemo(() => {
    const now = new Date();
    const overdue = filtered
      .filter((s) => getDisplayStatus(s) === "overdue")
      .sort(
        (a, b) =>
          new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
      );
    const upcoming = filtered
      .filter((s) => getDisplayStatus(s) === "upcoming")
      .sort(
        (a, b) =>
          new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
      );
    const held = filtered
      .filter((s) => getDisplayStatus(s) === "held")
      .sort(
        (a, b) =>
          new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
      );
    return [...overdue, ...upcoming, ...held];
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {/* View toggle */}
        <div className="flex gap-1 bg-beige rounded-xl p-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === "calendar"
                ? "bg-primary text-white shadow"
                : "text-text-secondary hover:bg-surface"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            تقويم
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              viewMode === "list"
                ? "bg-primary text-white shadow"
                : "text-text-secondary hover:bg-surface"
            }`}
          >
            <List className="w-4 h-4" />
            قائمة
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as SessionCategory | "all")
            }
            className="border border-border rounded-lg px-3 py-2 bg-surface text-text-primary text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">كل الأنواع</option>
            <option value="normal">عادية</option>
            <option value="appeal">استئناف</option>
            <option value="cassation">نقض</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as DisplayStatus | "all")
            }
            className="border border-border rounded-lg px-3 py-2 bg-surface text-text-primary text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">كل الحالات</option>
            <option value="upcoming">قادمة</option>
            <option value="overdue">متأخرة</option>
            <option value="held">تمت</option>
          </select>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-surface rounded-2xl border border-border p-4 overflow-x-auto sessions-calendar">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={calendarView}
            onView={setCalendarView}
            date={calendarDate}
            onNavigate={setCalendarDate}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) =>
              router.push(`/cases/${event.resource.caseId}`)
            }
            messages={{
              today: "اليوم",
              previous: "السابق",
              next: "التالي",
              month: "شهر",
              week: "أسبوع",
              day: "يوم",
              agenda: "جدول",
              noEventsInRange: "لا توجد جلسات في هذه الفترة",
            }}
            culture="ar-EG"
            rtl
            style={{ minHeight: 600 }}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {sortedList.length === 0 && (
            <p className="text-center text-text-muted py-12 text-sm">
              لا توجد جلسات مطابقة للفلتر
            </p>
          )}
          {sortedList.map((s) => (
            <SessionListItem
              key={s.sessionId}
              session={s}
              onClick={() => router.push(`/cases/${s.caseId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Session List Item ────────────────────────────────────────────────────────

function SessionListItem({
  session,
  onClick,
}: {
  session: DashboardSession;
  onClick: () => void;
}) {
  const status = getDisplayStatus(session);
  const category = (session.category ?? "normal") as SessionCategory;
  const isMandatory = session.isMandatory ?? false;
  const date = new Date(session.sessionDate);

  const statusConfig = {
    overdue: {
      icon: AlertTriangle,
      iconClass: "text-error",
      border: "border-error",
      bg: "bg-error/5",
      label: "متأخرة",
      labelClass: "bg-error text-white",
    },
    upcoming: {
      icon: Clock,
      iconClass:
        category === "cassation"
          ? "text-error"
          : category === "appeal"
            ? "text-warning"
            : "text-primary",
      border:
        category === "cassation"
          ? "border-error"
          : category === "appeal"
            ? "border-warning"
            : "border-primary",
      bg:
        category === "cassation"
          ? "bg-error/5"
          : category === "appeal"
            ? "bg-warning/5"
            : "bg-primary/5",
      label: "قادمة",
      labelClass:
        category === "cassation"
          ? "bg-error text-white"
          : category === "appeal"
            ? "bg-warning text-white"
            : "bg-primary text-white",
    },
    held: {
      icon: CheckCircle2,
      iconClass: "text-text-muted",
      border: "border-border",
      bg: "bg-surface",
      label: "تمت",
      labelClass: "bg-border text-text-muted",
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 border-2 ${statusConfig.border} ${statusConfig.bg} cursor-pointer hover:shadow-md transition-all ${
        status === "held" ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${statusConfig.iconClass}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm text-text-primary truncate">
              {session.caseTitle}
            </h4>
            <div className="flex items-center gap-1.5 shrink-0">
              {category !== "normal" && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: CATEGORY_BG[category] + "20",
                    color: CATEGORY_BG[category],
                  }}
                >
                  {CATEGORY_LABELS[category]}
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusConfig.labelClass}`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>

          {isMandatory && status !== "held" && (
            <div className="flex items-center gap-1 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs text-warning font-semibold">
                جلسة إلزامية
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span>
              {date.toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              —{" "}
              {date.toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {session.clientName}
            </span>
            <span className="flex items-center gap-1">
              <Landmark className="w-3 h-3" />
              {session.courtName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
