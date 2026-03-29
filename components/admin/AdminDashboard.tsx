"use client";

import { useMemo } from "react";
import {
  Users,
  Building2,
  Gavel,
  FileText,
  TrendingUp,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import type { Lawyer, Office, Court, Post, Case } from "@/types";

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

interface AdminDashboardProps {
  lawyers: Lawyer[];
  offices: Office[];
  courts: Court[];
  posts: Post[];
  cases: Case[];
}

export default function AdminDashboard({
  lawyers,
  offices,
  courts,
  posts,
  cases,
}: AdminDashboardProps) {
  const stats = [
    {
      label: "إجمالي المحامين",
      value: lawyers.length,
      icon: Users,
      sub: "نشط حالياً",
    },
    {
      label: "المكاتب المسجلة",
      value: offices.length,
      icon: Building2,
      sub: "مكتب معتمد",
    },
    {
      label: "المحاكم",
      value: courts.length,
      icon: Gavel,
      sub: "مسجلة بالنظام",
    },
    { label: "المنشورات", value: posts.length, icon: FileText, sub: "منشور" },
  ];

  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const casesInMonth = cases.filter((c) => {
        const cd = new Date(c.createdAt ?? "");
        return cd.getFullYear() === yr && cd.getMonth() === mo;
      }).length;
      const lawyersInMonth = lawyers.filter((l) => {
        const ld = new Date(l.createdAt ?? "");
        return ld.getFullYear() === yr && ld.getMonth() === mo;
      }).length;
      return {
        month: ARABIC_MONTHS[mo].slice(0, 3),
        cases: casesInMonth,
        lawyers: lawyersInMonth,
      };
    });
  }, [cases, lawyers]);

  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.cases, d.lawyers)),
    1,
  );

  // ─── Offices stats ──────────────────────────────────────────────────────────
  const officesWithOwner = offices.filter((o) => !!o.ownerId).length;
  const officesWithoutOwner = offices.length - officesWithOwner;
  const topOffices = useMemo(
    () =>
      [...offices]
        .sort(
          (a, b) => (b.membersIds?.length ?? 0) - (a.membersIds?.length ?? 0),
        )
        .slice(0, 5),
    [offices],
  );

  return (
    <div dir="rtl" className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">لوحة التحكم</h1>
        <p className="text-text-muted mt-1">
          نظرة عامة على أداء النظام والإحصائيات الحالية.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map(({ label, value, icon: Icon, sub }) => (
          <div
            key={label}
            className="bg-surface p-5 rounded-2xl border border-border flex flex-col gap-4"
          >
            <div className="flex items-center w-full gap-3">
              <div className="p-2 rounded-xl bg-beige-light text-text-secondary">
                <Icon size={22} />
              </div>
              <span className="ml-auto text-sm text-text-muted font-medium">
                {label}
              </span>
            </div>
            <span className="text-3xl font-bold text-text-primary text-right">
              {value}
            </span>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp size={12} />
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="bg-surface p-4 md:p-6 rounded-2xl border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">نشاط النظام</h2>
            <span className="text-sm text-text-muted">
              النشاط المسجل للمحامين والقضايا خلال الـ 12 شهر الماضية.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2 text-text-secondary">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" />{" "}
              قضايا
            </span>
            <span className="flex items-center gap-2 text-text-secondary">
              <span className="w-3 h-3 rounded-full bg-accent inline-block" />{" "}
              محامين جدد
            </span>
          </div>
        </div>

        {/* CSS bar chart */}
        <div className="flex items-end gap-2 h-56 overflow-x-auto pb-2">
          {chartData.map((d) => {
            const caseH = Math.round((d.cases / maxVal) * 100);
            const lawyerH = Math.round((d.lawyers / maxVal) * 100);
            return (
              <div
                key={d.month}
                className="flex-1 min-w-[40px] flex flex-col items-center gap-1 group"
              >
                <div className="w-full flex justify-center gap-0.5 h-44 items-end">
                  <div
                    className="w-[45%] bg-primary rounded-t transition-all"
                    style={{ height: `${caseH}%` }}
                    title={`قضايا: ${d.cases}`}
                  />
                  <div
                    className="w-[45%] bg-accent/70 rounded-t transition-all"
                    style={{ height: `${lawyerH}%` }}
                    title={`محامين: ${d.lawyers}`}
                  />
                </div>
                <span className="text-text-muted text-[10px]">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Offices section ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Office mini-stats */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-surface p-5 rounded-2xl border border-border flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-text-muted text-xs">مكاتب لها مالك</p>
              <p className="text-2xl font-bold text-text-primary">
                {officesWithOwner}
              </p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-2xl border border-border flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-text-muted text-xs">مكاتب بدون مالك</p>
              <p className="text-2xl font-bold text-text-primary">
                {officesWithoutOwner}
              </p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-2xl border border-border flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-text-muted text-xs">متوسط الأعضاء / مكتب</p>
              <p className="text-2xl font-bold text-text-primary">
                {offices.length > 0
                  ? Math.round(
                      offices.reduce(
                        (s, o) => s + (o.membersIds?.length ?? 0),
                        0,
                      ) / offices.length,
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Top offices table */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-text-primary">
              أبرز المكاتب
            </h2>
            <p className="text-text-muted text-xs mt-0.5">
              المكاتب الأعلى من حيث عدد الأعضاء
            </p>
          </div>
          {offices.length === 0 ? (
            <p className="text-center text-text-muted py-10 text-sm">
              لا توجد مكاتب مسجلة
            </p>
          ) : (
            <>
              {/* Table — hidden on mobile */}
              <table className="hidden sm:table w-full text-right">
                <thead className="bg-beige-light/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-text-muted">
                      المكتب
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-text-muted">
                      العنوان
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-text-muted text-center">
                      الأعضاء
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-text-muted text-center">
                      مالك
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topOffices.map((office) => (
                    <tr
                      key={office.id}
                      className="hover:bg-beige-light/30 transition"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-semibold text-text-primary truncate max-w-[140px]">
                            {office.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-text-secondary truncate max-w-[120px]">
                        {office.address || "—"}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                          {office.membersIds?.length ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {office.ownerId ? (
                          <span className="inline-block bg-success/10 text-success text-xs font-medium px-2 py-0.5 rounded-full">
                            نعم
                          </span>
                        ) : (
                          <span className="inline-block bg-warning/10 text-warning text-xs font-medium px-2 py-0.5 rounded-full">
                            لا
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cards — visible on mobile only */}
              <div className="sm:hidden flex flex-col divide-y divide-border">
                {topOffices.map((office) => (
                  <div
                    key={office.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">
                        {office.name}
                      </div>
                      {office.address && (
                        <div className="text-xs text-text-muted truncate mt-0.5">
                          {office.address}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                        {office.membersIds?.length ?? 0}
                      </span>
                      {office.ownerId ? (
                        <span className="bg-success/10 text-success text-xs font-medium px-2 py-0.5 rounded-full">
                          نعم
                        </span>
                      ) : (
                        <span className="bg-warning/10 text-warning text-xs font-medium px-2 py-0.5 rounded-full">
                          لا
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
