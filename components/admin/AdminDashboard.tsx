"use client";

import { useMemo } from "react";
import { Users, Building2, Gavel, FileText, TrendingUp } from "lucide-react";
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

  return (
    <div dir="rtl" className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">لوحة التحكم</h1>
        <p className="text-text-muted mt-1">
          نظرة عامة على أداء النظام والإحصائيات الحالية.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="bg-surface p-6 rounded-2xl border border-border">
        <div className="flex items-center justify-between mb-6">
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
    </div>
  );
}
