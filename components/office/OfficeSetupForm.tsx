"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Loader2,
  Plus,
  X,
  Users,
} from "lucide-react";
import { setupOffice, inviteLawyerToOffice } from "@/app/actions/office";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvitedLawyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PHONE_RE = /^01[0-9]{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-text-muted bg-background text-text-primary";

// ─── Component ────────────────────────────────────────────────────────────────

export default function OfficeSetupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    description: "",
  });

  const [lawyers, setLawyers] = useState<InvitedLawyer[]>([]);
  const [lawyerEmail, setLawyerEmail] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddLawyer() {
    if (!lawyerEmail) return;
    if (!EMAIL_RE.test(lawyerEmail)) {
      setLookupError("صيغة البريد الإلكتروني غير صحيحة");
      return;
    }
    if (lawyers.some((l) => l.email === lawyerEmail)) {
      setLookupError("هذا المحامي مضاف بالفعل");
      return;
    }

    setLookingUp(true);
    setLookupError(null);
    const result = await inviteLawyerToOffice("", lawyerEmail);
    setLookingUp(false);

    if (result.error || !result.data) {
      setLookupError(result.error ?? "لم يتم العثور على المحامي");
      return;
    }

    setLawyers((prev) => [...prev, result.data!]);
    setLawyerEmail("");
  }

  function handleRemoveLawyer(id: string) {
    setLawyers((prev) => prev.filter((l) => l.id !== id));
  }

  function validate(): string | null {
    if (!formData.name.trim()) return "اسم المكتب مطلوب";
    if (!formData.address.trim()) return "عنوان المكتب مطلوب";
    if (formData.email && !EMAIL_RE.test(formData.email))
      return "صيغة البريد الإلكتروني للمكتب غير صحيحة";
    if (formData.phone && !PHONE_RE.test(formData.phone))
      return "رقم الهاتف غير صحيح (يجب أن يكون 11 رقم ويبدأ بـ 01)";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await setupOffice({
        name: formData.name,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        lawyerIds: lawyers.map((l) => l.id),
      });

      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/office");
    });
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">إعداد المكتب</h1>
          <p className="text-text-muted mt-2">أدخل معلومات مكتبك لبدء العمل</p>
        </div>

        {error && (
          <div className="p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Office Info Card */}
          <div className="bg-surface rounded-2xl border border-border p-8 space-y-6">
            <div className="flex items-center gap-3 text-text-secondary">
              <Building2 className="w-6 h-6" />
              <h2 className="text-xl font-bold">معلومات المكتب</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">
                  اسم المكتب *
                </label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسم المكتب"
                    required
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">
                  عنوان المكتب *
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="أدخل عنوان المكتب"
                    required
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="office@example.com"
                      type="email"
                      className={`${inputClass} pr-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      className={`${inputClass} pr-10`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">
                  وصف المكتب
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="أدخل وصفاً للمكتب"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Add Lawyers Card */}
          <div className="bg-surface rounded-2xl border border-border p-8 space-y-6">
            <div className="flex items-center gap-3 text-text-secondary">
              <Users className="w-6 h-6" />
              <h2 className="text-xl font-bold">إضافة محامين</h2>
            </div>

            <div className="flex gap-3">
              <input
                type="email"
                value={lawyerEmail}
                onChange={(e) => setLawyerEmail(e.target.value)}
                placeholder="أدخل البريد الإلكتروني للمحامي"
                className={`${inputClass} flex-1`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLawyer();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddLawyer}
                disabled={lookingUp}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold disabled:opacity-50"
              >
                {lookingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                إضافة
              </button>
            </div>

            {lookupError && <p className="text-error text-sm">{lookupError}</p>}

            {lawyers.length > 0 && (
              <div className="space-y-2">
                {lawyers.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between bg-background border border-border rounded-lg p-4"
                  >
                    <div>
                      <div className="text-text-primary font-medium">
                        {l.firstName} {l.lastName}
                      </div>
                      <div className="text-text-muted text-sm">{l.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLawyer(l.id)}
                      className="p-2 text-error hover:bg-error/10 rounded-full transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {lawyers.length === 0 && (
              <p className="text-text-muted text-sm text-center py-4 border border-dashed border-border rounded-lg">
                لم يتم إضافة محامين بعد (اختياري)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary text-white py-4 text-base font-bold hover:bg-primary-dark transition disabled:opacity-70 flex items-center justify-center gap-2 shadow-md"
          >
            {isPending && <Loader2 className="animate-spin w-5 h-5" />}
            {isPending ? "جاري الحفظ..." : "حفظ ومتابعة"}
            {!isPending && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
