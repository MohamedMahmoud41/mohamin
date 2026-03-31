"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, Plus, Trash2, Edit2, X, Tag } from "lucide-react";
import {
  adminCreateCaseType,
  adminUpdateCaseType,
  adminDeleteCaseType,
} from "@/app/actions/admin/case_types";
import { caseCategoryMap, caseCategoryOptions } from "@/lib/enums";
import type { CaseType, Court } from "@/types";
import type { CaseCategory } from "@/lib/enums";

const ITEMS_PER_PAGE = 8;

function CaseTypeModal({
  caseType,
  courts,
  onClose,
  onDone,
}: {
  caseType?: CaseType;
  courts: Court[];
  onClose: () => void;
  onDone: (data: Partial<CaseType>, created?: CaseType) => void;
}) {
  const [form, setForm] = useState({
    name: caseType?.name ?? "",
    category: (caseType?.category ?? "civil") as CaseCategory,
    courtIds: caseType?.courtIds ?? ([] as string[]),
  });
  const [courtSearch, setCourtSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!caseType;

  const filteredCourts = useMemo(() => {
    const q = courtSearch.trim().toLowerCase();
    return q ? courts.filter((c) => c.name.toLowerCase().includes(q)) : courts;
  }, [courts, courtSearch]);

  function toggleCourt(id: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      courtIds: checked
        ? [...prev.courtIds, id]
        : prev.courtIds.filter((cid) => cid !== id),
    }));
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setError("اسم نوع القضية مطلوب");
      return;
    }
    setError(null);
    const payload = {
      name: form.name,
      category: form.category,
      courtIds: form.courtIds,
    };
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateCaseType(caseType!.id, payload)
        : await adminCreateCaseType(payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      onDone(
        { name: form.name, category: form.category, courtIds: form.courtIds },
        !isEdit ? (res as { caseType?: CaseType }).caseType : undefined,
      );
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">
            {isEdit ? "تعديل نوع القضية" : "إضافة نوع قضية"}
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
              اسم نوع القضية *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: قضايا الإيجارات"
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
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              المحاكم{" "}
              <span className="text-text-muted font-normal">
                {form.courtIds.length > 0
                  ? `(${form.courtIds.length} محددة)`
                  : "(اختياري)"}
              </span>
            </label>
            <div className="relative mb-1.5">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={15}
              />
              <input
                type="text"
                value={courtSearch}
                onChange={(e) => setCourtSearch(e.target.value)}
                placeholder="بحث في المحاكم..."
                className="w-full pr-9 pl-3 py-2 border border-border rounded-lg bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
            <div className="max-h-44 overflow-y-auto border border-border rounded-lg bg-background divide-y divide-border/50">
              {filteredCourts.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">
                  لا توجد نتائج
                </p>
              ) : (
                filteredCourts.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-beige-light cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.courtIds.includes(c.id)}
                      onChange={(e) => toggleCourt(c.id, e.target.checked)}
                      className="rounded accent-primary w-4 h-4 flex-shrink-0"
                    />
                    <span className="text-sm text-text-primary leading-snug">
                      {c.name}
                    </span>
                  </label>
                ))
              )}
            </div>
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

function CourtCell({
  courtIds,
  courtMap,
}: {
  courtIds: string[];
  courtMap: Map<string, string>;
}) {
  if (courtIds.length === 0) return <span className="text-text-muted">—</span>;
  if (courtIds.length === 1)
    return <span>{courtMap.get(courtIds[0]) ?? "—"}</span>;
  return (
    <div className="flex items-center gap-1.5">
      <span className="truncate">{courtMap.get(courtIds[0]) ?? ""}</span>
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
        +{courtIds.length - 1}
      </span>
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
        <p className="text-text-primary font-bold text-lg">حذف نوع القضية</p>
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

export default function AdminCaseTypesTable({
  initialCaseTypes,
  courts,
}: {
  initialCaseTypes: CaseType[];
  courts: Court[];
}) {
  const [list, setList] = useState<CaseType[]>(initialCaseTypes);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<CaseType | null>(null);
  const [isPending, startTransition] = useTransition();

  const courtMap = useMemo(
    () => new Map(courts.map((c) => [c.id, c.name])),
    [courts],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list
      .filter((ct) => {
        const courtNames = ct.courtIds
          .map((id) => courtMap.get(id) ?? "")
          .join(" ");
        const catAr = caseCategoryMap[ct.category];
        return (
          ct.name.toLowerCase().includes(q) ||
          courtNames.toLowerCase().includes(q) ||
          catAr.includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [list, search, courtMap]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function confirmDelete() {
    if (!selected) return;
    startTransition(async () => {
      const res = await adminDeleteCaseType(selected.id);
      if (!res.error)
        setList((prev) => prev.filter((ct) => ct.id !== selected.id));
      setModal(null);
      setSelected(null);
    });
  }

  return (
    <div dir="rtl" className="space-y-3">
      {modal === "add" && (
        <CaseTypeModal
          courts={courts}
          onClose={() => setModal(null)}
          onDone={(_d, created) => {
            if (created) setList((p) => [created, ...p]);
          }}
        />
      )}
      {modal === "edit" && selected && (
        <CaseTypeModal
          caseType={selected}
          courts={courts}
          onClose={() => setModal(null)}
          onDone={(data) => {
            setList((p) =>
              p.map((ct) => (ct.id === selected.id ? { ...ct, ...data } : ct)),
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
            إدارة أنواع القضايا
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            عرض وإدارة جميع أنواع القضايا المسجلة في النظام.
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          <Plus className="w-4 h-4" /> إضافة نوع
        </button>
      </div>

      <div className="bg-surface p-4 rounded-2xl border border-border">
        <div className="relative">
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
            placeholder="بحث بالاسم أو الفئة أو المحكمة..."
            className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-right table-fixed">
          <colgroup>
            <col className="w-[38%]" />
            <col className="w-[14%]" />
            <col className="w-[36%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead className="bg-beige-light/50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                نوع القضية
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-text-muted">
                الفئة
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-text-muted">
                المحاكم
              </th>
              <th className="px-4 py-4 text-xs font-semibold text-text-muted text-left">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-16 text-center text-text-muted text-sm"
                >
                  لا توجد أنواع قضايا
                </td>
              </tr>
            )}
            {paginated.map((ct) => (
              <tr key={ct.id} className="hover:bg-beige-light/30 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-semibold text-text-primary text-sm truncate">
                      {ct.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-text-secondary whitespace-nowrap">
                  {caseCategoryMap[ct.category]}
                </td>
                <td className="px-4 py-4 text-sm text-text-secondary">
                  <CourtCell courtIds={ct.courtIds} courtMap={courtMap} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setSelected(ct);
                        setModal("edit");
                      }}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(ct);
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
            لا توجد أنواع قضايا
          </div>
        )}
        {paginated.map((ct) => (
          <div
            key={ct.id}
            className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary text-sm truncate">
                {ct.name}
              </div>
              <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1 flex-wrap">
                <span>{caseCategoryMap[ct.category]}</span>
                {ct.courtIds.length > 0 && (
                  <>
                    <span>·</span>
                    <span className="truncate">
                      {courtMap.get(ct.courtIds[0]) ?? ""}
                    </span>
                    {ct.courtIds.length > 1 && (
                      <span className="inline-flex items-center px-1 rounded bg-primary/10 text-primary text-[10px] font-semibold">
                        +{ct.courtIds.length - 1}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setSelected(ct);
                  setModal("edit");
                }}
                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelected(ct);
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
