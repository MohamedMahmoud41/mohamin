"use client";

// CLIENT COMPONENT — form state, submit handler, auto-redirect after success
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Scale, Mail } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";

export default function ForgotForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        const msg =
          error.includes("not found") || error.includes("user")
            ? "البريد الإلكتروني غير مسجل"
            : "حدث خطأ أثناء الإرسال";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      setSuccessMsg("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.");
      toast.success("تم إرسال رابط الاستعادة");

      // Auto-redirect after 5 s so user can read the success message
      setTimeout(() => router.push("/login"), 5000);
    } catch {
      const msg = "حدث خطأ أثناء الإرسال";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mb-6 flex items-center justify-center text-text-secondary">
          <Scale size={100} />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">
          مرحباً بك في محامي
        </h1>
        <p className="text-text-secondary mt-1">استرجع كلمة المرور الخاصة بك</p>
      </div>

      {/* Feedback */}
      <div className="text-center mb-4 min-h-6 text-sm">
        {errorMsg && <p className="text-error">{errorMsg}</p>}
        {successMsg && <p className="text-success">{successMsg}</p>}
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
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@law.com"
              className="w-full rounded-md py-3 pr-12 pl-4 text-text-primary placeholder:text-text-muted border border-border outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !!successMsg}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-surface rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "جاري الإرسال..." : "إرسال رابط الاسترجاع"}
        </button>

        <div className="text-center mt-4">
          <Link
            href="/login"
            className="text-text-secondary hover:text-primary transition-colors text-sm"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      </form>
    </div>
  );
}
