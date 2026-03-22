"use client";

import { useState, useTransition } from "react";
import { Bell, Save } from "lucide-react";
import { saveNotificationSettings } from "@/app/actions/users";
import type { NotificationSettings } from "@/types";

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex-1 ml-4">
        <div className="text-text-primary font-medium text-sm">{label}</div>
        <div className="text-text-muted text-xs mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-border"}`}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationsForm({
  initial,
}: {
  initial: NotificationSettings;
}) {
  const [settings, setSettings] = useState<NotificationSettings>(initial);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: keyof NotificationSettings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess(false);
  }

  function handleSave() {
    startTransition(async () => {
      const res = await saveNotificationSettings(settings);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSuccess(true);
    });
  }

  const rows: {
    key: keyof NotificationSettings;
    label: string;
    description: string;
  }[] = [
    {
      key: "newCases",
      label: "قضايا جديدة",
      description: "الإشعار عند إضافة قضايا جديدة للمكتب",
    },
    {
      key: "sessionReminder",
      label: "تذكير بالجلسات",
      description: "الإشعار قبل موعد الجلسات المقررة",
    },
    {
      key: "caseUpdates",
      label: "تحديثات القضايا",
      description: "الإشعار عند تحديث حالة أي قضية",
    },
    {
      key: "emailNotifications",
      label: "إشعارات البريد الإلكتروني",
      description: "إرسال الإشعارات عبر البريد الإلكتروني أيضاً",
    },
  ];

  return (
    <div dir="rtl" className="max-w-2xl">
      <div className="bg-surface border border-border rounded-xl p-6 space-y-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-b from-primary to-accent rounded-xl flex items-center justify-center text-white">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-text-primary font-bold">إعدادات الإشعارات</div>
            <div className="text-text-muted text-xs">
              اختر أنواع الإشعارات التي تريد استقبالها
            </div>
          </div>
        </div>

        {error && (
          <p className="text-error text-sm bg-error/10 p-3 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-success text-sm bg-success/10 p-3 rounded-lg">
            تم حفظ الإعدادات بنجاح
          </p>
        )}

        {rows.map((r) => (
          <ToggleRow
            key={r.key}
            label={r.label}
            description={r.description}
            checked={settings[r.key]}
            onChange={() => toggle(r.key)}
          />
        ))}

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </div>
    </div>
  );
}
