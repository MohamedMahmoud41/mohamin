"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, Plus, Trash2, Edit2, X, BookOpen } from "lucide-react";
import {
  adminCreateCourtDivision,
  adminUpdateCourtDivision,
  adminDeleteCourtDivision,
} from "@/app/actions/admin/court_divisions";
import { caseCategoryMap, caseCategoryOptions } from "@/lib/enums";
import type { CourtDivision } from "@/types";
import type { CaseCategory } from "@/lib/enums";

const ITEMS_PER_PAGE = 8;

function DivisionModal({
  division,
  onClose,
  onDone,
}: {
  division?: CourtDivision;
  onClose: () => void;
  onDone: (data: Partial<CourtDivision>, created?: CourtDivision) => void;
}) {
  const [form, setForm] = useState({
    name: division?.name ?? "",
    category: (division?.category ?? "civil") as CaseCategory,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!division;

  function handleSubmit() {
    if (!form.name.trim()) {
      setError("اسم القسم مطلوب");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateCourtDivision(division!.id, form)
        : await adminCreateCourtDivision(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      onDone(
        form,
        !isEdit ? (res as { division?: CourtDivision }).division : undefined,
      );
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">
            {isEdit ? "تعديل قسم المحكمة" : "إضافة قسم جديد"}
          </p>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige-light rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <p className="text-error text-sm bg-error/10 p-3 rounded-lg">
              {error}
            </p>
          )}
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              اسم القسم *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: قسم الجنح"
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            />
          </div>
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              الفئة *
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as CaseCategory })
              }
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            >
              {caseCategoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-beige-light transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition font-semibold disabled:opacity-50"
          >
            {isPending ? "جاري الحفظ..." : isEdit ? "حفظ" : "إضافة"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  name,
  onClose,
  onConfirm,
  isPending,
}: {
  name: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-4">
        <p className="text-text-primary font-bold text-lg">حذف قسم المحكمة</p>
        <p className="text-text-secondary text-sm">
          هل أنت متأكد من حذف{" "}
          <span className="font-semibold text-error">{name}</span>؟ لا يمكن
          التراجع عن هذا الإجراء.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-beige-light transition"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg bg-error text-white hover:bg-error/80 transition font-semibold disabled:opacity-50"
          >
            {isPending ? "جاري الحذف..." : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCourtDivisionsTable({
  initialDivisions,
}: {
  initialDivisions: CourtDivision[];
}) {
  const [list, setList] = useState<CourtDivision[]>(initialDivisions);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<CaseCategory | "">("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<CourtDivision | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list
      .filter((d) => {
        const matchesSearch =
          !q ||
          d.name.toLowerCase().includes(q) ||
          caseCategoryMap[d.category].includes(q);
        const matchesCat = !catFilter || d.category === catFilter;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [list, search, catFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function confirmDelete() {
    if (!selected) return;
    startTransition(async () => {
      const res = await adminDeleteCourtDivision(selected.id);
      if (!res.error)
        setList((prev) => prev.filter((d) => d.id !== selected.id));
      setModal(null);
      setSelected(null);
    });
  }

  return (
    <div dir="rtl" className="space-y-3">
      {modal === "add" && (
        <DivisionModal
          onClose={() => setModal(null)}
          onDone={(_d, created) => {
            if (created) setList((p) => [created, ...p]);
          }}
        />
      )}
      {modal === "edit" && selected && (
        <DivisionModal
          division={selected}
          onClose={() => setModal(null)}
          onDone={(data) => {
            setList((p) =>
              p.map((d) => (d.id === selected.id ? { ...d, ...data } : d)),
            );
          }}
        />
      )}
      {modal === "delete" && selected && (
        <DeleteModal
          name={selected.name}
          onClose={() => setModal(null)}
          onConfirm={confirmDelete}
          isPending={isPending}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            إدارة أقسام المحاكم
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            عرض وإدارة جميع أقسام المحاكم المسجلة في النظام.
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          <Plus className="w-4 h-4" /> إضافة قسم
        </button>
      </div>

      <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="بحث بالاسم أو الفئة..."
            className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value as CaseCategory | "");
            setPage(1);
          }}
          className="sm:w-48 py-3 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
        >
          <option value="">كل الفئات</option>
          {caseCategoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-right table-fixed">
          <colgroup>
            <col className="w-auto" />
            <col className="w-36" />
            <col className="w-28" />
          </colgroup>
          <thead className="bg-beige-light/50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                اسم القسم
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                الفئة
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted text-left">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-16 text-center text-text-muted text-sm"
                >
                  لا توجد أقسام
                </td>
              </tr>
            )}
            {paginated.map((d) => (
              <tr key={d.id} className="hover:bg-beige-light/30 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-semibold text-text-primary text-sm">
                      {d.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {caseCategoryMap[d.category]}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelected(d);
                        setModal("edit");
                      }}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(d);
                        setModal("delete");
                      }}
                      className="p-2 hover:bg-error/10 text-error rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {paginated.length === 0 && (
          <div className="bg-surface rounded-2xl border border-border py-12 text-center text-text-muted text-sm">
            لا توجد أقسام
          </div>
        )}
        {paginated.map((d) => (
          <div
            key={d.id}
            className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary text-sm">
                {d.name}
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                {caseCategoryMap[d.category]}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setSelected(d);
                  setModal("edit");
                }}
                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelected(d);
                  setModal("delete");
                }}
                className="p-2 hover:bg-error/10 text-error rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-beige-light disabled:opacity-40 transition"
          >
            السابق
          </button>
          <span className="text-sm text-text-muted">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-beige-light disabled:opacity-40 transition"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
