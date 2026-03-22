"use client";

// CLIENT COMPONENT — multi-field form, role selection, validation, submit
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Scale, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { signUp } from "@/services/auth";

// ── Validators ────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const PHONE_RE = /^01[0-9]{9}$/;

function validateEmail(v: string) {
  if (!v) return "البريد الإلكتروني مطلوب";
  if (!EMAIL_RE.test(v)) return "صيغة البريد الإلكتروني غير صحيحة";
  return "";
}
function validatePassword(v: string) {
  if (!v) return "كلمة المرور مطلوبة";
  if (!PASSWORD_RE.test(v))
    return "كلمة المرور يجب أن تكون 8 أحرف، تحتوي على حرف كبير ورقم ورمز خاص";
  return "";
}
function validatePhone(v: string) {
  if (!v) return "رقم الهاتف مطلوب";
  if (!PHONE_RE.test(v)) return "رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01";
  return "";
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: "lawyer" | "officeOwner";
}

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "lawyer",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    phone: "",
    form: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email")
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    if (name === "password")
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    if (name === "phone")
      setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const emailMsg = validateEmail(formData.email);
    const passwordMsg = validatePassword(formData.password);
    const phoneMsg = validatePhone(formData.phone);

    if (emailMsg || passwordMsg || phoneMsg) {
      setErrors((prev) => ({
        ...prev,
        email: emailMsg,
        password: passwordMsg,
        phone: phoneMsg,
      }));
      return;
    }

    setErrors({ email: "", password: "", phone: "", form: "" });
    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
      });

      if (error) {
        const msg =
          error.includes("already") || error.includes("registered")
            ? "البريد الإلكتروني مستخدم بالفعل"
            : "حدث خطأ أثناء إنشاء الحساب";
        setErrors((prev) => ({ ...prev, form: msg }));
        toast.error(msg);
        return;
      }

      toast.success("تم إنشاء الحساب بنجاح");
      // Redirect based on role
      router.push(
        formData.role === "officeOwner" ? "/office-setup" : "/settings",
      );
      router.refresh();
    } catch {
      const msg = "حدث خطأ أثناء إنشاء الحساب";
      setErrors((prev) => ({ ...prev, form: msg }));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const anyError = Object.values(errors).find(Boolean);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mb-6 flex items-center justify-center text-primary-light">
          <Scale size={100} />
        </div>
        <h1 className="text-4xl font-bold text-text-primary">
          مرحباً بك في محامي
        </h1>
        <p className="text-text-secondary mt-1">أنشئ حسابك الجديد للبدء</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-surface-hover p-1 rounded-lg mb-4 border border-border">
        <Link
          href="/signup"
          className="flex-1 py-2 text-center text-text-primary bg-surface rounded-md shadow-sm"
        >
          حساب جديد
        </Link>
        <Link
          href="/login"
          className="flex-1 py-2 text-center text-text-secondary bg-transparent rounded-md hover:bg-surface transition-colors"
        >
          تسجيل الدخول
        </Link>
      </div>

      {/* Error feedback */}
      {anyError && (
        <div className="text-center text-error mb-4 text-sm">
          <p>{anyError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name row */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm text-text-secondary mb-1">
              الاسم الأول *
            </label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="الاسم الأول"
              className="w-full rounded-md py-3 px-4 text-text-primary border border-border outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-text-secondary mb-1">
              اسم العائلة *
            </label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="العائلة"
              className="w-full rounded-md py-3 px-4 text-text-primary border border-border outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-text-secondary mt-2 mb-2">
            البريد الإلكتروني *
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@law.com"
              className="w-full rounded-md py-3 pr-12 pl-4 text-text-primary border border-border outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            كلمة المرور *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••"
              className="w-full rounded-md py-3 px-4 pr-10 text-text-primary border border-border outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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

        {/* Phone */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            رقم الهاتف *
          </label>
          <div className="relative">
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="01XXXXXXXXX"
              className="w-full rounded-md py-3 px-4 pr-10 text-text-primary border border-border outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          </div>
        </div>

        {/* Role picker */}
        <div className="flex gap-3">
          {(["officeOwner", "lawyer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: r }))}
              className={`flex-1 py-2 border rounded-md font-medium transition-colors ${
                formData.role === r
                  ? "bg-primary text-white border-primary"
                  : "border-border text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {r === "officeOwner" ? "صاحب مكتب" : "محامي"}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-surface rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
        </button>
      </form>
    </div>
  );
}
