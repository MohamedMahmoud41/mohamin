"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  User,
  Phone,
  Mail,
  MapPin,
  Landmark,
  Building2,
  FileText,
  X,
} from "lucide-react";
import { createCase } from "@/app/actions/cases";
import type { Court, Lawyer, User as UserType } from "@/types";

// ─── helpers ──────────────────────────────────────────────────────────────────

const PHONE_RE = /^01[0-9]{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1
  caseTitle: string;
  caseType: string;
  caseStatus: string;
  caseDescription: string;
  startDate: string;
  nextSessionDate: string;
  // Step 2 – client
  clientName: string;
  clientType: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  // Step 3 – opponent
  opponentName: string;
  opponentType: string;
  opponentPhone: string;
  opponentEmail: string;
  opponentAddress: string;
  // Step 4 – court & lawyer
  courtName: string;
  courtHall: string;
  lawyerID: string;
  lawyerName: string;
}

const initialForm: FormData = {
  caseTitle: "",
  caseType: "",
  caseStatus: "",
  caseDescription: "",
  startDate: "",
  nextSessionDate: "",
  clientName: "",
  clientType: "فرد",
  clientPhone: "",
  clientEmail: "",
  clientAddress: "",
  opponentName: "",
  opponentType: "فرد",
  opponentPhone: "",
  opponentEmail: "",
  opponentAddress: "",
  courtName: "",
  courtHall: "",
  lawyerID: "",
  lawyerName: "",
};

interface AddCaseFormProps {
  courts: Court[];
  lawyers: Lawyer[];
  currentUser: UserType;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddCaseForm({
  courts,
  lawyers,
  currentUser,
}: AddCaseFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [error, setError] = useState("");
  const [showCourtSuggestions, setShowCourtSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();

  const set = (key: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const goNext = () => {
    setError("");
    if (step === 1) {
      if (
        !formData.caseTitle ||
        !formData.caseType ||
        !formData.caseStatus ||
        !formData.caseDescription ||
        !formData.startDate
      ) {
        setError("يرجى ملء جميع الحقول الإلزامية");
        return;
      }
      if (
        formData.nextSessionDate &&
        new Date(formData.nextSessionDate) <= new Date()
      ) {
        setError("تاريخ الجلسة القادمة يجب أن يكون في المستقبل");
        return;
      }
    }
    if (step === 2) {
      if (
        !formData.clientName ||
        !formData.clientType ||
        !formData.clientPhone
      ) {
        setError("يرجى ملء جميع الحقول الإلزامية للعميل");
        return;
      }
      if (!PHONE_RE.test(formData.clientPhone)) {
        setError("رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01");
        return;
      }
      if (formData.clientEmail && !EMAIL_RE.test(formData.clientEmail)) {
        setError("صيغة البريد الإلكتروني للعميل غير صحيحة");
        return;
      }
    }
    if (step === 3) {
      if (!formData.opponentName || !formData.opponentType) {
        setError("يرجى ملء جميع الحقول الإلزامية للخصم");
        return;
      }
      if (formData.opponentPhone && !PHONE_RE.test(formData.opponentPhone)) {
        setError("رقم هاتف الخصم غير صحيح");
        return;
      }
      if (formData.opponentEmail && !EMAIL_RE.test(formData.opponentEmail)) {
        setError("صيغة البريد الإلكتروني للخصم غير صحيحة");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!formData.courtName || !formData.courtHall) {
      setError("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    const isOwner = currentUser.role?.includes("officeOwner");
    const lawyerId = isOwner
      ? formData.lawyerID || currentUser.id
      : currentUser.id;
    const lawyerName = isOwner
      ? formData.lawyerName ||
        `${currentUser.firstName} ${currentUser.lastName}`
      : `${currentUser.firstName} ${currentUser.lastName}`;

    startTransition(async () => {
      setError("");
      const payload = {
        ...formData,
        lawyerID: lawyerId,
        lawyerName,
        officeId: currentUser.officeId || "",
        nextSessionDate: formData.nextSessionDate || null,
        // snake_case aliases for Supabase columns
        case_title: formData.caseTitle,
        case_type: formData.caseType,
        case_status: formData.caseStatus,
        case_description: formData.caseDescription,
        start_date: formData.startDate,
        next_session_date: formData.nextSessionDate || null,
        office_id: currentUser.officeId || "",
        lawyer_id: lawyerId,
        court_name: formData.courtName,
        court_hall: formData.courtHall,
        client_name: formData.clientName,
        client_phone: formData.clientPhone,
        client_email: formData.clientEmail,
        opponent_name: formData.opponentName,
        opponent_phone: formData.opponentPhone,
      } as Parameters<typeof createCase>[0];

      const { error: serverError } = await createCase(payload);

      if (serverError) {
        setError(serverError);
        return;
      }

      router.push("/cases");
      router.refresh();
    });
  };

  // ─── Step indicator ─────────────────────────────────────────────────────────
  const stepColor = (s: number) =>
    s <= step ? "bg-primary text-white" : "bg-beige text-primary";

  return (
    <div className="w-full flex flex-col gap-6 p-8 bg-background min-h-screen">
      {/* Page header */}
      <div className="text-right">
        <h1 className="text-3xl font-bold text-text-primary">
          إضافة قضية جديدة
        </h1>
        <p className="text-text-muted mt-2">أدخل معلومات القضية والعميل</p>
      </div>

      {/* Steps indicator */}
      <div className="flex flex-row-reverse items-center justify-center gap-4 my-6">
        {[4, 3, 2, 1].map((s, idx, arr) => (
          <>
            <div
              key={s}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold shrink-0 ${stepColor(s)}`}
            >
              {s}
            </div>
            {idx < arr.length - 1 && (
              <div
                className={`w-12 h-1 rounded-full ${step > arr[idx + 1] ? "bg-primary" : "bg-beige"}`}
              />
            )}
          </>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg text-right">
          {error}
        </div>
      )}

      {/* ─── Step 1: Case Info ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-surface p-8 rounded-lg shadow-sm border border-border flex flex-col gap-8">
          <div className="text-right">
            <h2 className="text-text-primary text-2xl font-bold">
              معلومات القضية
            </h2>
            <p className="text-text-muted text-sm mt-1">
              أدخل المعلومات الأساسية للقضية
            </p>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2 text-right">
            <label className="text-text-primary font-semibold">
              عنوان القضية <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                value={formData.caseTitle}
                onChange={(e) => set("caseTitle", e.target.value)}
                className="p-4 w-full bg-background rounded-lg border-2 border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10 placeholder:text-text-muted"
                placeholder="مثال: قضية تجارية - نزاع عقد توريد"
              />
              <Scale className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            </div>
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-6 text-right">
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                نوع القضية *
              </label>
              <select
                value={formData.caseType}
                onChange={(e) => set("caseType", e.target.value)}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">اختر نوع القضية</option>
                {["مدني", "إداري", "تجاري", "عمالي", "أسرة", "جنائي"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                حالة القضية *
              </label>
              <select
                value={formData.caseStatus}
                onChange={(e) => set("caseStatus", e.target.value)}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">اختر حالة القضية</option>
                {["جارية", "قيد الانتظار", "مكسوبة", "مغلقة"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2 text-right">
            <label className="text-text-primary font-semibold">
              وصف القضية <span className="text-error">*</span>
            </label>
            <textarea
              value={formData.caseDescription}
              onChange={(e) => set("caseDescription", e.target.value)}
              className="p-4 bg-background border-2 border-border rounded-lg text-text-primary min-h-[130px] focus:outline-none focus:border-primary placeholder:text-text-muted"
              placeholder="اكتب وصفاً تفصيلياً للقضية..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6 text-right">
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                تاريخ بدء القضية *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                تاريخ الجلسة القادمة
              </label>
              <input
                type="datetime-local"
                value={formData.nextSessionDate}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => set("nextSessionDate", e.target.value)}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => router.push("/cases")}
              className="px-8 py-3 rounded-lg border-2 border-border text-text-primary font-semibold hover:bg-beige transition"
            >
              إلغاء
            </button>
            <button
              onClick={goNext}
              className="px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Client Info ───────────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-surface p-8 rounded-lg shadow-sm border border-border flex flex-col gap-8">
          <div className="text-right">
            <h2 className="text-text-primary text-2xl font-bold">
              معلومات العميل
            </h2>
            <p className="text-text-muted text-sm mt-1">
              أدخل معلومات العميل أو الجهة المدعية
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputField
              label="اسم العميل / الجهة *"
              icon={<User className="w-5 h-5 text-primary" />}
              value={formData.clientName}
              onChange={(v) => set("clientName", v)}
              placeholder="مثال: شركة النور للتجارة"
            />
            <div className="flex flex-col gap-2 text-right">
              <label className="text-text-primary font-semibold">
                نوع العميل *
              </label>
              <select
                value={formData.clientType}
                onChange={(e) => set("clientType", e.target.value)}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="فرد">فرد</option>
                <option value="شركة">شركة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputField
              label="البريد الإلكتروني"
              icon={<Mail className="w-5 h-5 text-primary" />}
              value={formData.clientEmail}
              onChange={(v) => set("clientEmail", v)}
              placeholder="client@example.com"
            />
            <InputField
              label="رقم الهاتف *"
              icon={<Phone className="w-5 h-5 text-primary" />}
              value={formData.clientPhone}
              onChange={(v) => set("clientPhone", v)}
              placeholder="01XXXXXXXXX"
            />
          </div>

          <InputField
            label="العنوان"
            icon={<MapPin className="w-5 h-5 text-primary" />}
            value={formData.clientAddress}
            onChange={(v) => set("clientAddress", v)}
            placeholder="المدينة، الحي، الشارع"
          />

          <NavButtons
            onBack={goBack}
            onNext={goNext}
            onCancel={() => router.push("/cases")}
          />
        </div>
      )}

      {/* ─── Step 3: Opponent Info ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-surface p-8 rounded-lg shadow-sm border border-border flex flex-col gap-8">
          <div className="text-right">
            <h2 className="text-text-primary text-2xl font-bold">
              معلومات الخصم
            </h2>
            <p className="text-text-muted text-sm mt-1">
              أدخل معلومات الخصم أو الجهة المدعية
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputField
              label="اسم الخصم / الجهة *"
              icon={<User className="w-5 h-5 text-primary" />}
              value={formData.opponentName}
              onChange={(v) => set("opponentName", v)}
              placeholder="مثال: شركة النور للتجارة"
            />
            <div className="flex flex-col gap-2 text-right">
              <label className="text-text-primary font-semibold">
                نوع الخصم *
              </label>
              <select
                value={formData.opponentType}
                onChange={(e) => set("opponentType", e.target.value)}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="فرد">فرد</option>
                <option value="شركة">شركة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputField
              label="البريد الإلكتروني"
              icon={<Mail className="w-5 h-5 text-primary" />}
              value={formData.opponentEmail}
              onChange={(v) => set("opponentEmail", v)}
              placeholder="opponent@example.com"
            />
            <InputField
              label="رقم الهاتف"
              icon={<Phone className="w-5 h-5 text-primary" />}
              value={formData.opponentPhone}
              onChange={(v) => set("opponentPhone", v)}
              placeholder="01XXXXXXXXX"
            />
          </div>

          <InputField
            label="العنوان"
            icon={<MapPin className="w-5 h-5 text-primary" />}
            value={formData.opponentAddress}
            onChange={(v) => set("opponentAddress", v)}
            placeholder="المدينة، الحي، الشارع"
          />

          <NavButtons
            onBack={goBack}
            onNext={goNext}
            onCancel={() => router.push("/cases")}
          />
        </div>
      )}

      {/* ─── Step 4: Court & Lawyer ────────────────────────────────────────── */}
      {step === 4 && (
        <div className="bg-surface p-8 rounded-lg shadow-sm border border-border flex flex-col gap-8">
          <div className="text-right">
            <h2 className="text-text-primary text-2xl font-bold">
              معلومات المحكمة والتوزيع
            </h2>
            <p className="text-text-muted text-sm mt-1">
              أدخل معلومات المحكمة واختر المحامي المسؤول
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-right">
            {/* Court name with autocomplete */}
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                اسم المحكمة <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  value={formData.courtName}
                  onChange={(e) => {
                    set("courtName", e.target.value);
                    setShowCourtSuggestions(true);
                  }}
                  onFocus={() => setShowCourtSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowCourtSuggestions(false), 200)
                  }
                  autoComplete="off"
                  className="p-4 w-full bg-background border-2 border-border rounded-lg text-text-primary pr-10 focus:outline-none focus:border-primary placeholder:text-text-muted"
                  placeholder="مثال: المحكمة التجارية"
                />
                <Landmark className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                {showCourtSuggestions && (
                  <ul className="absolute z-20 w-full bg-surface border border-border mt-1 rounded-lg max-h-48 overflow-auto shadow-lg top-full">
                    {courts
                      .filter((c) =>
                        c.name
                          .toLowerCase()
                          .includes(formData.courtName.toLowerCase()),
                      )
                      .map((c) => (
                        <li
                          key={c.id}
                          className="p-3 hover:bg-beige cursor-pointer text-text-primary border-b border-border/50 last:border-0"
                          onClick={() => {
                            set("courtName", c.name);
                            setShowCourtSuggestions(false);
                          }}
                        >
                          {c.name}
                        </li>
                      ))}
                    {courts.filter((c) =>
                      c.name
                        .toLowerCase()
                        .includes(formData.courtName.toLowerCase()),
                    ).length === 0 && (
                      <li className="p-3 text-text-muted text-sm">
                        لا توجد نتائج (سيتم حفظ الاسم الجديد)
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* Court hall */}
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                رقم القاعة
              </label>
              <div className="relative">
                <input
                  value={formData.courtHall}
                  onChange={(e) => set("courtHall", e.target.value)}
                  className="p-4 w-full bg-background border-2 border-border rounded-lg text-text-primary pr-10 focus:outline-none focus:border-primary placeholder:text-text-muted"
                  placeholder="مثال: القاعة 5"
                />
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          {/* Lawyer selector (owners only) */}
          {currentUser.role?.includes("officeOwner") && (
            <div className="flex flex-col gap-2 text-right">
              <label className="text-text-primary font-semibold">
                اختيار المحامي المسؤول <span className="text-error">*</span>
              </label>
              <select
                value={formData.lawyerID}
                onChange={(e) => {
                  const id = e.target.value;
                  const found = lawyers.find((l) => l.id === id);
                  set("lawyerID", id);
                  set(
                    "lawyerName",
                    id === currentUser.id
                      ? `${currentUser.firstName} ${currentUser.lastName}`
                      : found
                        ? `${found.firstName} ${found.lastName}`
                        : "",
                  );
                }}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">اختر المحامي</option>
                <option value={currentUser.id}>إضافة إلى قضاياي الخاصة</option>
                {lawyers
                  .filter((l) => l.id !== currentUser.id)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.firstName} {l.lastName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* File upload note */}
          <div className="bg-beige rounded-lg p-6 text-right border border-border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-text-primary font-semibold">
                رفع المستندات (اختياري)
              </h3>
            </div>
            <p className="text-text-muted text-sm">
              يمكنك رفع المستندات بعد حفظ القضية من صفحة تفاصيل القضية
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <button
              onClick={goBack}
              className="px-8 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition"
            >
              السابق
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/cases")}
                className="px-8 py-3 rounded-lg border-2 border-border text-text-primary font-semibold hover:bg-beige transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "جاري الحفظ..." : "حفظ القضية"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-right">
      <label className="text-text-primary font-semibold">{label}</label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="p-4 w-full bg-background rounded-lg border-2 border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12 placeholder:text-text-muted"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          {icon}
        </span>
      </div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  onCancel,
}: {
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-between gap-3">
      <button
        onClick={onBack}
        className="px-8 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition"
      >
        السابق
      </button>
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="px-8 py-3 rounded-lg border-2 border-border text-text-primary font-semibold hover:bg-beige transition"
        >
          إلغاء
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
