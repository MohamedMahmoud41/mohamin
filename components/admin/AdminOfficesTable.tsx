"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  MapPin,
  Phone,
  Building2,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  adminCreateOffice,
  adminUpdateOffice,
  adminDeleteOffice,
} from "@/app/actions/admin/offices";
import type { Office, User } from "@/types";

const ITEMS_PER_PAGE = 8;

// ─── Multi-select lawyers dropdown ───────────────────────────────────────────

function LawyersMultiSelect({
  lawyers,
  selected,
  onChange,
}: {
  lawyers: User[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  const label =
    selected.length === 0
      ? "اختر المحامين..."
      : `${selected.length} محامي محدد`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-border rounded-lg p-3 bg-background text-text-primary text-sm outline-none focus:border-primary"
      >
        <span className={selected.length === 0 ? "text-text-muted" : ""}>
          {label}
        </span>
        <ChevronDown className="w-4 h-4 text-text-muted" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {lawyers.length === 0 && (
            <p className="px-4 py-3 text-text-muted text-sm">
              لا يوجد محامون مسجلون
            </p>
          )}
          {lawyers.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => toggle(l.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-beige-light transition text-sm text-text-primary"
            >
              <span>
                {l.firstName} {l.lastName}
                <span className="text-text-muted text-xs mr-2">{l.email}</span>
              </span>
              {selected.includes(l.id) && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddOfficeModal({
  onClose,
  onAdded,
  eligibleOwners,
  eligibleLawyers,
}: {
  onClose: () => void;
  onAdded: (o: Office) => void;
  eligibleOwners: User[];
  eligibleLawyers: User[];
}) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    description: "",
  });
  const [ownerId, setOwnerId] = useState("");
  const [lawyerIds, setLawyerIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!form.name) {
      setError("اسم المكتب مطلوب");
      return;
    }
    startTransition(async () => {
      const res = await adminCreateOffice({
        ...form,
        ownerId: ownerId || undefined,
        lawyerIds,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.office) onAdded(res.office);
      onClose();
    });
  }

  const fields = [
    { name: "name" as const, label: "اسم المكتب *", type: "text" },
    { name: "phone" as const, label: "رقم الهاتف", type: "text" },
    { name: "address" as const, label: "العنوان", type: "text" },
    { name: "email" as const, label: "البريد الإلكتروني", type: "email" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">إضافة مكتب جديد</p>
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
            <div key={name}>
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
          <div className="col-span-2">
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              نبذة عن المكتب
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm resize-none"
            />
          </div>

          {/* Office Owner */}
          <div className="col-span-2">
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              مالك المكتب
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            >
              <option value="">-- اختر مالك المكتب --</option>
              {eligibleOwners.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Lawyers */}
          <div className="col-span-2">
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              المحامون
            </label>
            <LawyersMultiSelect
              lawyers={eligibleLawyers}
              selected={lawyerIds}
              onChange={setLawyerIds}
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
            {isPending ? "جاري الإضافة..." : "إضافة"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditOfficeModal({
  office,
  onClose,
  onUpdated,
  eligibleOwners,
  eligibleLawyers,
}: {
  office: Office;
  onClose: () => void;
  onUpdated: (o: Office) => void;
  eligibleOwners: User[];
  eligibleLawyers: User[];
}) {
  const [form, setForm] = useState({
    name: office.name,
    address: office.address,
    email: office.email,
    phone: office.phone,
    description: office.description,
  });
  const [ownerId, setOwnerId] = useState(office.ownerId ?? "");
  const [lawyerIds, setLawyerIds] = useState<string[]>(
    // pre-select lawyers: members excluding the owner
    office.membersIds.filter((id) => id !== office.ownerId),
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    startTransition(async () => {
      const res = await adminUpdateOffice(office.id, {
        ...form,
        ownerId: ownerId || undefined,
        lawyerIds,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      const newMembers = Array.from(
        new Set([...(ownerId ? [ownerId] : []), ...lawyerIds]),
      );
      onUpdated({ ...office, ...form, ownerId, membersIds: newMembers });
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">تعديل بيانات المكتب</p>
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
          {(["name", "address", "email", "phone"] as const).map((field) => (
            <div key={field}>
              <label className="text-secondary text-sm font-medium mb-1.5 block capitalize">
                {field === "name"
                  ? "الاسم"
                  : field === "address"
                    ? "العنوان"
                    : field === "email"
                      ? "البريد"
                      : "الهاتف"}
              </label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
          ))}
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              نبذة عن المكتب
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm resize-none"
            />
          </div>

          {/* Office Owner */}
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              مالك المكتب
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
            >
              <option value="">-- اختر مالك المكتب --</option>
              {eligibleOwners.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Lawyers */}
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              المحامون
            </label>
            <LawyersMultiSelect
              lawyers={eligibleLawyers}
              selected={lawyerIds}
              onChange={setLawyerIds}
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
            {isPending ? "جاري الحفظ..." : "حفظ"}
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-error" />
        </div>
        <h2 className="text-text-primary font-bold text-xl mb-2">حذف المكتب</h2>
        <p className="text-text-muted text-sm mb-6">
          هل أنت متأكد من حذف مكتب{" "}
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

export default function AdminOfficesTable({
  initialOffices,
  eligibleOwners,
  eligibleLawyers,
}: {
  initialOffices: Office[];
  eligibleOwners: User[];
  eligibleLawyers: User[];
}) {
  const [offices, setOffices] = useState<Office[]>(initialOffices);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<Office | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return offices
      .filter(
        (o) =>
          o.name?.toLowerCase().includes(q) ||
          o.address?.toLowerCase().includes(q) ||
          o.phone?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [offices, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function confirmDelete() {
    if (!selected) return;
    startTransition(async () => {
      const res = await adminDeleteOffice(selected.id);
      if (!res.error)
        setOffices((prev) => prev.filter((o) => o.id !== selected.id));
      setModal(null);
      setSelected(null);
    });
  }

  return (
    <div dir="rtl" className="space-y-6">
      {modal === "add" && (
        <AddOfficeModal
          onClose={() => setModal(null)}
          onAdded={(o) => setOffices((p) => [o, ...p])}
          eligibleOwners={eligibleOwners}
          eligibleLawyers={eligibleLawyers}
        />
      )}
      {modal === "edit" && selected && (
        <EditOfficeModal
          office={selected}
          onClose={() => setModal(null)}
          onUpdated={(updated) =>
            setOffices((p) => p.map((o) => (o.id === updated.id ? updated : o)))
          }
          eligibleOwners={eligibleOwners}
          eligibleLawyers={eligibleLawyers}
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
            إدارة المكاتب
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            عرض وإدارة جميع مكاتب المحاماة المسجلة.
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          <Plus className="w-4 h-4" /> إضافة مكتب
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
            placeholder="بحث عن مكتب بالاسم أو العنوان..."
            className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
      </div>

      {/* Table — hidden on mobile */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-beige-light/50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                اسم المكتب
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                العنوان
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                سنة التأسيس
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
                  لا توجد مكاتب
                </td>
              </tr>
            )}
            {paginated.map((office) => (
              <tr
                key={office.id}
                className="hover:bg-beige-light/30 transition"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary text-sm">
                        {office.name}
                      </div>
                      {office.phone && (
                        <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                          <Phone className="w-3 h-3" />
                          {office.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    {office.address || "—"}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {new Date(office.createdAt).getFullYear()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelected(office);
                        setModal("edit");
                      }}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelected(office);
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

      {/* Cards — visible on mobile only */}
      <div className="sm:hidden flex flex-col gap-3">
        {paginated.length === 0 && (
          <div className="bg-surface rounded-2xl border border-border py-12 text-center text-text-muted text-sm">
            لا توجد مكاتب
          </div>
        )}
        {paginated.map((office) => (
          <div
            key={office.id}
            className="bg-surface rounded-2xl border border-border p-4 flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary text-sm">
                {office.name}
              </div>
              {office.phone && (
                <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  {office.phone}
                </div>
              )}
              {office.address && (
                <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-text-muted" />
                  <span className="truncate">{office.address}</span>
                </div>
              )}
              <div className="text-xs text-text-muted mt-1">
                تأسس {new Date(office.createdAt).getFullYear()}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setSelected(office);
                  setModal("edit");
                }}
                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelected(office);
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
