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
  ShieldOff,
  ShieldCheck,
  Clock,
  User as UserIcon,
  Eye,
  EyeOff,
  FlaskConical,
} from "lucide-react";
import {
  adminCreateUser,
  adminUpdateUser,
  adminBanUser,
  adminUnbanUser,
  adminDeleteUser,
  adminToggleTest,
} from "@/app/actions/admin/users";
import type { User, UserRole } from "@/types";

const ITEMS_PER_PAGE = 10;

const ALL_ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: "lawyer", label: "محامي", color: "bg-blue-100 text-blue-700" },
  {
    value: "officeOwner",
    label: "صاحب مكتب",
    color: "bg-purple-100 text-purple-700",
  },
  { value: "admin", label: "مدير النظام", color: "bg-red-100 text-red-700" },
];

function RoleBadge({ role }: { role: string }) {
  const def = ALL_ROLES.find((r) => r.value === role);
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${def?.color ?? "bg-gray-100 text-gray-600"}`}
    >
      {def?.label ?? role}
    </span>
  );
}

function testTimeRemaining(createdAt: string): string {
  const expires = new Date(createdAt).getTime() + 72 * 60 * 60 * 1000;
  const diff = expires - Date.now();
  if (diff <= 0) return "منتهية";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}س ${m}د متبقية`;
}

const SPECIALIZATIONS = [
  "قانون مدني",
  "قانون تجاري",
  "قانون جنائي",
  "قانون الأسرة",
  "قانون العمل",
  "قانون إداري",
  "قانون دولي",
  "قانون عقاري",
  "قانون الملكية الفكرية",
  "قانون الشركات",
  "قانون الضرائب",
  "قانون الإفلاس",
  "قانون البحري",
  "قانون التأمين",
  "قانون المعلوماتية",
  "قانون البنوك",
  "قانون الاستثمار",
  "قانون المناقصات",
  "التحكيم والوساطة",
  "قانون الطب الشرعي",
];

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddUserModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (u: User) => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    roles: ["lawyer"] as UserRole[],
    isTest: false,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSpecSuggestions, setShowSpecSuggestions] = useState(false);

  function toggleRole(role: UserRole) {
    setForm((f) => {
      const has = f.roles.includes(role);
      if (has && f.roles.length === 1) return f; // keep at least one
      return {
        ...f,
        roles: has ? f.roles.filter((r) => r !== role) : [...f.roles, role],
      };
    });
  }

  function handleSubmit() {
    if (!form.firstName || !form.email || !form.password) {
      setError("يرجى ملء الحقول المطلوبة (الاسم، البريد، كلمة المرور)");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await adminCreateUser(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.user) onAdded(res.user);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">إضافة مستخدم جديد</p>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige-light rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="text-error text-sm bg-error/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                الاسم الأول *
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
            <div>
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                اسم العائلة
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                كلمة المرور *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border border-border rounded-lg p-3 pl-10 bg-background outline-none focus:border-primary text-text-primary text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                رقم الهاتف
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
            <div className="relative">
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                التخصص
              </label>
              <input
                type="text"
                value={form.specialization}
                onChange={(e) => {
                  setForm({ ...form, specialization: e.target.value });
                  setShowSpecSuggestions(true);
                }}
                onFocus={() => setShowSpecSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowSpecSuggestions(false), 200)
                }
                autoComplete="off"
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
              {showSpecSuggestions &&
                SPECIALIZATIONS.filter(
                  (s) =>
                    !form.specialization || s.includes(form.specialization),
                ).length > 0 && (
                  <ul className="absolute z-20 w-full bg-surface border border-border rounded-lg mt-1 max-h-44 overflow-y-auto shadow-lg">
                    {SPECIALIZATIONS.filter(
                      (s) =>
                        !form.specialization || s.includes(form.specialization),
                    ).map((s) => (
                      <li
                        key={s}
                        onMouseDown={() => {
                          setForm({ ...form, specialization: s });
                          setShowSpecSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-beige-light cursor-pointer text-sm text-text-primary"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            <div>
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                سنوات الخبرة
              </label>
              <input
                type="text"
                value={form.experience}
                onChange={(e) =>
                  setForm({ ...form, experience: e.target.value })
                }
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label className="text-secondary text-sm font-medium mb-2 block">
              الأدوار *
            </label>
            <div className="flex gap-2 flex-wrap">
              {ALL_ROLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleRole(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    form.roles.includes(value)
                      ? "bg-primary text-white border-primary"
                      : "border-border text-text-secondary hover:border-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Test account */}
          <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg border border-border hover:border-warning transition">
            <input
              type="checkbox"
              checked={form.isTest}
              onChange={(e) => setForm({ ...form, isTest: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <div>
              <span className="text-sm font-medium text-text-primary">
                حساب اختبار
              </span>
              <p className="text-xs text-text-muted">
                ينتهي تلقائياً بعد 72 ساعة من الإنشاء
              </p>
            </div>
          </label>
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
            {isPending ? "جاري الإضافة..." : "إضافة المستخدم"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: User;
  onClose: () => void;
  onUpdated: (u: User) => void;
}) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? "",
    specialization: user.specialization ?? "",
    experience: user.experience ?? "",
    roles: [...user.role] as UserRole[],
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSpecSuggestions, setShowSpecSuggestions] = useState(false);

  function toggleRole(role: UserRole) {
    setForm((f) => {
      const has = f.roles.includes(role);
      if (has && f.roles.length === 1) return f;
      return {
        ...f,
        roles: has ? f.roles.filter((r) => r !== role) : [...f.roles, role],
      };
    });
  }

  function handleSubmit() {
    startTransition(async () => {
      const res = await adminUpdateUser(user.id, form);
      if (res.error) {
        setError(res.error);
        return;
      }
      onUpdated({ ...user, ...form, role: form.roles });
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">
            تعديل بيانات المستخدم
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

          {(
            [
              "firstName",
              "lastName",
              "phone",
              "specialization",
              "experience",
            ] as const
          ).map((name) => (
            <div
              key={name}
              className={name === "specialization" ? "relative" : ""}
            >
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                {name === "firstName"
                  ? "الاسم الأول"
                  : name === "lastName"
                    ? "اسم العائلة"
                    : name === "phone"
                      ? "رقم الهاتف"
                      : name === "specialization"
                        ? "التخصص"
                        : "الخبرة"}
              </label>
              {name === "specialization" ? (
                <>
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => {
                      setForm({ ...form, specialization: e.target.value });
                      setShowSpecSuggestions(true);
                    }}
                    onFocus={() => setShowSpecSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSpecSuggestions(false), 200)
                    }
                    autoComplete="off"
                    className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
                  />
                  {showSpecSuggestions &&
                    SPECIALIZATIONS.filter(
                      (s) =>
                        !form.specialization || s.includes(form.specialization),
                    ).length > 0 && (
                      <ul className="absolute z-20 w-full bg-surface border border-border rounded-lg mt-1 max-h-44 overflow-y-auto shadow-lg">
                        {SPECIALIZATIONS.filter(
                          (s) =>
                            !form.specialization ||
                            s.includes(form.specialization),
                        ).map((s) => (
                          <li
                            key={s}
                            onMouseDown={() => {
                              setForm({ ...form, specialization: s });
                              setShowSpecSuggestions(false);
                            }}
                            className="px-4 py-2 hover:bg-beige-light cursor-pointer text-sm text-text-primary"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                </>
              ) : (
                <input
                  type="text"
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
                />
              )}
            </div>
          ))}

          <div>
            <label className="text-secondary text-sm font-medium mb-2 block">
              الأدوار *
            </label>
            <div className="flex gap-2 flex-wrap">
              {ALL_ROLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleRole(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    form.roles.includes(value)
                      ? "bg-primary text-white border-primary"
                      : "border-border text-text-secondary hover:border-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
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
            {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
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
          حذف المستخدم
        </h2>
        <p className="text-text-muted text-sm mb-2">
          هل أنت متأكد من حذف{" "}
          <span className="font-semibold text-text-primary">{name}</span>؟
        </p>
        <p className="text-error text-xs mb-6">
          سيتم حذف الحساب نهائياً ولا يمكن التراجع.
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

type FilterTab = "all" | "lawyer" | "officeOwner" | "admin";

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "lawyer", label: "محامون" },
  { value: "officeOwner", label: "أصحاب مكاتب" },
  { value: "admin", label: "مديرون" },
];

export default function AdminUsersTable({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<null | "add" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) => {
        const matchesSearch =
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone ?? "").includes(q);
        const matchesFilter =
          filter === "all" || u.role.includes(filter as UserRole);
        return matchesSearch && matchesFilter;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [users, search, filter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  function confirmDelete() {
    if (!selected) return;
    startTransition(async () => {
      const res = await adminDeleteUser(selected.id);
      if (!res.error) setUsers((p) => p.filter((u) => u.id !== selected.id));
      setModal(null);
      setSelected(null);
    });
  }

  function handleBanToggle(user: User) {
    startTransition(async () => {
      const action = user.isBanned ? adminUnbanUser : adminBanUser;
      const res = await action(user.id);
      if (!res.error) {
        setUsers((p) =>
          p.map((u) =>
            u.id === user.id ? { ...u, isBanned: !u.isBanned } : u,
          ),
        );
      }
    });
  }

  function handleTestToggle(user: User) {
    startTransition(async () => {
      const res = await adminToggleTest(user.id, !user.isTest);
      if (!res.error) {
        setUsers((p) =>
          p.map((u) => (u.id === user.id ? { ...u, isTest: !u.isTest } : u)),
        );
      }
    });
  }

  return (
    <div dir="rtl" className="space-y-6">
      {modal === "add" && (
        <AddUserModal
          onClose={() => setModal(null)}
          onAdded={(u) => setUsers((p) => [u, ...p])}
        />
      )}
      {modal === "edit" && selected && (
        <EditUserModal
          user={selected}
          onClose={() => setModal(null)}
          onUpdated={(updated) =>
            setUsers((p) => p.map((u) => (u.id === updated.id ? updated : u)))
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            إدارة المستخدمين
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            {users.length} مستخدم مسجل في النظام
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          <Plus className="w-4 h-4" /> إضافة مستخدم
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-surface p-4 rounded-2xl border border-border space-y-3">
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
            placeholder="بحث بالاسم أو البريد أو الهاتف..."
            className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(({ value, label }) => {
            const count =
              value === "all"
                ? users.length
                : users.filter((u) => u.role.includes(value as UserRole))
                    .length;
            return (
              <button
                key={value}
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  filter === value
                    ? "bg-primary text-white"
                    : "bg-background border border-border text-text-secondary hover:border-primary"
                }`}
              >
                {label}
                <span className="mr-1.5 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="hidden sm:block bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-beige-light/50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                المستخدم
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                الأدوار
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                معلومات الاتصال
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-text-muted">
                الحالة
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
                  colSpan={5}
                  className="py-16 text-center text-text-muted text-sm"
                >
                  لا يوجد مستخدمون
                </td>
              </tr>
            )}
            {paginated.map((user) => {
              const name = `${user.firstName} ${user.lastName}`;
              const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;
              const isExpired =
                user.isTest &&
                Date.now() - new Date(user.createdAt).getTime() >
                  72 * 60 * 60 * 1000;

              return (
                <tr
                  key={user.id}
                  className={`hover:bg-beige-light/30 transition ${user.isBanned ? "opacity-60" : ""}`}
                >
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-b from-accent/70 via-accent/50 to-accent/30 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                        {user.profileImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.profileImageUrl}
                            alt={initials}
                            className="w-full h-full object-cover"
                          />
                        ) : initials ? (
                          initials
                        ) : (
                          <UserIcon size={16} />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary text-sm">
                          {name}
                        </div>
                        <div className="text-xs text-text-muted">
                          {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Roles */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.role.map((r) => (
                        <RoleBadge key={r} role={r} />
                      ))}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[160px]">
                        {user.email}
                      </span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {user.isBanned ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-error/10 text-error px-2 py-1 rounded-full font-medium">
                        <ShieldOff size={12} /> محظور
                      </span>
                    ) : user.isTest ? (
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                          isExpired
                            ? "bg-error/10 text-error"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        <Clock size={12} />
                        {isExpired
                          ? "منتهية"
                          : testTimeRemaining(user.createdAt)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">
                        <ShieldCheck size={12} /> نشط
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelected(user);
                          setModal("edit");
                        }}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBanToggle(user)}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition disabled:opacity-40 ${
                          user.isBanned
                            ? "hover:bg-success/10 text-success"
                            : "hover:bg-warning/10 text-warning"
                        }`}
                        title={user.isBanned ? "رفع الحظر" : "حظر"}
                      >
                        {user.isBanned ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <ShieldOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleTestToggle(user)}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition disabled:opacity-40 ${
                          user.isTest
                            ? "hover:bg-warning/10 text-warning"
                            : "hover:bg-gray-100 text-text-muted hover:text-warning"
                        }`}
                        title={
                          user.isTest
                            ? "إلغاء وضع الاختبار"
                            : "تفعيل وضع الاختبار"
                        }
                      >
                        <FlaskConical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelected(user);
                          setModal("delete");
                        }}
                        className="p-2 hover:bg-error/10 text-error rounded-lg transition"
                        title="حذف"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-xs text-text-muted">
              {filtered.length} نتيجة — صفحة {page} من {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-40 hover:bg-beige-light transition"
              >
                السابق
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-40 hover:bg-beige-light transition"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cards — visible on mobile only */}
      <div className="sm:hidden flex flex-col gap-3">
        {paginated.length === 0 && (
          <div className="bg-surface rounded-2xl border border-border py-12 text-center text-text-muted text-sm">
            لا يوجد مستخدمون
          </div>
        )}
        {paginated.map((user) => {
          const name = `${user.firstName} ${user.lastName}`;
          const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;
          const isExpired =
            user.isTest &&
            Date.now() - new Date(user.createdAt).getTime() >
              72 * 60 * 60 * 1000;
          return (
            <div
              key={user.id}
              className={`bg-surface rounded-2xl border border-border p-4 flex items-start gap-3 ${user.isBanned ? "opacity-60" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-b from-accent/70 via-accent/50 to-accent/30 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                {user.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profileImageUrl}
                    alt={initials}
                    className="w-full h-full object-cover"
                  />
                ) : initials ? (
                  initials
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text-primary text-sm">
                  {name}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.role.map((r) => (
                    <RoleBadge key={r} role={r} />
                  ))}
                </div>
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      {user.phone}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  {user.isBanned ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-error/10 text-error px-2 py-1 rounded-full font-medium">
                      <ShieldOff size={12} /> محظور
                    </span>
                  ) : user.isTest ? (
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                        isExpired
                          ? "bg-error/10 text-error"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      <Clock size={12} />
                      {isExpired ? "منتهية" : testTimeRemaining(user.createdAt)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">
                      <ShieldCheck size={12} /> نشط
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelected(user);
                    setModal("edit");
                  }}
                  className="p-2 hover:bg-primary/10 text-primary rounded-lg transition"
                  title="تعديل"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBanToggle(user)}
                  disabled={isPending}
                  className={`p-2 rounded-lg transition disabled:opacity-40 ${
                    user.isBanned
                      ? "hover:bg-success/10 text-success"
                      : "hover:bg-warning/10 text-warning"
                  }`}
                  title={user.isBanned ? "رفع الحظر" : "حظر"}
                >
                  {user.isBanned ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <ShieldOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleTestToggle(user)}
                  disabled={isPending}
                  className={`p-2 rounded-lg transition disabled:opacity-40 ${
                    user.isTest
                      ? "hover:bg-warning/10 text-warning"
                      : "hover:bg-gray-100 text-text-muted hover:text-warning"
                  }`}
                  title={
                    user.isTest ? "إلغاء وضع الاختبار" : "تفعيل وضع الاختبار"
                  }
                >
                  <FlaskConical className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelected(user);
                    setModal("delete");
                  }}
                  className="p-2 hover:bg-error/10 text-error rounded-lg transition"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-40 hover:bg-beige-light transition"
            >
              السابق
            </button>
            <span className="text-sm text-text-muted">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-40 hover:bg-beige-light transition"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
