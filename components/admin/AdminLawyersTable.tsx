"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Mail,
  Phone,
  User,
} from "lucide-react";
import {
  adminCreateLawyer,
  adminUpdateLawyer,
  adminDeleteLawyer,
} from "@/app/actions/admin/lawyers";
import type { Lawyer } from "@/types";

const ITEMS_PER_PAGE = 8;

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddLawyerModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (l: Lawyer) => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!form.firstName || !form.email || !form.password) {
      setError("يرجى ملء الحقول المطلوبة");
      return;
    }
    startTransition(async () => {
      const res = await adminCreateLawyer(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      onClose();
    });
  }

  const fields = [
    { name: "firstName", label: "الاسم الأول *", type: "text" },
    { name: "lastName", label: "اسم العائلة", type: "text" },
    { name: "email", label: "البريد الإلكتروني *", type: "email" },
    { name: "password", label: "كلمة المرور *", type: "password" },
    { name: "phone", label: "رقم الهاتف", type: "text" },
    { name: "specialization", label: "التخصص", type: "text" },
    { name: "experience", label: "سنوات الخبرة", type: "text" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">إضافة محامي جديد</p>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige-light rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {error && (
            <div className="col-span-2 text-error text-sm bg-error/10 p-3 rounded-lg">
              {error}
            </div>
          )}
          {fields.map(({ name, label, type }) => (
            <div
              key={name}
              className={
                name === "email" || name === "password" ? "col-span-2" : ""
              }
            >
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                {label}
              </label>
              <input
                type={type}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
          ))}
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
            {isPending ? "جاري الإضافة..." : "إضافة"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditLawyerModal({
  lawyer,
  onClose,
  onUpdated,
}: {
  lawyer: Lawyer;
  onClose: () => void;
  onUpdated: (l: Lawyer) => void;
}) {
  const [form, setForm] = useState({
    firstName: lawyer.firstName,
    lastName: lawyer.lastName,
    phone: lawyer.phone,
    specialization: lawyer.specialization,
    experience: lawyer.experience,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    startTransition(async () => {
      const res = await adminUpdateLawyer(lawyer.id, form);
      if (res.error) {
        setError(res.error);
        return;
      }
      onUpdated({ ...lawyer, ...form });
      onClose();
    });
  }

  const fields = [
    { name: "firstName" as const, label: "الاسم الأول" },
    { name: "lastName" as const, label: "اسم العائلة" },
    { name: "phone" as const, label: "رقم الهاتف" },
    { name: "specialization" as const, label: "التخصص" },
    { name: "experience" as const, label: "الخبرة" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">تعديل بيانات المحامي</p>
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
          {fields.map(({ name, label }) => (
            <div key={name}>
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                {label}
              </label>
              <input
                type="text"
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
          ))}
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
            {isPending ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-error" />
        </div>
        <h2 className="text-text-primary font-bold text-xl mb-2">
          حذف المحامي
        </h2>
        <p className="text-text-muted text-sm mb-6">
          هل أنت متأكد من حذف{" "}
          <span className="font-semibold text-text-primary">{name}</span>؟
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-beige-light transition"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-lg bg-error text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {isPending ? "جاري الحذف..." : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminLawyersTable({
  initialLawyers,
}: {
  initialLawyers: Lawyer[];
}) {
  const [lawyers, setLawyers] = useState<Lawyer[]>(initialLawyers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<Lawyer | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lawyers
      .filter(
        (l) =>
          `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [lawyers, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function confirmDelete() {
    if (!selected) return;
    startTransition(async () => {
      const res = await adminDeleteLawyer(selected.id);
      if (!res.error)
        setLawyers((prev) => prev.filter((l) => l.id !== selected.id));
      setModal(null);
      setSelected(null);
    });
  }

  return (
    <div dir="rtl" className="space-y-6">
      {modal === "add" && (
        <AddLawyerModal
          onClose={() => setModal(null)}
          onAdded={(l) => setLawyers((p) => [l, ...p])}
        />
      )}
      {modal === "edit" && selected && (
        <EditLawyerModal
          lawyer={selected}
          onClose={() => setModal(null)}
          onUpdated={(updated) =>
            setLawyers((p) => p.map((l) => (l.id === updated.id ? updated : l)))
          }
        />
      )}
      {modal === "delete" && selected && (
        <DeleteModal
          name={`${selected.firstName} ${selected.lastName}`}
          onClose={() => setModal(null)}
          onConfirm={confirmDelete}
          isPending={isPending}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            إدارة المحامين
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            عرض وإدارة جميع المحامين المسجلين في النظام.
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          <Plus className="w-4 h-4" /> إضافة محامي
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
            placeholder="بحث عن محامي بالاسم أو البريد أو الهاتف..."
            className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-beige-light/50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                الاسم
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                معلومات الاتصال
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                التخصص
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
                  لا يوجد محامون
                </td>
              </tr>
            )}
            {paginated.map((lawyer) => {
              const name = `${lawyer.firstName} ${lawyer.lastName}`;
              const initials = `${lawyer.firstName?.[0] ?? ""}${lawyer.lastName?.[0] ?? ""}`;
              return (
                <tr
                  key={lawyer.id}
                  className="hover:bg-beige-light/30 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {lawyer.profileImageUrl ? (
                        <img
                          src={lawyer.profileImageUrl}
                          alt={initials}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-b from-accent/70 via-accent/50 to-accent/30 text-white flex items-center justify-center text-sm font-bold">
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-text-primary text-sm">
                          {name}
                        </div>
                        <div className="text-xs text-text-muted">
                          {new Date(lawyer.createdAt).getFullYear()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    {lawyer.email && (
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <Mail className="w-3 h-3" />
                        {lawyer.email}
                      </div>
                    )}
                    {lawyer.phone && (
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <Phone className="w-3 h-3" />
                        {lawyer.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {lawyer.specialization || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelected(lawyer);
                          setModal("edit");
                        }}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelected(lawyer);
                          setModal("delete");
                        }}
                        className="p-2 hover:bg-error/10 text-error rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
