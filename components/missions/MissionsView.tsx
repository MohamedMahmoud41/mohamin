"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  X,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Target,
} from "lucide-react";
import {
  createMission,
  toggleMission,
  deleteMission,
} from "@/app/actions/missions";
import type { Mission, User } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  });
}

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddMissionModal({
  userId,
  onClose,
  onAdded,
}: {
  userId: string;
  onClose: () => void;
  onAdded: (m: Mission) => void;
}) {
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  function handleSubmit() {
    if (!form.title.trim()) {
      setError("عنوان المهمة مطلوب");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createMission({
        title: form.title,
        description: form.description || undefined,
        dueDate: form.dueDate || undefined,
        contextType: "user",
        contextId: userId,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.data) onAdded(res.data);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <p className="text-primary text-xl font-bold flex items-center gap-2">
            <Target className="w-5 h-5" /> مهمة جديدة
          </p>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige-light rounded-full"
          >
            <X className="w-5 h-5 text-text-secondary" />
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
              عنوان المهمة *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="أدخل عنوان المهمة"
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary"
            />
          </div>
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              الوصف (اختياري)
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="تفاصيل إضافية..."
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary h-24 resize-none"
            />
          </div>
          <div>
            <label className="text-secondary text-sm font-medium mb-1.5 block">
              تاريخ الاستحقاق (اختياري)
            </label>
            <input
              type="date"
              value={form.dueDate}
              min={today}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary"
            />
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
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition font-semibold disabled:opacity-50"
          >
            {isPending ? "جاري الإضافة..." : "إضافة المهمة"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mission Item ─────────────────────────────────────────────────────────────

function MissionItem({
  mission,
  onToggle,
  onDelete,
}: {
  mission: Mission;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition ${
        mission.isCompleted
          ? "bg-surface/60 border-border/60 opacity-70"
          : "bg-surface border-border"
      }`}
    >
      <button
        onClick={() => onToggle(mission.id, mission.isCompleted)}
        className="mt-0.5 flex-shrink-0"
      >
        {mission.isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <Circle className="w-5 h-5 text-text-muted" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium text-sm ${mission.isCompleted ? "line-through text-text-muted" : "text-text-primary"}`}
        >
          {mission.title}
        </div>
        {mission.description && (
          <div className="text-text-muted text-xs mt-1">
            {mission.description}
          </div>
        )}
        {mission.dueDate && (
          <div className="flex items-center gap-1 mt-2">
            <Clock className="w-3 h-3 text-text-muted" />
            <span className="text-text-muted text-xs">
              {formatDate(mission.dueDate)}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(mission.id)}
        className="p-1.5 text-error hover:bg-error/10 rounded-lg transition flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MissionsView({
  initialMissions,
  currentUser,
}: {
  initialMissions: Mission[];
  currentUser: User;
}) {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [showAdd, setShowAdd] = useState(false);
  const [, startTransition] = useTransition();

  function handleAdded(m: Mission) {
    setMissions((prev) => [m, ...prev]);
  }

  function handleToggle(id: string, current: boolean) {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isCompleted: !current } : m)),
    );
    startTransition(async () => {
      await toggleMission(id, !current);
    });
  }

  function handleDelete(id: string) {
    setMissions((prev) => prev.filter((m) => m.id !== id));
    startTransition(async () => {
      await deleteMission(id);
    });
  }

  const pending = missions.filter((m) => !m.isCompleted);
  const completed = missions.filter((m) => m.isCompleted);

  return (
    <div
      dir="rtl"
      className="w-full bg-background p-4 md:p-8 space-y-6 md:space-y-8"
    >
      {showAdd && (
        <AddMissionModal
          userId={currentUser.id}
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            مهامي اليومية
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {pending.length} مهمة متبقية · {completed.length} مكتملة
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          <Plus className="w-5 h-5" /> مهمة جديدة
        </button>
      </div>

      {/* Empty state */}
      {missions.length === 0 && (
        <div className="text-center py-20 border border-dashed border-border rounded-xl text-text-muted">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>لا توجد مهام بعد. ابدأ بإضافة مهمتك الأولى!</p>
        </div>
      )}

      {/* Pending missions */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-text-primary font-bold text-lg">
            المهام الجارية ({pending.length})
          </h2>
          {pending.map((m) => (
            <MissionItem
              key={m.id}
              mission={m}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Completed missions */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-text-secondary font-medium text-base">
            المكتملة ({completed.length})
          </h2>
          {completed.map((m) => (
            <MissionItem
              key={m.id}
              mission={m}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
