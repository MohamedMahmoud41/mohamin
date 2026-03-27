"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
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
import {
  addCaseSchema,
  zodToFormikValidate,
  STEP_FIELDS,
  type AddCaseFormValues,
} from "@/lib/validations/cases";

// ─── Types ────────────────────────────────────────────────────────────────────

const initialValues: AddCaseFormValues = {
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
  const [showCourtSuggestions, setShowCourtSuggestions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");

  const formik = useFormik<AddCaseFormValues>({
    initialValues,
    validate: zodToFormikValidate(addCaseSchema),
    onSubmit: (values) => {
      const isOwner = currentUser.role?.includes("officeOwner");
      const lawyerId = isOwner
        ? values.lawyerID || currentUser.id
        : currentUser.id;
      const lawyerName = isOwner
        ? values.lawyerName ||
          `${currentUser.firstName} ${currentUser.lastName}`
        : `${currentUser.firstName} ${currentUser.lastName}`;

      startTransition(async () => {
        setServerError("");
        const { error } = await createCase({
          ...values,
          lawyerID: lawyerId,
          lawyerName,
          officeId: currentUser.officeId || "",
          nextSessionDate: values.nextSessionDate || null,
        });

        if (error) {
          setServerError(error);
          return;
        }
        router.push("/cases");
        router.refresh();
      });
    },
  });

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const goNext = async () => {
    setServerError("");
    const fields = STEP_FIELDS[step] ?? [];
    // Touch all fields in current step so errors appear
    fields.forEach((f) => formik.setFieldTouched(f, true));
    const errors = await formik.validateForm();
    const hasStepErrors = fields.some((f) => errors[f as keyof typeof errors]);
    if (!hasStepErrors) setStep((s) => s + 1);
  };

  const goBack = () => {
    setServerError("");
    setStep((s) => s - 1);
  };

  // ─── Submit (step 4) ───────────────────────────────────────────────────────
  const handleSave = async () => {
    // Touch step 4 fields
    const fields = STEP_FIELDS[4] ?? [];
    fields.forEach((f) => formik.setFieldTouched(f, true));
    const errors = await formik.validateForm();
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      // If errors are on a previous step, show generic message
      const hasStep4Errors = fields.some(
        (f) => errors[f as keyof typeof errors],
      );
      if (!hasStep4Errors) {
        setServerError("يرجى التحقق من جميع الخطوات السابقة");
      }
      return;
    }
    formik.handleSubmit();
  };

  // Helper to get field error (only if touched)
  const fieldError = (name: keyof AddCaseFormValues) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : "";

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
      {serverError && (
        <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg text-right">
          {serverError}
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
                name="caseTitle"
                value={formik.values.caseTitle}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="p-4 w-full bg-background rounded-lg border-2 border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10 placeholder:text-text-muted"
                placeholder="مثال: قضية تجارية - نزاع عقد توريد"
              />
              <Scale className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            </div>
            {fieldError("caseTitle") && (
              <p className="text-error text-xs">{fieldError("caseTitle")}</p>
            )}
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-6 text-right">
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                نوع القضية *
              </label>
              <select
                name="caseType"
                value={formik.values.caseType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
              {fieldError("caseType") && (
                <p className="text-error text-xs">{fieldError("caseType")}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                حالة القضية *
              </label>
              <select
                name="caseStatus"
                value={formik.values.caseStatus}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">اختر حالة القضية</option>
                {["جارية", "قيد الانتظار", "مكسوبة", "مغلقة"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {fieldError("caseStatus") && (
                <p className="text-error text-xs">{fieldError("caseStatus")}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2 text-right">
            <label className="text-text-primary font-semibold">
              وصف القضية <span className="text-error">*</span>
            </label>
            <textarea
              name="caseDescription"
              value={formik.values.caseDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="p-4 bg-background border-2 border-border rounded-lg text-text-primary min-h-[130px] focus:outline-none focus:border-primary placeholder:text-text-muted"
              placeholder="اكتب وصفاً تفصيلياً للقضية..."
            />
            {fieldError("caseDescription") && (
              <p className="text-error text-xs">
                {fieldError("caseDescription")}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6 text-right">
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                تاريخ بدء القضية *
              </label>
              <input
                type="date"
                name="startDate"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
              {fieldError("startDate") && (
                <p className="text-error text-xs">{fieldError("startDate")}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                تاريخ الجلسة القادمة
              </label>
              <input
                type="datetime-local"
                name="nextSessionDate"
                value={formik.values.nextSessionDate}
                min={new Date().toISOString().slice(0, 16)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="p-4 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
              {fieldError("nextSessionDate") && (
                <p className="text-error text-xs">
                  {fieldError("nextSessionDate")}
                </p>
              )}
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
              name="clientName"
              icon={<User className="w-5 h-5 text-primary" />}
              value={formik.values.clientName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError("clientName")}
              placeholder="مثال: شركة النور للتجارة"
            />
            <div className="flex flex-col gap-2 text-right">
              <label className="text-text-primary font-semibold">
                نوع العميل *
              </label>
              <select
                name="clientType"
                value={formik.values.clientType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
              name="clientEmail"
              icon={<Mail className="w-5 h-5 text-primary" />}
              value={formik.values.clientEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError("clientEmail")}
              placeholder="client@example.com"
            />
            <InputField
              label="رقم الهاتف *"
              name="clientPhone"
              icon={<Phone className="w-5 h-5 text-primary" />}
              value={formik.values.clientPhone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError("clientPhone")}
              placeholder="01XXXXXXXXX"
            />
          </div>

          <InputField
            label="العنوان"
            name="clientAddress"
            icon={<MapPin className="w-5 h-5 text-primary" />}
            value={formik.values.clientAddress ?? ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("clientAddress")}
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
              name="opponentName"
              icon={<User className="w-5 h-5 text-primary" />}
              value={formik.values.opponentName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError("opponentName")}
              placeholder="مثال: شركة النور للتجارة"
            />
            <div className="flex flex-col gap-2 text-right">
              <label className="text-text-primary font-semibold">
                نوع الخصم *
              </label>
              <select
                name="opponentType"
                value={formik.values.opponentType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
              name="opponentEmail"
              icon={<Mail className="w-5 h-5 text-primary" />}
              value={formik.values.opponentEmail ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError("opponentEmail")}
              placeholder="opponent@example.com"
            />
            <InputField
              label="رقم الهاتف"
              name="opponentPhone"
              icon={<Phone className="w-5 h-5 text-primary" />}
              value={formik.values.opponentPhone ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError("opponentPhone")}
              placeholder="01XXXXXXXXX"
            />
          </div>

          <InputField
            label="العنوان"
            name="opponentAddress"
            icon={<MapPin className="w-5 h-5 text-primary" />}
            value={formik.values.opponentAddress ?? ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("opponentAddress")}
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
                  name="courtName"
                  value={formik.values.courtName}
                  onChange={(e) => {
                    formik.handleChange(e);
                    setShowCourtSuggestions(true);
                  }}
                  onFocus={() => setShowCourtSuggestions(true)}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    setTimeout(() => setShowCourtSuggestions(false), 200);
                  }}
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
                          .includes(formik.values.courtName.toLowerCase()),
                      )
                      .map((c) => (
                        <li
                          key={c.id}
                          className="p-3 hover:bg-beige cursor-pointer text-text-primary border-b border-border/50 last:border-0"
                          onClick={() => {
                            formik.setFieldValue("courtName", c.name);
                            setShowCourtSuggestions(false);
                          }}
                        >
                          {c.name}
                        </li>
                      ))}
                    {courts.filter((c) =>
                      c.name
                        .toLowerCase()
                        .includes(formik.values.courtName.toLowerCase()),
                    ).length === 0 && (
                      <li className="p-3 text-text-muted text-sm">
                        لا توجد نتائج (سيتم حفظ الاسم الجديد)
                      </li>
                    )}
                  </ul>
                )}
              </div>
              {fieldError("courtName") && (
                <p className="text-error text-xs">{fieldError("courtName")}</p>
              )}
            </div>

            {/* Court hall */}
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                رقم القاعة
              </label>
              <div className="relative">
                <input
                  name="courtHall"
                  value={formik.values.courtHall}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
                name="lawyerID"
                value={formik.values.lawyerID}
                onChange={(e) => {
                  const id = e.target.value;
                  const found = lawyers.find((l) => l.id === id);
                  formik.setFieldValue("lawyerID", id);
                  formik.setFieldValue(
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
  name,
  icon,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}: {
  label: string;
  name: string;
  icon: React.ReactNode;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-right">
      <label className="text-text-primary font-semibold">{label}</label>
      <div className="relative">
        <input
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className="p-4 w-full bg-background rounded-lg border-2 border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-12 placeholder:text-text-muted"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          {icon}
        </span>
      </div>
      {error && <p className="text-error text-xs">{error}</p>}
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
