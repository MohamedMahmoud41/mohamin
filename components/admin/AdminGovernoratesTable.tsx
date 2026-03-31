"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, Plus, Trash2, Edit2, X, MapPin } from "lucide-react";
import {
  adminCreateGovernorate,
  adminUpdateGovernorate,
  adminDeleteGovernorate,
} from "@/app/actions/admin/governorates";
import type { Governorate } from "@/types";

const ITEMS_PER_PAGE = 8;

function GovModal({
  gov,
  onClose,
  onDone,
}: {
  gov?: Governorate;
  onClose: () => void;
  onDone: (data: Partial<Governorate>, newGov?: Governorate) => void;
}) {
  const [form, setForm] = useState({
    name: gov?.name ?? "",
    code: gov?.code ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!gov;

  function handleSubmit() {
    if (!form.name.trim()) {
      setError("اسم المحافظة مطلوب");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateGovernorate(gov!.id, form)
        : await adminCreateGovernorate(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      onDone(
        form,
        !isEdit
          ? (res as { governorate?: Governorate }).governorate
          : undefined,
      );
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">
            {isEdit ? "تعديل المحافظة" : "إضافة محافظة جديدة"}
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
              اسم المحافظة *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: القاهرة"
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            />
          </div>
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              الكود (اختياري)
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="مثال: CAI"
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              dir="ltr"
            />
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
        <p className="text-text-primary font-bold text-lg">حذف المحافظة</p>
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

export default function AdminGovernoratesTable({
  initialGovernorates,
}: {
  initialGovernorates: Governorate[];
}) {
  const [list, setList] = useState<Governorate[]>(initialGovernorates);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<Governorate | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list
      .filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.code ?? "").toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [list, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function confirmDelete() {
    if (!selected) return;
    startTransition(async () => {
      const res = await adminDeleteGovernorate(selected.id);
      if (!res.error)
        setList((prev) => prev.filter((g) => g.id !== selected.id));
      setModal(null);
      setSelected(null);
    });
  }

  return (
    <div dir="rtl" className="space-y-3">
      {modal === "add" && (
        <GovModal
          onClose={() => setModal(null)}
          onDone={(_d, newGov) => {
            if (newGov) setList((p) => [newGov, ...p]);
          }}
        />
      )}
      {modal === "edit" && selected && (
        <GovModal
          gov={selected}
          onClose={() => setModal(null)}
          onDone={(data) => {
            setList((p) =>
              p.map((g) => (g.id === selected.id ? { ...g, ...data } : g)),
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
            إدارة المحافظات
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            عرض وإدارة جميع المحافظات المسجلة في النظام.
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          <Plus className="w-4 h-4" /> إضافة محافظة
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
            placeholder="بحث بالاسم أو الكود..."
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
                اسم المحافظة
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                الكود
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
                  لا توجد محافظات
                </td>
              </tr>
            )}
            {paginated.map((g) => (
              <tr key={g.id} className="hover:bg-beige-light/30 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-semibold text-text-primary text-sm">
                      {g.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {g.code ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelected(g);
                        setModal("edit");
                      }}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(g);
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
            لا توجد محافظات
          </div>
        )}
        {paginated.map((g) => (
          <div
            key={g.id}
            className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary text-sm">
                {g.name}
              </div>
              {g.code && (
                <div className="text-xs text-text-muted mt-0.5">{g.code}</div>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setSelected(g);
                  setModal("edit");
                }}
                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelected(g);
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
