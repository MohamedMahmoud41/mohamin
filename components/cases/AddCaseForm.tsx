"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import {
  Scale,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  FileText,
  Hash,
} from "lucide-react";
import { createCase } from "@/app/actions/cases";
import { createClientAction } from "@/app/actions/clients";
import type {
  Lawyer,
  User as UserType,
  Court,
  CaseType,
  CourtDivision,
  Governorate,
  PoliceStation,
  PartialProsecution,
  Client,
} from "@/types";
import {
  addCaseSchema,
  zodToFormikValidate,
  STEP_FIELDS,
  type AddCaseFormValues,
} from "@/lib/validations/cases";
import {
  caseCategoryOptions,
  civilDegreeOptions,
  clientRoleOptions,
  clientTypeOptions,
  opponentRoleOptions,
} from "@/lib/enums";
import {
  SearchableSelectField,
  CreatableSelectField,
  MultiSelectField,
} from "@/components/ui/SearchableSelect";
import ClientSelect from "@/components/cases/ClientSelect";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddCaseFormProps {
  lawyers: Lawyer[];
  currentUser: UserType;
  clients: Client[];
  allCourts: Court[];
  allCaseTypes: CaseType[];
  allCourtDivisions: CourtDivision[];
  allGovernorates: Governorate[];
  allPoliceStations: PoliceStation[];
  allPartialProsecutions: PartialProsecution[];
}

// ─── Initial Values ────────────────────────────────────────────────────────────

const initialValues: AddCaseFormValues = {
  caseTitle: "",
  caseCategory: "" as AddCaseFormValues["caseCategory"],
  caseStatus: "",
  caseDescription: "",
  startDate: "",
  nextSessionDate: "",
  caseNumbers: [{ caseNumber: "", caseYear: "" }],
  clientId: "",
  clientName: "",
  clientType: "فرد",
  clientRole: "",
  clientPhone: "",
  clientEmail: "",
  clientAddress: "",
  clientNationalId: "",
  opponentName: "",
  opponentType: "فرد",
  opponentRole: "",
  opponentPhone: "",
  opponentEmail: "",
  opponentAddress: "",
  opponentNationalId: "",
  civilDegree: "",
  courtId: "",
  caseTypeId: "",
  courtDivisionId: "",
  governorateId: "",
  policeStationId: "",
  partialProsecutionId: "",
  personalServiceTypeId: "",
  personalCourtDivisionId: "",
  familyCourtId: "",
  personalPartialProsecutionId: "",
  lawyerIDs: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddCaseForm({
  lawyers,
  currentUser,
  clients,
  allCourts,
  allCaseTypes,
  allCourtDivisions,
  allGovernorates,
  allPoliceStations,
  allPartialProsecutions,
}: AddCaseFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const [clientMode, setClientMode] = useState<"new" | "existing">("new");

  const formik = useFormik<AddCaseFormValues>({
    initialValues,
    validate: zodToFormikValidate(addCaseSchema),
    onSubmit: (values) => {
      const isOwner = currentUser.role?.includes("officeOwner");
      const selectedLawyerIDs =
        isOwner && values.lawyerIDs.length > 0
          ? values.lawyerIDs
          : [currentUser.id];
      const primaryLawyerId = selectedLawyerIDs[0];
      const primaryLawyer = lawyers.find((l) => l.id === primaryLawyerId);
      const lawyerName = primaryLawyer
        ? `${primaryLawyer.firstName} ${primaryLawyer.lastName}`
        : `${currentUser.firstName} ${currentUser.lastName}`;

      startTransition(async () => {
        setServerError("");

        // Auto-create client when in "new" mode
        let resolvedClientId = values.clientId || undefined;
        if (clientMode === "new" && values.clientName.trim()) {
          const clientRes = await createClientAction({
            name: values.clientName.trim(),
            type: (values.clientType === "شركة" ? "company" : "individual") as
              | "individual"
              | "company",
            nationalId: values.clientNationalId || "",
            phone: values.clientPhone || "",
            email: values.clientEmail || "",
            address: values.clientAddress || "",
            officeId: currentUser.officeId || "",
          });
          if (clientRes.error) {
            setServerError(clientRes.error);
            return;
          }
          resolvedClientId = clientRes.data?.id;
        }

        const { error } = await createCase({
          caseTitle: values.caseTitle,
          caseCategory: values.caseCategory,
          caseStatus: values.caseStatus,
          caseDescription: values.caseDescription,
          startDate: values.startDate,
          nextSessionDate: values.nextSessionDate || null,
          caseNumbers: values.caseNumbers,
          civilDegree: values.civilDegree,
          courtId: values.courtId,
          caseTypeId: values.caseTypeId,
          courtDivisionId: values.courtDivisionId,
          governorateId: values.governorateId,
          policeStationId: values.policeStationId,
          partialProsecutionId: values.partialProsecutionId,
          personalServiceTypeId: values.personalServiceTypeId,
          personalCourtDivisionId: values.personalCourtDivisionId,
          familyCourtId: values.familyCourtId,
          personalPartialProsecutionId: values.personalPartialProsecutionId,
          lawyerID: primaryLawyerId,
          lawyerName,
          lawyerIDs: selectedLawyerIDs,
          clientId: resolvedClientId,
          officeId: currentUser.officeId || "",
          clientName: values.clientName,
          clientPhone: values.clientPhone,
          clientEmail: values.clientEmail,
          clientAddress: values.clientAddress,
          clientNationalId: values.clientNationalId,
          clientType: values.clientType,
          clientRole: values.clientRole,
          opponentName: values.opponentName,
          opponentPhone: values.opponentPhone,
          opponentEmail: values.opponentEmail,
          opponentAddress: values.opponentAddress,
          opponentType: values.opponentType,
          opponentNationalId: values.opponentNationalId,
          opponentRole: values.opponentRole,
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

  // ─── Computed filtered lists ──────────────────────────────────────────

  const category = formik.values.caseCategory;
  const civilDegree = formik.values.civilDegree;
  const selectedCourtId = formik.values.courtId;
  const selectedGovernorateId = formik.values.governorateId;

  // Civil: courts based on degree
  const civilCourts =
    civilDegree === "partial" || !civilDegree
      ? []
      : allCourts.filter((c) => c.courtDegree === civilDegree);

  // Civil: case types based on selected court + civil category
  const civilCaseTypes = selectedCourtId
    ? allCaseTypes.filter(
        (ct) =>
          ct.category === "civil" && ct.courtIds.includes(selectedCourtId),
      )
    : [];

  // Criminal: court divisions
  const criminalDivisions = allCourtDivisions.filter(
    (d) => d.category === "criminal",
  );

  // Criminal: police stations by governorate
  const criminalPoliceStations = selectedGovernorateId
    ? allPoliceStations.filter(
        (ps) => ps.governorateId === selectedGovernorateId,
      )
    : [];

  // Criminal: courts by governorate
  const criminalCourts = selectedGovernorateId
    ? allCourts.filter((c) => c.governorateId === selectedGovernorateId)
    : [];

  // Personal: service types (case_types where category = personal)
  const personalServiceTypes = allCaseTypes.filter(
    (ct) => ct.category === "personal",
  );

  // Personal: court divisions
  const personalDivisions = allCourtDivisions.filter(
    (d) => d.category === "personal",
  );

  // Personal: family courts
  const familyCourts = allCourts.filter((c) => c.courtDegree === "family");

  // ─── Reset dependent fields when parent changes ────────────────────────

  const resetCategoryFields = useCallback(() => {
    formik.setFieldValue("civilDegree", "");
    formik.setFieldValue("courtId", "");
    formik.setFieldValue("caseTypeId", "");
    formik.setFieldValue("courtDivisionId", "");
    formik.setFieldValue("governorateId", "");
    formik.setFieldValue("policeStationId", "");
    formik.setFieldValue("partialProsecutionId", "");
    formik.setFieldValue("personalServiceTypeId", "");
    formik.setFieldValue("personalCourtDivisionId", "");
    formik.setFieldValue("familyCourtId", "");
    formik.setFieldValue("personalPartialProsecutionId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [prevCategory, setPrevCategory] = useState(category);
  useEffect(() => {
    if (category !== prevCategory) {
      resetCategoryFields();
      setPrevCategory(category);
    }
  }, [category, prevCategory, resetCategoryFields]);

  const [prevDegree, setPrevDegree] = useState(civilDegree);
  useEffect(() => {
    if (civilDegree !== prevDegree) {
      formik.setFieldValue("courtId", "");
      formik.setFieldValue("caseTypeId", "");
      setPrevDegree(civilDegree);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [civilDegree, prevDegree]);

  const [prevCourt, setPrevCourt] = useState(selectedCourtId);
  useEffect(() => {
    if (selectedCourtId !== prevCourt) {
      formik.setFieldValue("caseTypeId", "");
      setPrevCourt(selectedCourtId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourtId, prevCourt]);

  const [prevGov, setPrevGov] = useState(selectedGovernorateId);
  useEffect(() => {
    if (selectedGovernorateId !== prevGov) {
      formik.setFieldValue("policeStationId", "");
      formik.setFieldValue("courtId", "");
      setPrevGov(selectedGovernorateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGovernorateId, prevGov]);

  // ─── Case Numbers ──────────────────────────────────────────────────────

  const addCaseNumber = () => {
    const current = formik.values.caseNumbers;
    if (current.length < 5) {
      formik.setFieldValue("caseNumbers", [
        ...current,
        { caseNumber: "", caseYear: "" },
      ]);
    }
  };

  const removeCaseNumber = (index: number) => {
    const current = formik.values.caseNumbers;
    if (current.length > 1) {
      formik.setFieldValue(
        "caseNumbers",
        current.filter((_, i) => i !== index),
      );
    }
  };

  // ─── Navigation ─────────────────────────────────────────────────────────
  const goNext = async () => {
    setServerError("");
    const fields = STEP_FIELDS[step] ?? [];
    fields.forEach((f) => formik.setFieldTouched(f, true));
    if (step === 1) {
      formik.values.caseNumbers.forEach((_, i) => {
        formik.setFieldTouched(`caseNumbers.${i}.caseNumber`, true);
        formik.setFieldTouched(`caseNumbers.${i}.caseYear`, true);
      });
    }
    const errors = await formik.validateForm();
    const hasStepErrors = fields.some((f) => {
      if (f === "caseNumbers") return errors.caseNumbers;
      return errors[f as keyof typeof errors];
    });
    if (!hasStepErrors) setStep((s) => s + 1);
  };

  const goBack = () => {
    setServerError("");
    setStep((s) => s - 1);
  };

  const handleSave = async () => {
    const fields = STEP_FIELDS[4] ?? [];
    fields.forEach((f) => formik.setFieldTouched(f, true));
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
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

  const fieldError = (name: string) => {
    const parts = name.split(".");
    let touched: unknown = formik.touched;
    let error: unknown = formik.errors;
    for (const p of parts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      touched = (touched as any)?.[p];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error = (error as any)?.[p];
    }
    return touched && typeof error === "string" ? error : "";
  };

  const stepColor = (s: number) =>
    s <= step ? "bg-primary text-white" : "bg-beige text-primary";

  return (
    <div className="w-full flex flex-col gap-6 p-4 md:p-8 bg-background min-h-screen">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          إضافة قضية جديدة
        </h1>
        <p className="text-text-muted mt-2">أدخل معلومات القضية والعميل</p>
      </div>

      <div className="flex flex-row items-center justify-center gap-4 my-6">
        {[1, 2, 3, 4].map((s, idx) => (
          <div key={s} className="flex flex-row items-center gap-4">
            <div
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold shrink-0 ${stepColor(s)}`}
            >
              {s}
            </div>
            {idx < 3 && (
              <div
                className={`w-12 h-1 rounded-full ${step > s ? "bg-primary" : "bg-beige"}`}
              />
            )}
          </div>
        ))}
      </div>

      {serverError && (
        <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg text-right">
          {serverError}
        </div>
      )}

      {/* ─── Step 1: Case Info ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-surface p-4 md:p-8 rounded-lg shadow-sm border border-border flex flex-col gap-6 md:gap-8">
          <div className="text-right">
            <h2 className="text-text-primary text-2xl font-bold">
              معلومات القضية
            </h2>
            <p className="text-text-muted text-sm mt-1">
              أدخل المعلومات الأساسية للقضية
            </p>
          </div>

          <InputField
            label="عنوان القضية *"
            name="caseTitle"
            icon={<Scale className="w-5 h-5 text-text-secondary" />}
            value={formik.values.caseTitle}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("caseTitle")}
            placeholder="مثال: قضية تجارية - نزاع عقد توريد"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-right">
            <SearchableSelectField
              name="caseCategory"
              label="تصنيف القضية"
              required
              value={formik.values.caseCategory}
              onChange={(val) => formik.setFieldValue("caseCategory", val)}
              onBlur={() => formik.setFieldTouched("caseCategory", true)}
              error={fieldError("caseCategory")}
              placeholder="اختر تصنيف القضية"
              options={caseCategoryOptions}
            />
            <SearchableSelectField
              name="caseStatus"
              label="حالة القضية"
              required
              value={formik.values.caseStatus}
              onChange={(val) => formik.setFieldValue("caseStatus", val)}
              onBlur={() => formik.setFieldTouched("caseStatus", true)}
              error={fieldError("caseStatus")}
              placeholder="اختر حالة القضية"
              options={[
                { value: "جارية", label: "جارية" },
                { value: "قيد الانتظار", label: "قيد الانتظار" },
                { value: "منتهية لصالح الموكل", label: "منتهية لصالح الموكل" },
                { value: "مغلقة", label: "مغلقة" },
              ]}
            />
          </div>

          {/* Case Numbers */}
          <div className="flex flex-col gap-3 text-right">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={addCaseNumber}
                disabled={formik.values.caseNumbers.length >= 5}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                إضافة رقم
              </button>
              <label className="text-text-primary font-semibold">
                أرقام القضية <span className="text-error">*</span>
              </label>
            </div>
            {formik.values.caseNumbers.map((cn, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-background p-3 rounded-lg border border-border"
              >
                {formik.values.caseNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCaseNumber(idx)}
                    className="mt-3 text-error hover:text-error/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-text-muted text-xs">
                      رقم القضية
                    </label>
                    <div className="relative">
                      <input
                        name={`caseNumbers.${idx}.caseNumber`}
                        value={cn.caseNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="p-3 w-full bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary pr-9 placeholder:text-text-muted"
                        placeholder="مثال: 1234"
                      />
                      <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    </div>
                    {fieldError(`caseNumbers.${idx}.caseNumber`) && (
                      <p className="text-error text-xs">
                        {fieldError(`caseNumbers.${idx}.caseNumber`)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-text-muted text-xs">السنة</label>
                    <input
                      name={`caseNumbers.${idx}.caseYear`}
                      value={cn.caseYear}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="p-3 w-full bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted"
                      placeholder="مثال: 2026"
                    />
                    {fieldError(`caseNumbers.${idx}.caseYear`) && (
                      <p className="text-error text-xs">
                        {fieldError(`caseNumbers.${idx}.caseYear`)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {typeof formik.errors.caseNumbers === "string" && (
              <p className="text-error text-xs">{formik.errors.caseNumbers}</p>
            )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-right">
            <div className="flex flex-col gap-2">
              <label className="text-text-primary font-semibold">
                تاريخ بدء القضية <span className="text-error">*</span>
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
        <div className="bg-surface p-4 md:p-8 rounded-lg shadow-sm border border-border flex flex-col gap-6 md:gap-8">
          <div className="text-right">
            <h2 className="text-text-primary text-2xl font-bold">
              بيانات العميل
            </h2>
            <p className="text-text-muted text-sm mt-1">
              اختر عميل موجود أو أدخل بيانات عميل جديد
            </p>
          </div>

          {/* Client Mode Toggle */}
          <ClientSelect
            clients={clients}
            selectedClientId={formik.values.clientId}
            onClientSelect={(client) => {
              formik.setFieldValue("clientId", client?.id || "");
            }}
            onFillFields={(client) => {
              formik.setFieldValue("clientName", client.name);
              formik.setFieldValue(
                "clientType",
                client.type === "company" ? "شركة" : "فرد",
              );
              formik.setFieldValue("clientPhone", client.phone);
              formik.setFieldValue("clientEmail", client.email);
              formik.setFieldValue("clientAddress", client.address);
              formik.setFieldValue("clientNationalId", client.nationalId);
            }}
            onModeChange={(mode) => {
              setClientMode(mode);
              if (mode === "new") {
                formik.setFieldValue("clientId", "");
                formik.setFieldValue("clientName", "");
                formik.setFieldValue("clientType", "فرد");
                formik.setFieldValue("clientPhone", "");
                formik.setFieldValue("clientEmail", "");
                formik.setFieldValue("clientAddress", "");
                formik.setFieldValue("clientNationalId", "");
              }
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <InputField
              label="اسم الموكل / الجهة *"
              name="clientName"
              icon={<User className="w-5 h-5 text-primary" />}
              value={formik.values.clientName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError("clientName")}
              placeholder="مثال: شركة النور للتجارة"
            />
            <SearchableSelectField
              name="clientType"
              label="نوع الموكل"
              required
              value={formik.values.clientType}
              onChange={(val) => formik.setFieldValue("clientType", val)}
              onBlur={() => formik.setFieldTouched("clientType", true)}
              error={fieldError("clientType")}
              placeholder="اختر النوع"
              options={clientTypeOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <CreatableSelectField
              name="clientRole"
              label="صفة الموكل"
              required
              value={formik.values.clientRole}
              onChange={(val) => formik.setFieldValue("clientRole", val)}
              onBlur={() => formik.setFieldTouched("clientRole", true)}
              error={fieldError("clientRole")}
              placeholder="اختر أو اكتب صفة الموكل"
              options={clientRoleOptions}
            />
            <InputField
              label="الرقم القومي"
              name="clientNationalId"
              icon={<Hash className="w-5 h-5 text-primary" />}
              value={formik.values.clientNationalId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError("clientNationalId")}
              placeholder="14 رقم"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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

          <div className="grid grid-cols-1  gap-4 md:gap-6">
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
          </div>

          <NavButtons
            onBack={goBack}
            onNext={goNext}
            onCancel={() => router.push("/cases")}
          />
        </div>
      )}

      {/* ─── Step 3: Opponent Info ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-surface p-4 md:p-8 rounded-lg shadow-sm border border-border flex flex-col gap-6 md:gap-8">
          <div className="text-right">
            <h2 className="text-text-primary text-2xl font-bold">
              معلومات الخصم
            </h2>
            <p className="text-text-muted text-sm mt-1">
              أدخل معلومات الخصم أو الجهة المدعية
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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
            <SearchableSelectField
              name="opponentType"
              label="نوع الخصم"
              required
              value={formik.values.opponentType}
              onChange={(val) => formik.setFieldValue("opponentType", val)}
              onBlur={() => formik.setFieldTouched("opponentType", true)}
              error={fieldError("opponentType")}
              placeholder="اختر نوع الخصم"
              options={[
                { value: "فرد", label: "فرد" },
                { value: "شركة", label: "شركة" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <CreatableSelectField
              name="opponentRole"
              label="صفة الخصم"
              value={formik.values.opponentRole}
              onChange={(val) => formik.setFieldValue("opponentRole", val)}
              onBlur={() => formik.setFieldTouched("opponentRole", true)}
              error={fieldError("opponentRole")}
              placeholder="اختر أو اكتب صفة الخصم"
              options={opponentRoleOptions}
            />
            <InputField
              label="الرقم القومي"
              name="opponentNationalId"
              icon={<Hash className="w-5 h-5 text-primary" />}
              value={formik.values.opponentNationalId ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={fieldError("opponentNationalId")}
              placeholder="14 رقم"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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

      {/* ─── Step 4: Dynamic Court/Category Fields & Lawyer ────────────────── */}
      {step === 4 && (
        <div className="bg-surface p-4 md:p-8 rounded-lg shadow-sm border border-border flex flex-col gap-6 md:gap-8">
          <div className="text-right">
            <h2 className="text-text-primary text-2xl font-bold">
              بيانات المحكمة والتوزيع
            </h2>
            <p className="text-text-muted text-sm mt-1">
              {category === "civil"
                ? "أدخل بيانات القضية المدنية"
                : category === "criminal"
                  ? "أدخل بيانات القضية الجنائية"
                  : category === "personal"
                    ? "أدخل بيانات قضية الشئون الشخصية"
                    : "يرجى اختيار تصنيف القضية أولاً (الخطوة 1)"}
            </p>
          </div>

          {/* ─── Civil Fields ────────────────────────────────────────────── */}
          {category === "civil" && (
            <div className="flex flex-col gap-4 text-right">
              <SearchableSelectField
                name="civilDegree"
                label="الدرجة"
                required
                value={formik.values.civilDegree}
                onChange={(val) => formik.setFieldValue("civilDegree", val)}
                onBlur={() => formik.setFieldTouched("civilDegree", true)}
                error={fieldError("civilDegree")}
                placeholder="اختر الدرجة"
                options={civilDegreeOptions}
              />

              {civilDegree && (
                <SearchableSelectField
                  name="courtId"
                  label={
                    civilDegree === "partial"
                      ? "النيابة الجزئية *"
                      : "المحكمة *"
                  }
                  value={formik.values.courtId}
                  onChange={(val) => formik.setFieldValue("courtId", val)}
                  onBlur={() => formik.setFieldTouched("courtId", true)}
                  error={fieldError("courtId")}
                  placeholder={
                    civilDegree === "partial" ? "اختر النيابة" : "اختر المحكمة"
                  }
                  options={
                    civilDegree === "partial"
                      ? allPartialProsecutions.map((pp) => ({
                          value: pp.id,
                          label: pp.name,
                        }))
                      : civilCourts.map((c) => ({ value: c.id, label: c.name }))
                  }
                />
              )}

              {selectedCourtId && civilDegree !== "partial" && (
                <SearchableSelectField
                  name="caseTypeId"
                  label="نوع القضية"
                  value={formik.values.caseTypeId}
                  onChange={(val) => formik.setFieldValue("caseTypeId", val)}
                  onBlur={() => formik.setFieldTouched("caseTypeId", true)}
                  error={fieldError("caseTypeId")}
                  placeholder="اختر نوع القضية"
                  options={civilCaseTypes.map((ct) => ({
                    value: ct.id,
                    label: ct.name,
                  }))}
                />
              )}
            </div>
          )}

          {/* ─── Criminal Fields ─────────────────────────────────────────── */}
          {category === "criminal" && (
            <div className="flex flex-col gap-4 text-right">
              <SearchableSelectField
                name="courtDivisionId"
                label="الجدول"
                required
                value={formik.values.courtDivisionId}
                onChange={(val) => formik.setFieldValue("courtDivisionId", val)}
                onBlur={() => formik.setFieldTouched("courtDivisionId", true)}
                error={fieldError("courtDivisionId")}
                placeholder="اختر الجدول"
                options={criminalDivisions.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
              />

              <SearchableSelectField
                name="governorateId"
                label="المحافظة"
                required
                value={formik.values.governorateId}
                onChange={(val) => formik.setFieldValue("governorateId", val)}
                onBlur={() => formik.setFieldTouched("governorateId", true)}
                error={fieldError("governorateId")}
                placeholder="اختر المحافظة"
                options={allGovernorates.map((g) => ({
                  value: g.id,
                  label: g.name,
                }))}
              />

              {selectedGovernorateId && (
                <>
                  <SearchableSelectField
                    name="policeStationId"
                    label="جهة القيد (قسم الشرطة)"
                    value={formik.values.policeStationId}
                    onChange={(val) =>
                      formik.setFieldValue("policeStationId", val)
                    }
                    onBlur={() =>
                      formik.setFieldTouched("policeStationId", true)
                    }
                    error={fieldError("policeStationId")}
                    placeholder="اختر قسم الشرطة"
                    options={criminalPoliceStations.map((ps) => ({
                      value: ps.id,
                      label: ps.name,
                    }))}
                  />
                  <SearchableSelectField
                    name="courtId"
                    label="المحكمة"
                    value={formik.values.courtId}
                    onChange={(val) => formik.setFieldValue("courtId", val)}
                    onBlur={() => formik.setFieldTouched("courtId", true)}
                    error={fieldError("courtId")}
                    placeholder="اختر المحكمة"
                    options={criminalCourts.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                  />
                </>
              )}

              <SearchableSelectField
                name="partialProsecutionId"
                label="النيابة الجزئية"
                value={formik.values.partialProsecutionId}
                onChange={(val) =>
                  formik.setFieldValue("partialProsecutionId", val)
                }
                onBlur={() =>
                  formik.setFieldTouched("partialProsecutionId", true)
                }
                error={fieldError("partialProsecutionId")}
                placeholder="اختر النيابة"
                options={allPartialProsecutions.map((pp) => ({
                  value: pp.id,
                  label: pp.name,
                }))}
              />
            </div>
          )}

          {/* ─── Personal Fields ─────────────────────────────────────────── */}
          {category === "personal" && (
            <div className="flex flex-col gap-4 text-right">
              <SearchableSelectField
                name="personalServiceTypeId"
                label="نوع الخدمة"
                required
                value={formik.values.personalServiceTypeId}
                onChange={(val) =>
                  formik.setFieldValue("personalServiceTypeId", val)
                }
                onBlur={() =>
                  formik.setFieldTouched("personalServiceTypeId", true)
                }
                error={fieldError("personalServiceTypeId")}
                placeholder="اختر نوع الخدمة"
                options={personalServiceTypes.map((st) => ({
                  value: st.id,
                  label: st.name,
                }))}
              />
              <SearchableSelectField
                name="personalCourtDivisionId"
                label="الدائرة"
                required
                value={formik.values.personalCourtDivisionId}
                onChange={(val) =>
                  formik.setFieldValue("personalCourtDivisionId", val)
                }
                onBlur={() =>
                  formik.setFieldTouched("personalCourtDivisionId", true)
                }
                error={fieldError("personalCourtDivisionId")}
                placeholder="اختر الدائرة"
                options={personalDivisions.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
              />
              <SearchableSelectField
                name="familyCourtId"
                label="النيابة الكلية (محكمة الأسرة)"
                value={formik.values.familyCourtId}
                onChange={(val) => formik.setFieldValue("familyCourtId", val)}
                onBlur={() => formik.setFieldTouched("familyCourtId", true)}
                error={fieldError("familyCourtId")}
                placeholder="اختر محكمة الأسرة"
                options={familyCourts.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
              <SearchableSelectField
                name="personalPartialProsecutionId"
                label="النيابة الجزئية"
                value={formik.values.personalPartialProsecutionId}
                onChange={(val) =>
                  formik.setFieldValue("personalPartialProsecutionId", val)
                }
                onBlur={() =>
                  formik.setFieldTouched("personalPartialProsecutionId", true)
                }
                error={fieldError("personalPartialProsecutionId")}
                placeholder="اختر النيابة"
                options={allPartialProsecutions.map((pp) => ({
                  value: pp.id,
                  label: pp.name,
                }))}
              />
            </div>
          )}

          {!category && (
            <div className="bg-beige rounded-lg p-6 text-right border border-border">
              <p className="text-text-muted text-sm">
                يرجى اختيار تصنيف القضية في الخطوة الأولى لعرض الحقول المناسبة
              </p>
            </div>
          )}

          {/* Lawyer selector (owners only) */}
          {currentUser.role?.includes("officeOwner") && (
            <MultiSelectField
              name="lawyerIDs"
              label="اختيار المحامين المسؤولين"
              values={formik.values.lawyerIDs}
              onChange={(vals) => formik.setFieldValue("lawyerIDs", vals)}
              placeholder="اختر محامي أو أكثر"
              options={[
                {
                  value: currentUser.id,
                  label: `${currentUser.firstName} ${currentUser.lastName} (أنا)`,
                },
                ...lawyers
                  .filter((l) => l.id !== currentUser.id)
                  .map((l) => ({
                    value: l.id,
                    label: `${l.firstName} ${l.lastName}`,
                  })),
              ]}
            />
          )}

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
