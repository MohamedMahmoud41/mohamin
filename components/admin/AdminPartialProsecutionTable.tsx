"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, Plus, Trash2, Edit2, X, Scale } from "lucide-react";
import {
  adminCreatePartialProsecution,
  adminUpdatePartialProsecution,
  adminDeletePartialProsecution,
} from "@/app/actions/admin/partial_prosecution";
import type { PartialProsecution, Court } from "@/types";

const ITEMS_PER_PAGE = 8;

function ProsecutionModal({
  item,
  courts,
  onClose,
  onDone,
}: {
  item?: PartialProsecution;
  courts: Court[];
  onClose: () => void;
  onDone: (
    data: Partial<PartialProsecution>,
    created?: PartialProsecution,
  ) => void;
}) {
  const [form, setForm] = useState({
    name: item?.name ?? "",
    courtId: item?.courtId ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!item;

  function handleSubmit() {
    if (!form.name.trim()) {
      setError("اسم النيابة مطلوب");
      return;
    }
    setError(null);
    const payload = { name: form.name, courtId: form.courtId || undefined };
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdatePartialProsecution(item!.id, payload)
        : await adminCreatePartialProsecution(payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      onDone(
        { name: form.name, courtId: form.courtId || undefined },
        !isEdit ? (res as { item?: PartialProsecution }).item : undefined,
      );
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">
            {isEdit ? "تعديل النيابة" : "إضافة نيابة جزئية"}
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
              اسم النيابة *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: نيابة مدينة نصر"
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            />
          </div>
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              المحكمة (اختياري)
            </label>
            <select
              value={form.courtId}
              onChange={(e) => setForm({ ...form, courtId: e.target.value })}
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            >
              <option value="">— بدون محكمة —</option>
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
        <p className="text-text-primary font-bold text-lg">
          حذف النيابة الجزئية
        </p>
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

export default function AdminPartialProsecutionTable({
  initialItems,
  courts,
}: {
  initialItems: PartialProsecution[];
  courts: Court[];
}) {
  const [list, setList] = useState<PartialProsecution[]>(initialItems);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<PartialProsecution | null>(null);
  const [isPending, startTransition] = useTransition();

  const courtMap = useMemo(
    () => new Map(courts.map((c) => [c.id, c.name])),
    [courts],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list
      .filter((p) => {
        const courtName = p.courtId ? (courtMap.get(p.courtId) ?? "") : "";
        return (
          p.name.toLowerCase().includes(q) ||
          courtName.toLowerCase().includes(q)
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
      const res = await adminDeletePartialProsecution(selected.id);
      if (!res.error)
        setList((prev) => prev.filter((p) => p.id !== selected.id));
      setModal(null);
      setSelected(null);
    });
  }

  return (
    <div dir="rtl" className="space-y-3">
      {modal === "add" && (
        <ProsecutionModal
          courts={courts}
          onClose={() => setModal(null)}
          onDone={(_d, created) => {
            if (created) setList((p) => [created, ...p]);
          }}
        />
      )}
      {modal === "edit" && selected && (
        <ProsecutionModal
          item={selected}
          courts={courts}
          onClose={() => setModal(null)}
          onDone={(data) => {
            setList((p) =>
              p.map((i) => (i.id === selected.id ? { ...i, ...data } : i)),
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
            إدارة النيابات الجزئية
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            عرض وإدارة جميع النيابات الجزئية المسجلة في النظام.
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          <Plus className="w-4 h-4" /> إضافة نيابة
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
            placeholder="بحث بالاسم أو المحكمة..."
            className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-beige-light/50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                اسم النيابة
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                المحكمة
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
                  لا توجد نيابات جزئية
                </td>
              </tr>
            )}
            {paginated.map((p) => (
              <tr key={p.id} className="hover:bg-beige-light/30 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Scale className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-semibold text-text-primary text-sm">
                      {p.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {p.courtId ? (courtMap.get(p.courtId) ?? "—") : "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelected(p);
                        setModal("edit");
                      }}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(p);
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
            لا توجد نيابات جزئية
          </div>
        )}
        {paginated.map((p) => (
          <div
            key={p.id}
            className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary text-sm">
                {p.name}
              </div>
              {p.courtId && (
                <div className="text-xs text-text-muted mt-0.5">
                  {courtMap.get(p.courtId) ?? "—"}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setSelected(p);
                  setModal("edit");
                }}
                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelected(p);
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
