"use client";

import { useState } from "react";
import { Building, Search, MapPin, ExternalLink, Filter } from "lucide-react";
import type { Court, Governorate } from "@/types";

interface CourtsPanelProps {
  courts: Court[];
  governorates: Governorate[];
}

const degreeLabels: Record<string, string> = {
  appeal: "استئناف",
  primary: "ابتدائي",
  partial: "جزئي",
  full: "كلي",
  family: "أسرة",
};

const degreeColors: Record<string, string> = {
  appeal: "bg-purple-100 text-purple-700",
  primary: "bg-blue-100 text-blue-700",
  partial: "bg-green-100 text-green-700",
  full: "bg-orange-100 text-orange-700",
  family: "bg-pink-100 text-pink-700",
};

export default function CourtsPanel({
  courts,
  governorates,
}: CourtsPanelProps) {
  const [search, setSearch] = useState("");
  const [filterDegree, setFilterDegree] = useState<string>("all");
  const [filterGov, setFilterGov] = useState<string>("all");

  const govMap = new Map(governorates.map((g) => [g.id, g.name]));

  const filtered = courts.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase());
    const matchesDegree =
      filterDegree === "all" || c.courtDegree === filterDegree;
    const matchesGov = filterGov === "all" || c.governorateId === filterGov;
    return matchesSearch && matchesDegree && matchesGov;
  });

  // Group by governorate for display
  const grouped = new Map<string, Court[]>();
  for (const court of filtered) {
    const govName = court.governorateId
      ? govMap.get(court.governorateId) || "غير محدد"
      : "غير محدد";
    if (!grouped.has(govName)) grouped.set(govName, []);
    grouped.get(govName)!.push(court);
  }

  const degrees = [
    ...new Set(courts.map((c) => c.courtDegree).filter(Boolean)),
  ];

  return (
    <div dir="rtl" className="w-full bg-background min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Building className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-text-primary text-2xl font-bold">
            المحاكم ومواقعها
          </h1>
          <p className="text-text-muted text-sm">
            {filtered.length} محكمة مسجلة
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border p-4 mb-6 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو العنوان..."
            className="w-full pr-10 p-3 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Degree filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-text-muted" />
            <button
              onClick={() => setFilterDegree("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterDegree === "all"
                  ? "bg-primary text-white"
                  : "bg-background text-text-secondary border border-border hover:bg-beige"
              }`}
            >
              كل الدرجات
            </button>
            {degrees.map((d) => (
              <button
                key={d!}
                onClick={() => setFilterDegree(d!)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterDegree === d
                    ? "bg-primary text-white"
                    : "bg-background text-text-secondary border border-border hover:bg-beige"
                }`}
              >
                {degreeLabels[d!] || d}
              </button>
            ))}
          </div>
          {/* Governorate filter */}
          <select
            value={filterGov}
            onChange={(e) => setFilterGov(e.target.value)}
            className="px-3 py-2 bg-background border-2 border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">كل المحافظات</option>
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courts list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Building className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">لا توجد محاكم تطابق البحث</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {[...grouped.entries()].map(([govName, govCourts]) => (
            <div key={govName}>
              <h2 className="text-text-primary text-lg font-bold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                {govName}
                <span className="text-text-muted text-sm font-normal">
                  ({govCourts.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {govCourts.map((court) => (
                  <div
                    key={court.id}
                    className="bg-surface rounded-lg border border-border p-5 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-text-primary font-bold flex-1">
                        {court.name}
                      </h3>
                      {court.courtDegree && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            degreeColors[court.courtDegree] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {degreeLabels[court.courtDegree] || court.courtDegree}
                        </span>
                      )}
                    </div>

                    {court.address && (
                      <div className="flex items-start gap-2 text-sm text-text-secondary mb-2">
                        <MapPin className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                        <span>{court.address}</span>
                      </div>
                    )}

                    {court.locationUrl && (
                      <a
                        href={court.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium mt-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        عرض على الخريطة
                      </a>
                    )}

                    {!court.address && !court.locationUrl && (
                      <p className="text-text-muted text-sm">
                        لا توجد بيانات موقع
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
