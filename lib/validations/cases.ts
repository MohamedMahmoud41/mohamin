import { z } from "zod";

// ─── Constants ────────────────────────────────────────────────────────────────

const PHONE_RE = /^01[0-9]{9}$/;
const NATIONAL_ID_RE = /^[0-9]{14}$/;

// ─── Zod → Formik adapter ────────────────────────────────────────────────────

export function zodToFormikValidate<T>(schema: z.ZodSchema<T>) {
  return (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    });
    return errors;
  };
}

// ─── Case number sub-schema ──────────────────────────────────────────────────

const caseNumberSchema = z.object({
  caseNumber: z.string().min(1, "رقم القضية مطلوب"),
  caseYear: z.string().min(1, "سنة القضية مطلوبة"),
});

// ─── Step field groups (for multi-step navigation) ────────────────────────────

export const STEP_FIELDS: Record<number, string[]> = {
  1: [
    "caseTitle",
    "caseCategory",
    "caseStatus",
    "caseDescription",
    "startDate",
    "nextSessionDate",
    "caseNumbers",
  ],
  2: [
    "clientId",
    "clientName",
    "clientType",
    "clientRole",
    "clientPhone",
    "clientEmail",
    "clientAddress",
    "clientNationalId",
  ],
  3: [
    "opponentName",
    "opponentType",
    "opponentRole",
    "opponentPhone",
    "opponentEmail",
    "opponentAddress",
    "opponentNationalId",
  ],
  4: [
    // Dynamic fields depending on category — all possible fields listed
    "civilDegree",
    "courtId",
    "caseTypeId",
    "courtDivisionId",
    "governorateId",
    "policeStationId",
    "partialProsecutionId",
    "personalServiceTypeId",
    "personalCourtDivisionId",
    "familyCourtId",
    "personalPartialProsecutionId",
    "lawyerIDs",
  ],
};

// ─── Add Case Schema ─────────────────────────────────────────────────────────

export const addCaseSchema = z
  .object({
    // Step 1 – Case info
    caseTitle: z.string().min(1, "عنوان القضية مطلوب"),
    caseCategory: z.enum(["civil", "criminal", "personal"], {
      message: "تصنيف القضية مطلوب",
    }),
    caseStatus: z.string().min(1, "حالة القضية مطلوبة"),
    caseDescription: z.string().min(1, "وصف القضية مطلوب"),
    startDate: z.string().min(1, "تاريخ بدء القضية مطلوب"),
    nextSessionDate: z.string().optional().default(""),
    caseNumbers: z
      .array(caseNumberSchema)
      .min(1, "يجب إضافة رقم قضية واحد على الأقل")
      .max(5, "الحد الأقصى 5 أرقام قضايا"),

    // Step 2 – Client
    clientId: z.string().optional().default(""),
    clientName: z.string().min(1, "اسم العميل مطلوب"),
    clientType: z.string().min(1, "نوع الموكل مطلوب"),
    clientRole: z.string().min(1, "صفة الموكل مطلوبة"),
    clientPhone: z
      .string()
      .min(1, "رقم هاتف العميل مطلوب")
      .regex(PHONE_RE, "رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01"),
    clientEmail: z
      .string()
      .email("صيغة البريد الإلكتروني غير صحيحة")
      .or(z.literal(""))
      .default(""),
    clientAddress: z.string().optional().default(""),
    clientNationalId: z
      .string()
      .regex(NATIONAL_ID_RE, "الرقم القومي يجب أن يكون 14 رقم")
      .or(z.literal(""))
      .default(""),

    // Step 3 – Opponent
    opponentName: z.string().min(1, "اسم الخصم مطلوب"),
    opponentType: z.string().min(1, "نوع الخصم مطلوب"),
    opponentRole: z.string().optional().default(""),
    opponentPhone: z
      .string()
      .regex(PHONE_RE, "رقم هاتف الخصم غير صحيح")
      .or(z.literal(""))
      .default(""),
    opponentEmail: z
      .string()
      .email("صيغة البريد الإلكتروني للخصم غير صحيحة")
      .or(z.literal(""))
      .default(""),
    opponentAddress: z.string().optional().default(""),
    opponentNationalId: z
      .string()
      .regex(NATIONAL_ID_RE, "الرقم القومي للخصم يجب أن يكون 14 رقم")
      .or(z.literal(""))
      .default(""),

    // Step 4 – Dynamic fields (all optional — enforced in superRefine)
    civilDegree: z.string().optional().default(""),
    courtId: z.string().optional().default(""),
    caseTypeId: z.string().optional().default(""),
    courtDivisionId: z.string().optional().default(""),
    governorateId: z.string().optional().default(""),
    policeStationId: z.string().optional().default(""),
    partialProsecutionId: z.string().optional().default(""),
    personalServiceTypeId: z.string().optional().default(""),
    personalCourtDivisionId: z.string().optional().default(""),
    familyCourtId: z.string().optional().default(""),
    personalPartialProsecutionId: z.string().optional().default(""),
    lawyerIDs: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    // Next session date must be in the future
    if (data.nextSessionDate && new Date(data.nextSessionDate) <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "تاريخ الجلسة القادمة يجب أن يكون في المستقبل",
        path: ["nextSessionDate"],
      });
    }

    // Client phone ≠ Opponent phone
    if (
      data.clientPhone &&
      data.opponentPhone &&
      data.clientPhone === data.opponentPhone
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رقم هاتف الخصم لا يمكن أن يكون نفس رقم هاتف العميل",
        path: ["opponentPhone"],
      });
    }

    // Client email ≠ Opponent email
    if (
      data.clientEmail &&
      data.opponentEmail &&
      data.clientEmail === data.opponentEmail
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "البريد الإلكتروني للخصم لا يمكن أن يكون نفس بريد العميل",
        path: ["opponentEmail"],
      });
    }

    // ─── Category-specific required fields ────────────────────────────────
    if (data.caseCategory === "civil") {
      if (!data.civilDegree) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "درجة المحكمة مطلوبة",
          path: ["civilDegree"],
        });
      }
      if (!data.courtId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "المحكمة مطلوبة",
          path: ["courtId"],
        });
      }
    }

    if (data.caseCategory === "criminal") {
      if (!data.courtDivisionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "الجدول مطلوب",
          path: ["courtDivisionId"],
        });
      }
      if (!data.governorateId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "المحافظة مطلوبة",
          path: ["governorateId"],
        });
      }
    }

    if (data.caseCategory === "personal") {
      if (!data.personalServiceTypeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "نوع الخدمة مطلوب",
          path: ["personalServiceTypeId"],
        });
      }
      if (!data.personalCourtDivisionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "الجدول مطلوب",
          path: ["personalCourtDivisionId"],
        });
      }
    }
  });

export type AddCaseFormValues = z.infer<typeof addCaseSchema>;

// ─── Edit Case Schema ─────────────────────────────────────────────────────────

export const editCaseSchema = z
  .object({
    caseTitle: z.string().min(1, "عنوان القضية مطلوب"),
    caseCategory: z
      .enum(["civil", "criminal", "personal"])
      .optional()
      .default("civil"),
    caseStatus: z.string().optional().default(""),
    caseDescription: z.string().optional().default(""),
    startDate: z.string().optional().default(""),
    nextSessionDate: z.string().optional().default(""),
    caseNumbers: z
      .array(caseNumberSchema)
      .min(1, "يجب إضافة رقم قضية واحد على الأقل")
      .max(5, "الحد الأقصى 5 أرقام قضايا"),
    clientId: z.string().optional().default(""),
    clientName: z.string().min(1, "اسم الموكل مطلوب"),
    clientType: z.string().optional().default(""),
    clientRole: z.string().optional().default(""),
    clientEmail: z
      .string()
      .email("البريد الإلكتروني للموكل غير صحيح")
      .or(z.literal(""))
      .default(""),
    clientPhone: z
      .string()
      .regex(
        PHONE_RE,
        "رقم هاتف الموكل غير صحيح (يجب أن يبدأ بـ 01 ويتكون من 11 رقم)",
      )
      .or(z.literal(""))
      .default(""),
    clientAddress: z.string().optional().default(""),
    clientNationalId: z
      .string()
      .regex(NATIONAL_ID_RE, "الرقم القومي يجب أن يكون 14 رقم")
      .or(z.literal(""))
      .default(""),
    opponentName: z.string().optional().default(""),
    opponentType: z.string().optional().default(""),
    opponentRole: z.string().optional().default(""),
    opponentEmail: z
      .string()
      .email("البريد الإلكتروني للخصم غير صحيح")
      .or(z.literal(""))
      .default(""),
    opponentPhone: z
      .string()
      .regex(PHONE_RE, "رقم هاتف الخصم غير صحيح")
      .or(z.literal(""))
      .default(""),
    opponentAddress: z.string().optional().default(""),
    opponentNationalId: z
      .string()
      .regex(NATIONAL_ID_RE, "الرقم القومي للخصم يجب أن يكون 14 رقم")
      .or(z.literal(""))
      .default(""),
    // Dynamic fields
    civilDegree: z.string().optional().default(""),
    courtId: z.string().optional().default(""),
    caseTypeId: z.string().optional().default(""),
    courtDivisionId: z.string().optional().default(""),
    governorateId: z.string().optional().default(""),
    policeStationId: z.string().optional().default(""),
    partialProsecutionId: z.string().optional().default(""),
    personalServiceTypeId: z.string().optional().default(""),
    personalCourtDivisionId: z.string().optional().default(""),
    familyCourtId: z.string().optional().default(""),
    personalPartialProsecutionId: z.string().optional().default(""),
    lawyerIDs: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.nextSessionDate && new Date(data.nextSessionDate) <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "تاريخ الجلسة القادمة يجب أن يكون في المستقبل",
        path: ["nextSessionDate"],
      });
    }

    if (
      data.clientPhone &&
      data.opponentPhone &&
      data.clientPhone === data.opponentPhone
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رقم هاتف الخصم لا يمكن أن يكون نفس رقم هاتف الموكل",
        path: ["opponentPhone"],
      });
    }

    if (
      data.clientEmail &&
      data.opponentEmail &&
      data.clientEmail === data.opponentEmail
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "البريد الإلكتروني للخصم لا يمكن أن يكون نفس بريد الموكل",
        path: ["opponentEmail"],
      });
    }
  });

export type EditCaseFormValues = z.infer<typeof editCaseSchema>;
