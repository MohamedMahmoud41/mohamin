"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Scale } from "lucide-react";
import { CaseCard } from "@/components/dashboard";
import type { Case } from "@/types";

type FilterId = "all" | "active" | "pending" | "completed" | "closed";

function normalizeStatus(status: string) {
  const s = status?.toString().trim().toLowerCase();
  if (
    ["نشطه", "نشطة", "active", "runing", "running", "جارية", "جاري"].includes(s)
  )
    return "active";
  if (["قيد الانتظار", "pending", "انتظار", "قيد الإنتظار"].includes(s))
    return "pending";
  if (["مكتملة", "completed", "won", "مكسوبة", "مكسوبه"].includes(s))
    return "completed";
  if (["closed", "مغلقة", "مرفوضة", "خسرت"].includes(s)) return "closed";
  return "unknown";
}

const filterColors: Record<FilterId, string> = {
  all: "border-border",
  active: "border-blue-500",
  pending: "border-yellow-500",
  completed: "border-green-500",
  closed: "border-border",
};

interface CasesFiltersProps {
  cases: Case[];
}

export default function CasesFilters({ cases }: CasesFiltersProps) {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const stats = {
    all: cases.length,
    active: cases.filter((c) => normalizeStatus(c.caseStatus) === "active")
      .length,
    pending: cases.filter((c) => normalizeStatus(c.caseStatus) === "pending")
      .length,
    completed: cases.filter(
      (c) => normalizeStatus(c.caseStatus) === "completed",
    ).length,
    closed: cases.filter((c) => normalizeStatus(c.caseStatus) === "closed")
      .length,
  };

  const filters: { id: FilterId; label: string }[] = [
    { id: "all", label: "الإجمالي" },
    { id: "active", label: "جارية" },
    { id: "pending", label: "قيد الانتظار" },
    { id: "completed", label: "مكتملة" },
    { id: "closed", label: "مغلقة" },
  ];

  const filteredCases = cases.filter((c) => {
    const query = searchValue.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.id.toLowerCase().includes(query) ||
      (c.clientName || "").toLowerCase().includes(query) ||
      (c.caseTitle || "").toLowerCase().includes(query);

    const matchesFilter =
      activeFilter === "all" || normalizeStatus(c.caseStatus) === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            إدارة القضايا الخاصة
          </h1>
          <p className="text-text-muted mt-1">عرض وإدارة جميع القضايا الخاصة</p>
        </div>
        <Link
          href="/cases/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium">إضافة قضية جديدة</span>
        </Link>
      </div>

      {/* Filter cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all bg-surface hover:shadow-md ${
              activeFilter === f.id
                ? filterColors[f.id]
                : "border-transparent hover:border-border"
            } ${f.id === "all" && activeFilter !== "all" ? "border-border" : ""}`}
          >
            <span className="text-3xl font-bold text-text-primary mb-1">
              {stats[f.id]}
            </span>
            <span className="text-sm text-text-muted font-medium">
              {f.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-8 border-b border-border pb-1 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-2 pb-3 px-2 transition-all whitespace-nowrap relative text-base ${
              activeFilter === f.id
                ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-text-secondary font-medium hover:text-primary"
            }`}
          >
            {f.id === "all" && <Scale className="w-5 h-5" />}
            <span>{f.label}</span>
            <span
              className={
                activeFilter === f.id ? "text-primary" : "text-text-secondary"
              }
            >
              ({stats[f.id]})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="ابحث عن قضية برقم القضية أو اسم العميل..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pr-10 pl-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface text-text-primary placeholder:text-text-muted"
        />
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {filteredCases.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted">
            لا توجد نتائج مطابقة
          </div>
        )}
        {filteredCases.map((c) => (
          <CaseCard key={c.id} caseItem={c} hideLawyer />
        ))}
      </div>
    </div>
  );
}
