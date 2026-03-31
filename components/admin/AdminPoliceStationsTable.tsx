"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, Plus, Trash2, Edit2, X, Shield, MapPin } from "lucide-react";
import {
  adminCreatePoliceStation,
  adminUpdatePoliceStation,
  adminDeletePoliceStation,
} from "@/app/actions/admin/police_stations";
import type { PoliceStation, Governorate } from "@/types";

const ITEMS_PER_PAGE = 8;

function StationModal({
  station,
  governorates,
  onClose,
  onDone,
}: {
  station?: PoliceStation;
  governorates: Governorate[];
  onClose: () => void;
  onDone: (data: Partial<PoliceStation>, created?: PoliceStation) => void;
}) {
  const [form, setForm] = useState({
    name: station?.name ?? "",
    governorateId: station?.governorateId ?? "",
    address: station?.address ?? "",
    locationUrl: station?.locationUrl ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!station;

  function handleSubmit() {
    if (!form.name.trim()) {
      setError("اسم المركز مطلوب");
      return;
    }
    setError(null);
    const payload = {
      name: form.name,
      governorateId: form.governorateId || undefined,
      address: form.address || undefined,
      locationUrl: form.locationUrl || undefined,
    };
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdatePoliceStation(station!.id, payload)
        : await adminCreatePoliceStation(payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      onDone(
        {
          name: form.name,
          governorateId: form.governorateId || undefined,
          address: form.address || undefined,
          locationUrl: form.locationUrl || null,
        },
        !isEdit ? (res as { station?: PoliceStation }).station : undefined,
      );
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">
            {isEdit ? "تعديل مركز الشرطة" : "إضافة مركز شرطة"}
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
              اسم المركز *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: مركز مدينة نصر"
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            />
          </div>
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              المحافظة (اختياري)
            </label>
            <select
              value={form.governorateId}
              onChange={(e) =>
                setForm({ ...form, governorateId: e.target.value })
              }
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            >
              <option value="">— بدون محافظة —</option>
              {governorates.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              العنوان (اختياري)
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="العنوان التفصيلي"
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            />
          </div>
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              رابط الموقع على الخريطة (اختياري)
            </label>
            <input
              type="url"
              value={form.locationUrl}
              onChange={(e) =>
                setForm({ ...form, locationUrl: e.target.value })
              }
              placeholder="https://maps.google.com/..."
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
        <p className="text-text-primary font-bold text-lg">حذف مركز الشرطة</p>
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

export default function AdminPoliceStationsTable({
  initialStations,
  governorates,
}: {
  initialStations: PoliceStation[];
  governorates: Governorate[];
}) {
  const [list, setList] = useState<PoliceStation[]>(initialStations);
  const [search, setSearch] = useState("");
  const [govFilter, setGovFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<PoliceStation | null>(null);
  const [isPending, startTransition] = useTransition();

  const govMap = useMemo(
    () => new Map(governorates.map((g) => [g.id, g.name])),
    [governorates],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list
      .filter((s) => {
        const govName = s.governorateId
          ? (govMap.get(s.governorateId) ?? "")
          : "";
        const matchesSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          govName.toLowerCase().includes(q) ||
          (s.address ?? "").toLowerCase().includes(q);
        const matchesGov = !govFilter || s.governorateId === govFilter;
        return matchesSearch && matchesGov;
      })
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, [list, search, govFilter, govMap]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function confirmDelete() {
    if (!selected) return;
    startTransition(async () => {
      const res = await adminDeletePoliceStation(selected.id);
      if (!res.error)
        setList((prev) => prev.filter((s) => s.id !== selected.id));
      setModal(null);
      setSelected(null);
    });
  }

  return (
    <div dir="rtl" className="space-y-3">
      {modal === "add" && (
        <StationModal
          governorates={governorates}
          onClose={() => setModal(null)}
          onDone={(_d, created) => {
            if (created) setList((p) => [created, ...p]);
          }}
        />
      )}
      {modal === "edit" && selected && (
        <StationModal
          station={selected}
          governorates={governorates}
          onClose={() => setModal(null)}
          onDone={(data) => {
            setList((p) =>
              p.map((s) => (s.id === selected.id ? { ...s, ...data } : s)),
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
            إدارة مراكز الشرطة
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            عرض وإدارة جميع مراكز الشرطة المسجلة في النظام.
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          <Plus className="w-4 h-4" /> إضافة مركز
        </button>
      </div>

      {/* Search + Governorate filter */}
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
            placeholder="بحث بالاسم أو العنوان أو المحافظة..."
            className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
        <select
          value={govFilter}
          onChange={(e) => {
            setGovFilter(e.target.value);
            setPage(1);
          }}
          className="sm:w-52 py-3 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
        >
          <option value="">كل المحافظات</option>
          {governorates
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, "ar"))
            .map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-right table-fixed">
          <colgroup>
            <col className="w-56" />
            <col className="w-36" />
            <col className="w-64" />
            <col className="w-28" />
          </colgroup>
          <thead className="bg-beige-light/50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                اسم المركز
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                المحافظة
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                العنوان
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
                  colSpan={4}
                  className="py-16 text-center text-text-muted text-sm"
                >
                  لا توجد مراكز شرطة
                </td>
              </tr>
            )}
            {paginated.map((s) => (
              <tr key={s.id} className="hover:bg-beige-light/30 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-semibold text-text-primary text-sm truncate">
                      {s.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {s.governorateId ? (govMap.get(s.governorateId) ?? "—") : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {s.address ? (
                    s.locationUrl ? (
                      <a
                        href={s.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{s.address}</span>
                      </a>
                    ) : (
                      <span className="truncate block">{s.address}</span>
                    )
                  ) : s.locationUrl ? (
                    <a
                      href={s.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      عرض على الخريطة
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelected(s);
                        setModal("edit");
                      }}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(s);
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
            لا توجد مراكز شرطة
          </div>
        )}
        {paginated.map((s) => (
          <div
            key={s.id}
            className="bg-surface rounded-2xl border border-border p-4 flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary text-sm">
                {s.name}
              </div>
              {s.governorateId && (
                <div className="text-xs text-text-muted mt-0.5">
                  {govMap.get(s.governorateId) ?? "—"}
                </div>
              )}
              {s.address && (
                <div className="text-xs text-text-secondary mt-1">
                  {s.locationUrl ? (
                    <a
                      href={s.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <MapPin className="w-3 h-3" />
                      {s.address}
                    </a>
                  ) : (
                    s.address
                  )}
                </div>
              )}
              {!s.address && s.locationUrl && (
                <a
                  href={s.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline text-xs mt-1"
                >
                  <MapPin className="w-3 h-3" />
                  عرض على الخريطة
                </a>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setSelected(s);
                  setModal("edit");
                }}
                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelected(s);
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
