"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Users,
  Briefcase,
  X,
  Scale,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import type { Lawyer, Case, User } from "@/types";

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

function isActive(status: string) {
  return ACTIVE_STATUSES.includes(status?.toLowerCase?.() ?? status);
}

function lawyerYear(createdAt: string) {
  return new Date(createdAt).getFullYear();
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-b from-primary to-accent rounded-xl flex items-center justify-center text-white">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-text-primary">{value}</div>
        <div className="text-text-muted text-sm">{label}</div>
      </div>
    </div>
  );
}

// ─── Add Lawyer Modal ─────────────────────────────────────────────────────────

function AddLawyerModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (email: string, role: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("lawyer");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">إضافة محامي</p>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige-light rounded-full"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary"
            />
          </div>
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              الدور
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary"
            >
              <option value="lawyer">محامي</option>
              <option value="officeOwner">مالك مكتب</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-beige-light transition"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              if (email.trim()) {
                onAdd(email.trim(), role);
                onClose();
              }
            }}
            className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition font-semibold"
          >
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  name,
  onClose,
  onConfirm,
}: {
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-error" />
        </div>
        <h2 className="text-text-primary font-bold text-xl mb-2">
          حذف المحامي
        </h2>
        <p className="text-text-muted text-sm mb-6">
          هل أنت متأكد من حذف{" "}
          <span className="font-semibold text-text-primary">{name}</span> من
          المكتب؟
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-beige-light transition"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-error text-white hover:opacity-90 transition"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type FilterType = "all" | "available" | "busy";

interface LawyersPanelProps {
  lawyers: Lawyer[];
  cases: Case[];
  currentUser: User;
}

export default function LawyersPanel({
  lawyers: initialLawyers,
  cases,
  currentUser,
}: LawyersPanelProps) {
  const [lawyers, setLawyers] = useState<Lawyer[]>(initialLawyers);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lawyer | null>(null);
  const [, startTransition] = useTransition();

  const isOwner = currentUser.role.includes("officeOwner");

  // Map lawyer id → active case count
  const activeCasesByLawyer = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach((c) => {
      if (isActive(c.caseStatus)) {
        map[c.lawyerID] = (map[c.lawyerID] ?? 0) + 1;
      }
    });
    return map;
  }, [cases]);

  const totalCasesByLawyer = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach((c) => {
      map[c.lawyerID] = (map[c.lawyerID] ?? 0) + 1;
    });
    return map;
  }, [cases]);

  // Stats
  const activeCount = lawyers.filter(
    (l) => (activeCasesByLawyer[l.id] ?? 0) > 0,
  ).length;
  const avgCases =
    lawyers.length > 0 ? Math.round(cases.length / lawyers.length) : 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const newCount = lawyers.filter(
    (l) => new Date(l.createdAt).getTime() > thirtyDaysAgo,
  ).length;

  // Filtered list
  const filteredLawyers = useMemo(() => {
    let list = lawyers;
    if (filter === "available")
      list = list.filter((l) => (activeCasesByLawyer[l.id] ?? 0) === 0);
    if (filter === "busy")
      list = list.filter((l) => (activeCasesByLawyer[l.id] ?? 0) > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
          l.specialization?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [lawyers, filter, search, activeCasesByLawyer]);

  function handleDelete(lawyer: Lawyer) {
    setLawyers((prev) => prev.filter((l) => l.id !== lawyer.id));
    setDeleteTarget(null);
    // TODO: wire up a server action to remove lawyer from office
    startTransition(async () => {
      // await removeLawyerFromOffice(lawyer.id);
    });
  }

  function handleAdd(email: string) {
    // Optimistic: show placeholder until page refresh
    // Real implementation would call an action → revalidatePath
    console.log("Invite lawyer by email:", email);
  }

  const filterLabels: { key: FilterType; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "available", label: "متاح" },
    { key: "busy", label: "مشغول" },
  ];

  return (
    <div dir="rtl" className="w-full bg-background p-8 space-y-8">
      {showAddModal && (
        <AddLawyerModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          name={`${deleteTarget.firstName} ${deleteTarget.lastName}`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">المحامون</h1>
          <p className="text-text-muted text-sm mt-1">
            قائمة محامي المكتب وإحصائياتهم
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
          >
            <Plus className="w-5 h-5" /> إضافة محامي
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي المحامين" value={lawyers.length} icon={Users} />
        <StatCard
          label="المحامون النشطون"
          value={activeCount}
          icon={Briefcase}
        />
        <StatCard label="متوسط القضايا" value={avgCases} icon={Scale} />
        <StatCard
          label="محامون جدد (30 يوم)"
          value={newCount}
          icon={Calendar}
        />
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-surface border border-border rounded-lg overflow-hidden">
          {filterLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2.5 text-sm font-medium transition ${
                filter === key
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-beige-light"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو التخصص..."
            className="w-full pr-10 pl-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* Lawyers Grid */}
      {filteredLawyers.length === 0 && (
        <div className="text-center text-text-muted py-20 border border-dashed border-border rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>لا يوجد محامون مطابقون</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLawyers.map((lawyer) => {
          const activeCases = activeCasesByLawyer[lawyer.id] ?? 0;
          const totalCases = totalCasesByLawyer[lawyer.id] ?? 0;
          const initials = `${lawyer.firstName?.[0] ?? ""}${lawyer.lastName?.[0] ?? ""}`;

          return (
            <div
              key={lawyer.id}
              className="bg-surface border border-border rounded-xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {lawyer.profileImageUrl ? (
                    <img
                      src={lawyer.profileImageUrl}
                      alt={initials}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-b from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {initials}
                    </div>
                  )}
                  <div>
                    <div className="text-text-primary font-bold">
                      {lawyer.firstName} {lawyer.lastName}
                    </div>
                    <div className="text-text-muted text-xs">
                      {lawyer.specialization || "محامي"}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    activeCases > 0
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {activeCases > 0 ? "مشغول" : "متاح"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-text-secondary">
                {lawyer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {lawyer.email}
                  </div>
                )}
                {lawyer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary" />{" "}
                    {lawyer.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> منذ{" "}
                  {lawyerYear(lawyer.createdAt)}
                </div>
              </div>

              <div className="flex gap-4 pt-2 border-t border-border text-center">
                <div className="flex-1">
                  <div className="text-lg font-bold text-text-primary">
                    {totalCases}
                  </div>
                  <div className="text-xs text-text-muted">إجمالي القضايا</div>
                </div>
                <div className="w-px bg-border" />
                <div className="flex-1">
                  <div className="text-lg font-bold text-text-primary">
                    {activeCases}
                  </div>
                  <div className="text-xs text-text-muted">قضايا نشطة</div>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={() => setDeleteTarget(lawyer)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-error text-sm border border-error/30 rounded-lg hover:bg-error/5 transition"
                >
                  <Trash2 className="w-4 h-4" /> إزالة من المكتب
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
