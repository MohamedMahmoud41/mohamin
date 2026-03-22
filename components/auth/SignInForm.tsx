"use client";

// CLIENT COMPONENT — form state, show/hide password, submit handler
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Scale, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/services/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(value: string): string {
  if (!value) return "البريد الإلكتروني مطلوب";
  if (!EMAIL_REGEX.test(value)) return "صيغة البريد الإلكتروني غير صحيحة";
  return "";
}

export default function SignInForm() {
  const router = useRouter();
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
      const { error } = await signIn(email, password);

      if (error) {
        const msg = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        setFormError(msg);
        toast.error(msg);
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح");
      // The dashboard layout will handle role-based rendering;
      // redirect to dashboard by default (admin can navigate from there).
      router.push("/dashboard");
      router.refresh();
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

      {/* Tab switcher */}
      <div className="flex bg-surface-hover p-1 rounded-lg mb-4 border border-border">
        <Link
          href="/signup"
          className="flex-1 py-2 text-center text-text-secondary bg-transparent rounded-md hover:bg-surface transition-colors"
        >
          حساب جديد
        </Link>
        <Link
          href="/login"
          className="flex-1 py-2 text-center text-text-primary bg-surface rounded-md shadow-sm"
        >
          تسجيل الدخول
        </Link>
      </div>

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
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-text-secondary mt-5 mb-2">
            كلمة المرور *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••"
              className="w-full rounded-md py-3 px-4 pr-10 text-text-primary placeholder:text-text-muted border border-border outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={
                showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted cursor-pointer"
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
