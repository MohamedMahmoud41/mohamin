"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Building2,
  Users,
  Scale,
  Award,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Plus,
  CircleCheckBig,
  X,
  FileText,
} from "lucide-react";
import { createMission, toggleMission } from "@/app/actions/missions";
import type { Office, Case, Lawyer, Mission, User } from "@/types";

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
const SUCCESS_STATUSES = ["completed", "مكتملة", "won", "مكسوبة", "مكسوبه"];

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("ar-EG");
  } catch {
    return "";
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-6 flex flex-col gap-3`}
    >
      <div className={`p-3 rounded-lg w-fit bg-${color}/10`}>{icon}</div>
      <div className="text-3xl font-bold text-text-primary">{value}</div>
      <div className="text-text-muted text-sm">{label}</div>
    </div>
  );
}

function MissionItem({
  mission,
  onToggle,
}: {
  mission: Mission;
  onToggle: (id: string, completed: boolean) => void;
}) {
  return (
    <div
      className={`bg-surface rounded-md border ${mission.isCompleted ? "border-success/30 bg-success/5" : "border-border"} p-4 transition-all`}
    >
      <div className="flex gap-3 items-start">
        <input
          type="checkbox"
          checked={!!mission.isCompleted}
          onChange={(e) => onToggle(mission.id, e.target.checked)}
          className="w-5 h-5 accent-success cursor-pointer rounded-md mt-1"
        />
        <div className="flex-1">
          <p
            className={`text-primary font-medium text-sm ${mission.isCompleted ? "line-through text-text-muted" : ""}`}
          >
            {mission.title}
          </p>
          {mission.description && (
            <p
              className={`text-text-secondary text-xs mt-1 ${mission.isCompleted ? "line-through opacity-70" : ""}`}
            >
              {mission.description}
            </p>
          )}
          {mission.dueDate && (
            <div className="flex items-center gap-1 mt-2 text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{formatDate(mission.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddMissionModal({
  onClose,
  onCreated,
  contextType,
  contextId,
  lawyers,
  currentUserId,
  isOwner,
}: {
  onClose: () => void;
  onCreated: (mission: Mission) => void;
  contextType: "user" | "office";
  contextId: string;
  lawyers: Lawyer[];
  currentUserId: string;
  isOwner: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: currentUserId,
  });

  const handleSubmit = () => {
    if (!form.title || !form.dueDate) return;
    startTransition(async () => {
      const result = await createMission({ ...form, contextType, contextId });
      if (result.data) {
        onCreated(result.data);
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="rounded-2xl w-full max-w-lg bg-surface m-4 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold">إضافة مهمة جديدة</p>
          <button
            onClick={onClose}
            className="hover:bg-beige-light p-2 rounded-full"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              عنوان المهمة *
            </label>
            <div className="flex items-center gap-3 border border-border focus-within:border-primary rounded-lg p-3 bg-background transition-colors">
              <FileText className="text-text-muted w-5 h-5" />
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="أدخل عنوان المهمة"
                className="w-full outline-none bg-transparent text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              وصف المهمة
            </label>
            <div className="border border-border focus-within:border-primary rounded-lg p-3 bg-background">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="وصف تفصيلي..."
                className="w-full outline-none bg-transparent h-20 text-text-primary resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                تاريخ المهمة *
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary"
              />
            </div>

            {contextType === "office" && isOwner && (
              <div>
                <label className="text-secondary text-sm font-medium mb-1.5 block">
                  تعيين إلى
                </label>
                <select
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm({ ...form, assignedTo: e.target.value })
                  }
                  className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary"
                >
                  <option value={currentUserId}>أنا</option>
                  {lawyers
                    .filter((l) => l.id !== currentUserId)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.firstName} {l.lastName}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-beige-light transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title || !form.dueDate || isPending}
            className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition disabled:opacity-50"
          >
            {isPending ? "جاري الحفظ..." : "حفظ المهمة"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface OfficeDashboardProps {
  office: Office;
  cases: Case[];
  lawyers: Lawyer[];
  missions: Mission[];
  currentUser: User;
}

export default function OfficeDashboard({
  office,
  cases,
  lawyers,
  missions,
  currentUser,
}: OfficeDashboardProps) {
  const [showAddMission, setShowAddMission] = useState(false);
  const [localMissions, setLocalMissions] = useState<Mission[]>(missions);
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUser.role.includes("officeOwner");

  // Stats
  const activeCasesCount = cases.filter((c) =>
    ACTIVE_STATUSES.includes((c.caseStatus ?? "").toLowerCase()),
  ).length;
  const successCount = cases.filter((c) =>
    SUCCESS_STATUSES.includes((c.caseStatus ?? "").toLowerCase()),
  ).length;
  const successRate =
    cases.length > 0
      ? `${Math.round((successCount / cases.length) * 100)}%`
      : "0%";

  // Lawyers (exclude owner)
  const teamLawyers = lawyers.filter((l) =>
    !l.id.includes(currentUser.id) || isOwner
      ? !l.id.includes(office.ownerId)
      : false,
  );
  const memberLawyers = lawyers.filter((l) => l.id !== office.ownerId);

  // Specializations
  const specMap = memberLawyers.reduce<Record<string, number>>((acc, l) => {
    const s = l.specialization || "عام";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const specializations = Object.entries(specMap).map(([label, count]) => ({
    label,
    count,
  }));

  // Upcoming sessions
  const now = new Date();
  const upcomingSessions = cases
    .filter((c) => c.nextSessionDate && new Date(c.nextSessionDate) > now)
    .sort(
      (a, b) =>
        new Date(a.nextSessionDate!).getTime() -
        new Date(b.nextSessionDate!).getTime(),
    )
    .slice(0, 5);

  // Recent cases
  const recentCases = [...cases]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      icon: <Users className="w-7 h-7 text-primary" />,
      value: memberLawyers.length.toString(),
      label: "عدد المحامين",
      color: "primary",
    },
    {
      icon: <Scale className="w-7 h-7 text-info" />,
      value: activeCasesCount.toString(),
      label: "القضايا الجارية",
      color: "info",
    },
    {
      icon: <Award className="w-7 h-7 text-success" />,
      value: successRate,
      label: "معدل النجاح",
      color: "success",
    },
    {
      icon: <Building2 className="w-7 h-7 text-secondary" />,
      value: cases.length.toString(),
      label: "إجمالي القضايا",
      color: "secondary",
    },
  ];

  function handleToggleMission(id: string, completed: boolean) {
    setLocalMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isCompleted: completed } : m)),
    );
    startTransition(async () => {
      await toggleMission(id, completed);
    });
  }

  const activeMissions = localMissions.filter((m) => !m.isCompleted);
  const completedMissions = localMissions.filter((m) => m.isCompleted);

  return (
    <div dir="rtl" className="w-full bg-background p-8 space-y-8">
      {showAddMission && (
        <AddMissionModal
          onClose={() => setShowAddMission(false)}
          onCreated={(m) => setLocalMissions((prev) => [m, ...prev])}
          contextType="office"
          contextId={office.id}
          lawyers={memberLawyers}
          currentUserId={currentUser.id}
          isOwner={isOwner}
        />
      )}

      {/* Office Header */}
      <div className="bg-gradient-to-b from-accent/70 via-accent/50 to-accent/30 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{office.name}</h1>
            <p className="text-white/80 text-sm max-w-xl">
              {office.description || "مكتب محاماة متخصص"}
            </p>
          </div>
          {isOwner && (
            <Link
              href="/office/edit"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition"
            >
              تعديل معلومات المكتب
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-6 mt-6 text-sm text-white/80">
          {office.address && (
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {office.address}
            </span>
          )}
          {office.phone && (
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {office.phone}
            </span>
          )}
          {office.email && (
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {office.email}
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Main 2+1 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">
              القضايا الأخيرة
            </h2>
            <Link
              href="/cases"
              className="text-primary text-sm hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          {recentCases.length === 0 && (
            <div className="text-center text-text-muted py-10 border border-dashed border-border rounded-xl">
              لا توجد قضايا حتى الآن
            </div>
          )}
          {recentCases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="block bg-surface border border-border rounded-xl p-5 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-semibold">
                  {c.caseTitle}
                </span>
                <span className="text-xs text-text-muted">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <div className="text-text-muted text-sm mt-1">
                {c.clientName} · {c.caseType || "غير محدد"}
              </div>
            </Link>
          ))}

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" /> الجلسات القادمة
              </h3>
              <div className="space-y-3">
                {upcomingSessions.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-surface border border-border rounded-lg p-4"
                  >
                    <div>
                      <div className="text-text-primary font-medium text-sm">
                        {c.caseTitle}
                      </div>
                      <div className="text-text-muted text-xs mt-1">
                        {c.clientName}
                      </div>
                    </div>
                    <div className="text-secondary text-sm font-semibold">
                      {formatDate(c.nextSessionDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Missions Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleCheckBig className="text-primary w-5 h-5" />
              <h2 className="text-xl font-bold text-text-primary">
                مهام المكتب
              </h2>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddMission(true)}
                className="flex items-center gap-1 text-sm text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                مهمة جديدة
              </button>
            )}
          </div>

          <div className="space-y-3">
            {activeMissions.length === 0 && completedMissions.length === 0 && (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <p className="text-text-muted text-sm">لا توجد مهام حالياً</p>
              </div>
            )}
            {activeMissions.map((m) => (
              <MissionItem
                key={m.id}
                mission={m}
                onToggle={handleToggleMission}
              />
            ))}
            {completedMissions.length > 0 && activeMissions.length > 0 && (
              <div className="border-t border-dashed border-border my-2" />
            )}
            {completedMissions.map((m) => (
              <MissionItem
                key={m.id}
                mission={m}
                onToggle={handleToggleMission}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">فريق المكتب</h2>
          {isOwner && (
            <Link
              href="/lawyers"
              className="text-primary text-sm hover:underline"
            >
              إدارة الفريق
            </Link>
          )}
        </div>
        {memberLawyers.length === 0 ? (
          <div className="text-center text-text-muted py-10 border border-dashed border-border rounded-xl">
            لا يوجد أعضاء في الفريق حتى الآن
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberLawyers.map((l) => {
              const lawyerCasesCount = cases.filter(
                (c) => c.lawyerID === l.id,
              ).length;
              const activeCount = cases.filter(
                (c) =>
                  c.lawyerID === l.id &&
                  ACTIVE_STATUSES.includes((c.caseStatus ?? "").toLowerCase()),
              ).length;
              return (
                <div
                  key={l.id}
                  className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-4">
                    {l.profileImageUrl ? (
                      <img
                        src={l.profileImageUrl}
                        alt={l.firstName}
                        className="w-14 h-14 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-b from-accent/70 via-accent/50 to-accent/30 flex items-center justify-center text-white text-xl font-bold">
                        {l.firstName?.[0] || "م"}
                      </div>
                    )}
                    <div>
                      <div className="text-text-primary font-bold">
                        {l.firstName} {l.lastName}
                      </div>
                      <div className="text-text-muted text-sm">
                        {l.specialization || "محامي"}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-background rounded-lg p-3">
                      <div className="text-text-primary font-bold text-xl">
                        {lawyerCasesCount}
                      </div>
                      <div className="text-text-muted text-xs">
                        إجمالي القضايا
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <div className="text-info font-bold text-xl">
                        {activeCount}
                      </div>
                      <div className="text-text-muted text-xs">قضايا نشطة</div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-text-muted">
                    {l.email && (
                      <a
                        href={`mailto:${l.email}`}
                        className="flex items-center gap-1 hover:text-primary truncate"
                      >
                        <Mail className="w-3 h-3" />
                        {l.email}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Specializations */}
      {specializations.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">التخصصات</h2>
          <div className="flex flex-wrap gap-3">
            {specializations.map(({ label, count }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-sm"
              >
                <span className="text-text-primary font-medium">{label}</span>
                <span className="text-xs text-white bg-primary rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
