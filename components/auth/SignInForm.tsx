"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Scale, Mail, Lock, Eye, EyeOff, ShieldOff, Clock } from "lucide-react";
import { signIn } from "@/app/actions/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(value: string): string {
  if (!value) return "البريد الإلكتروني مطلوب";
  if (!EMAIL_REGEX.test(value)) return "صيغة البريد الإلكتروني غير صحيحة";
  return "";
}

const REASON_MESSAGES: Record<string, { icon: typeof ShieldOff; msg: string }> =
  {
    banned: {
      icon: ShieldOff,
      msg: "تم حظر هذا الحساب. تواصل مع المدير للمساعدة.",
    },
    expired: {
      icon: Clock,
      msg: "انتهت صلاحية حساب الاختبار (72 ساعة). تواصل مع المدير.",
    },
  };

export default function SignInForm({ reason }: { reason?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    const emailMsg = validateEmail(email);
    if (emailMsg) {
      setEmailError(emailMsg);
      return;
    }
    setEmailError("");
    setLoading(true);

    try {
      const { error, redirectTo } = await signIn(email, password);

      if (error) {
        setFormError(error);
        toast.error(error);
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح");
      window.location.href = redirectTo ?? "/dashboard";
    } catch {
      const msg = "حدث خطأ أثناء تسجيل الدخول";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <div className="mb-6 flex items-center justify-center text-text-secondary">
          <Scale size={100} />
        </div>
        <h1 className="text-4xl font-bold font-cairo text-text-primary">
          مرحباً بك في محامي
        </h1>
        <p className="text-text-secondary mt-1">سجل دخولك للوصول إلى حسابك</p>
      </div>

      {/* Reason banner (banned / expired) */}
      {reason &&
        REASON_MESSAGES[reason] &&
        (() => {
          const { icon: Icon, msg } = REASON_MESSAGES[reason];
          return (
            <div className="flex items-center gap-3 bg-error/10 border border-error/20 text-error rounded-xl px-4 py-3 mb-6 text-sm">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{msg}</span>
            </div>
          );
        })()}

      {/* Error feedback */}
      <div className="text-center text-error mb-4 min-h-6 text-sm">
        {formError && <p>{formError}</p>}
        {emailError && !formError && <p>{emailError}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label className="block text-sm text-text-secondary mt-5 mb-2">
            البريد الإلكتروني *
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(validateEmail(e.target.value));
              }}
              required
              placeholder="example@law.com"
              className="w-full rounded-md py-3 pr-10 pl-4 text-text-primary placeholder:text-text-muted border border-border outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-text-secondary mt-5 mb-2">
            كلمة المرور *
          </label>
          <div className="flex items-center border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
            <span className="px-3 text-text-muted flex-shrink-0">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••"
              className="flex-1 py-3 bg-transparent outline-none text-text-primary placeholder:text-text-muted min-w-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={
                showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
              }
              className="px-3 text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between text-text-secondary text-sm mt-5">
          <Link
            href="/forgot-password"
            className="hover:text-primary transition-colors"
          >
            نسيت كلمة المرور؟
          </Link>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border border-border bg-surface accent-primary"
            />
            تذكرني
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-surface rounded-lg font-medium mt-5 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
