"use client";

import { useMemo } from "react";
import { TrendingUp, Briefcase, CheckCircle, Award, Users } from "lucide-react";
import type { Case, Lawyer } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = [
  "نشطه",
  "نشطة",
  "active",
  "runing",
  "running",
  "جارية",
  "جاري",
];
const SUCCESS_STATUSES = ["completed", "مكتملة", "won", "مكسوبة", "مكسوبه"];

function normalizeStatus(s: string): "active" | "success" | "other" {
  const low = (s ?? "").toLowerCase();
  if (ACTIVE_STATUSES.some((a) => a.toLowerCase() === low)) return "active";
  if (SUCCESS_STATUSES.some((a) => a.toLowerCase() === low)) return "success";
  return "other";
}

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "primary",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-b ${
          color === "success"
            ? "from-success to-emerald-700"
            : color === "warning"
              ? "from-warning to-amber-700"
              : "from-primary to-accent"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-text-primary">{value}</div>
        <div className="text-text-muted text-sm">{label}</div>
        {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-semibold">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-primary to-accent rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ReportsDashboardProps {
  cases: Case[];
  lawyers: Lawyer[];
}

export default function ReportsDashboard({
  cases,
  lawyers,
}: ReportsDashboardProps) {
  // ── KPIs ──
  const totalCases = cases.length;
  const activeCases = useMemo(
    () =>
      cases.filter((c) => normalizeStatus(c.caseStatus) === "active").length,
    [cases],
  );
  const successCases = useMemo(
    () =>
      cases.filter((c) => normalizeStatus(c.caseStatus) === "success").length,
    [cases],
  );
  const successRate =
    totalCases > 0 ? Math.round((successCases / totalCases) * 100) : 0;

  // ── Case type distribution ──
  const caseTypeMap = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach((c) => {
      const t = c.caseType || "غير محدد";
      map[t] = (map[t] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [cases]);

  // ── Monthly trend (last 12 months) ──
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: {
      month: string;
      count: number;
      active: number;
      success: number;
    }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const filtered = cases.filter((c) => {
        const cd = new Date(c.createdAt ?? "");
        return cd.getFullYear() === yr && cd.getMonth() === mo;
      });
      months.push({
        month: ARABIC_MONTHS[mo],
        count: filtered.length,
        active: filtered.filter(
          (c) => normalizeStatus(c.caseStatus) === "active",
        ).length,
        success: filtered.filter(
          (c) => normalizeStatus(c.caseStatus) === "success",
        ).length,
      });
    }
    return months;
  }, [cases]);

  // ── Lawyer performance ──
  const lawyerStats = useMemo(() => {
    return lawyers
      .map((l) => {
        const lCases = cases.filter((c) => c.lawyerID === l.id);
        const lSuccess = lCases.filter(
          (c) => normalizeStatus(c.caseStatus) === "success",
        ).length;
        const rate =
          lCases.length > 0 ? Math.round((lSuccess / lCases.length) * 100) : 0;
        return { lawyer: l, total: lCases.length, success: lSuccess, rate };
      })
      .filter((x) => x.total > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [cases, lawyers]);

  return (
    <div dir="rtl" className="w-full bg-background p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          التقارير والإحصائيات
        </h1>
        <p className="text-text-muted text-sm mt-1">
          نظرة عامة شاملة على أداء المكتب
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="إجمالي القضايا" value={totalCases} icon={Briefcase} />
        <KpiCard
          label="القضايا النشطة"
          value={activeCases}
          icon={TrendingUp}
          color="warning"
        />
        <KpiCard
          label="القضايا المكتملة"
          value={successCases}
          icon={CheckCircle}
          color="success"
        />
        <KpiCard
          label="نسبة النجاح"
          value={`${successRate}%`}
          icon={Award}
          color="success"
        />
      </div>

      {/* Monthly chart */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-text-primary font-bold text-lg mb-6">
          الأداء الشهري خلال 12 شهر
        </h2>
        <div className="flex items-end gap-2 h-48 overflow-x-auto pb-2">
          {monthlyData.map((m) => {
            const maxCount = Math.max(...monthlyData.map((x) => x.count), 1);
            const heightPct = Math.round((m.count / maxCount) * 100);
            const successHeightPct = Math.round((m.success / maxCount) * 100);
            return (
              <div
                key={m.month}
                className="flex-1 min-w-[36px] flex flex-col items-center gap-1 group"
              >
                <div className="text-text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition">
                  {m.count}
                </div>
                <div className="w-full flex flex-col justify-end gap-0.5 h-36 relative">
                  <div
                    className="w-full rounded-t bg-gradient-to-b from-primary to-accent transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`إجمالي: ${m.count}`}
                  />
                  <div
                    className="absolute bottom-0 w-full rounded-t bg-success/70 transition-all"
                    style={{ height: `${successHeightPct}%` }}
                    title={`مكتملة: ${m.success}`}
                  />
                </div>
                <span className="text-text-muted text-[10px] truncate w-full text-center">
                  {m.month.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-primary inline-block" /> إجمالي
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-success/70 inline-block" />{" "}
            مكتملة
          </span>
        </div>
      </div>

      {/* Bottom two-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case type distribution */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-text-primary font-bold text-lg">
            توزيع أنواع القضايا
          </h2>
          {caseTypeMap.length === 0 && (
            <p className="text-text-muted text-sm text-center py-8">
              لا توجد بيانات
            </p>
          )}
          {caseTypeMap.map(([type, count]) => (
            <div key={type}>
              <ProgressBar label={type} count={count} total={totalCases} />
            </div>
          ))}
        </div>

        {/* Lawyer performance */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-text-primary font-bold text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> أفضل المحامين
          </h2>
          {lawyerStats.length === 0 && (
            <p className="text-text-muted text-sm text-center py-8">
              لا توجد بيانات
            </p>
          )}
          <div className="space-y-3">
            {lawyerStats.map(({ lawyer, total, success, rate }, idx) => (
              <div
                key={lawyer.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-beige-light transition"
              >
                <div className="w-8 h-8 bg-gradient-to-b from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary font-semibold text-sm truncate">
                    {lawyer.firstName} {lawyer.lastName}
                  </div>
                  <div className="text-text-muted text-xs">
                    {total} قضية · {success} مكتملة
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-primary font-bold text-sm">{rate}%</div>
                  <div className="text-text-muted text-xs">نسبة نجاح</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lawyers count footer */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-b from-primary to-accent rounded-xl flex items-center justify-center text-white">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <div className="text-text-primary font-bold">
            {lawyers.length} محامي في المكتب
          </div>
          <div className="text-text-muted text-xs">
            متوسط{" "}
            {lawyers.length > 0 ? Math.round(totalCases / lawyers.length) : 0}{" "}
            قضية لكل محامي
          </div>
        </div>
      </div>
    </div>
  );
}
