"use client";

import { useState, useTransition } from "react";
import { Lock, LogOut } from "lucide-react";
import { changePassword } from "@/app/actions/users";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function SecurityForm() {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  }

  function handleSubmit() {
    if (!form.newPassword || form.newPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتان");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await changePassword(form.newPassword);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setForm({ newPassword: "", confirmPassword: "" });
    });
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div dir="rtl" className="max-w-2xl space-y-6">
      {/* Change password */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-b from-accent/70 via-accent/50 to-accent/30 rounded-xl flex items-center justify-center text-white">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-text-primary font-bold">تغيير كلمة المرور</div>
            <div className="text-text-muted text-xs">
              أدخل كلمة مرور جديدة قوية
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
            تم تغيير كلمة المرور بنجاح
          </p>
        )}

        <div>
          <label className="text-secondary text-sm font-medium mb-1.5 block">
            كلمة المرور الجديدة
          </label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
          />
        </div>
        <div>
          <label className="text-secondary text-sm font-medium mb-1.5 block">
            تأكيد كلمة المرور
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold disabled:opacity-50"
        >
          {isPending ? "جاري التحديث..." : "تحديث كلمة المرور"}
        </button>
      </div>

      {/* Logout */}
      <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
        <div>
          <div className="text-text-primary font-bold">تسجيل الخروج</div>
          <div className="text-text-muted text-xs mt-0.5">
            الخروج من حسابك على هذا الجهاز
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-5 py-2.5 border border-error text-error rounded-lg hover:bg-error/5 transition font-medium disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </div>
  );
}
