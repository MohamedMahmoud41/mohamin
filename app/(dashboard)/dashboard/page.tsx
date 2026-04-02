import type { Metadata } from "next";
import Link from "next/link";
import { Scale, Activity, Clock, CircleCheckBig } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import {
  getCasesByUser,
  getUpcomingSessionsForCases,
  getTomorrowSessionsForCases,
} from "@/services/cases";
import { redirect } from "next/navigation";
import { StatCard, CaseCard, SessionCard } from "@/components/dashboard";
import type { Case, DashboardSession } from "@/types";

export const metadata: Metadata = { title: "لوحة التحكم" };

// ─── helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(status: string) {
  const s = status?.toString().trim().toLowerCase();
  if (
    ["نشطه", "نشطة", "active", "runing", "running", "جارية", "جاري"].includes(s)
  )
    return "active";
  if (["قيد الانتظار", "pending", "انتظار", "قيد الإنتظار"].includes(s))
    return "pending";
  if (
    [
      "مكتملة",
      "completed",
      "won",
      "مكسوبة",
      "مكسوبه",
      "منتهية لصالح الموكل",
    ].includes(s)
  )
    return "completed";
  return "other";
}

function calcTrend(curr: number, prev: number) {
  if (prev === 0)
    return {
      value: curr > 0 ? "100%" : "0%",
      direction: curr > 0 ? "up" : "neutral",
    } as const;
  const diff = ((curr - prev) / prev) * 100;
  return {
    value: `${Math.abs(diff).toFixed(0)}%`,
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
  } as const;
}

function getMonthlyStats(cases: Case[], monthOffset: number) {
  const target = new Date();
  target.setMonth(target.getMonth() - monthOffset);
  const m = target.getMonth();
  const y = target.getFullYear();

  const monthly = cases.filter((c) => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    return d.getMonth() === m && d.getFullYear() === y;
  });

  return {
    total: monthly.length,
    active: monthly.filter((c) => normalizeStatus(c.caseStatus) === "active")
      .length,
    pending: monthly.filter((c) => normalizeStatus(c.caseStatus) === "pending")
      .length,
    completed: monthly.filter(
      (c) => normalizeStatus(c.caseStatus) === "completed",
    ).length,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: user } = await getCurrentUser();
  const { data: casesData } = await getCasesByUser(
    authUser.id,
    user?.officeId ?? null,
  );
  const cases: Case[] = casesData ?? [];

  const caseIds = cases.map((c) => c.id);
  const { data: allUpcomingSessions = [] } = await getUpcomingSessionsForCases(
    caseIds,
    cases,
  );
  const { data: tomorrowSessions = [] } = await getTomorrowSessionsForCases(
    caseIds,
    cases,
  );

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalCases = cases.length;
  const activeCases = cases.filter(
    (c) => normalizeStatus(c.caseStatus) === "active",
  ).length;
  const pendingCases = cases.filter(
    (c) => normalizeStatus(c.caseStatus) === "pending",
  ).length;
  const completedCases = cases.filter(
    (c) => normalizeStatus(c.caseStatus) === "completed",
  ).length;

  const curr = getMonthlyStats(cases, 0);
  const prev = getMonthlyStats(cases, 1);

  const totalTrend = calcTrend(curr.total, prev.total);
  const activeTrend = calcTrend(curr.active, prev.active);
  const pendingTrend = calcTrend(curr.pending, prev.pending);
  const completedTrend = calcTrend(curr.completed, prev.completed);

  const stats = [
    {
      title: "إجمالي القضايا",
      value: totalCases,
      icon: Scale,
      trend: totalTrend.value,
      trendLabel: "من الشهر السابق",
      trendDirection: totalTrend.direction,
      color: "secondary" as const,
    },
    {
      title: "القضايا الجارية",
      value: activeCases,
      icon: Activity,
      trend: activeTrend.value,
      trendLabel: "من الشهر السابق",
      trendDirection: activeTrend.direction,
      color: "info" as const,
    },
    {
      title: "قيد الانتظار",
      value: pendingCases,
      icon: Clock,
      trend: pendingTrend.value,
      trendLabel: "من الشهر السابق",
      trendDirection: pendingTrend.direction,
      color: "warning" as const,
    },
    {
      title: "القضايا المكتملة",
      value: completedCases,
      icon: CircleCheckBig,
      trend: completedTrend.value,
      trendLabel: "من الشهر السابق",
      trendDirection: completedTrend.direction,
      color: "success" as const,
    },
  ];

  // ─── Recent cases (last 3) ────────────────────────────────────────────────
  const recentCases = [...cases]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  // ─── Sessions: overdue first (oldest→newest), then upcoming (nearest first) ──
  const now = new Date();
  const sessions: DashboardSession[] = allUpcomingSessions ?? [];
  const overdueSessions = sessions.filter((s) => now > new Date(s.sessionDate));

  // Tomorrow's sessions for the dedicated section
  const tomorrowList: DashboardSession[] = tomorrowSessions ?? [];

  return (
    <div className="p-4 md:p-8 bg-background min-h-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          لوحة التحكم
        </h1>
        <p className="text-text-muted mt-1">
          مرحباً {user?.firstName}، نظرة عامة على قضاياك وجلساتك القادمة
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-text-primary font-bold">
              القضايا الأخيرة
            </h2>
            <Link
              href="/cases"
              className="text-sm text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              عرض الكل
            </Link>
          </div>

          {recentCases.length === 0 && (
            <p className="text-center text-text-muted py-8">
              لا توجد قضايا بعد
            </p>
          )}

          <div className="flex flex-col gap-4">
            {recentCases.map((c) => (
              <CaseCard key={c.id} caseItem={c} hideLawyer />
            ))}
          </div>
        </div>

        {/* Sessions */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-text-primary font-bold">جلسات الغد</h2>
            <Link
              href="/sessions"
              className="text-sm text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              عرض الكل
            </Link>
          </div>

          {overdueSessions.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl bg-error/10 border border-error/30 text-error text-sm font-semibold">
              <span>⚠ لديك {overdueSessions.length} جلسة متأخرة</span>
              <Link
                href="/sessions"
                className="text-xs underline hover:no-underline mr-auto"
              >
                عرض
              </Link>
            </div>
          )}

          {tomorrowList.length > 0 ? (
            tomorrowList.map((s) => (
              <SessionCard key={s.sessionId} session={s} />
            ))
          ) : (
            <p className="text-center text-sm text-text-muted py-8">
              لا توجد جلسات غداً
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
