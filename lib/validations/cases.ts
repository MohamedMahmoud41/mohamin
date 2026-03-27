import { z } from "zod";

// ─── Constants ────────────────────────────────────────────────────────────────

const PHONE_RE = /^01[0-9]{9}$/;

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

// ─── Step field groups (for multi-step navigation) ────────────────────────────

export const STEP_FIELDS: Record<number, string[]> = {
  1: [
    "caseTitle",
    "caseType",
    "caseStatus",
    "caseDescription",
    "startDate",
    "nextSessionDate",
  ],
  2: [
    "clientName",
    "clientType",
    "clientPhone",
    "clientEmail",
    "clientAddress",
  ],
  3: [
    "opponentName",
    "opponentType",
    "opponentPhone",
    "opponentEmail",
    "opponentAddress",
  ],
  4: ["courtName", "courtHall", "lawyerID", "lawyerName"],
};

// ─── Add Case Schema ─────────────────────────────────────────────────────────

export const addCaseSchema = z
  .object({
    // Step 1 – Case info
    caseTitle: z.string().min(1, "عنوان القضية مطلوب"),
    caseType: z.string().min(1, "نوع القضية مطلوب"),
    caseStatus: z.string().min(1, "حالة القضية مطلوبة"),
    caseDescription: z.string().min(1, "وصف القضية مطلوب"),
    startDate: z.string().min(1, "تاريخ بدء القضية مطلوب"),
    nextSessionDate: z.string().optional().default(""),

    // Step 2 – Client
    clientName: z.string().min(1, "اسم العميل مطلوب"),
    clientType: z.string().min(1, "نوع العميل مطلوب"),
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

    // Step 3 – Opponent
    opponentName: z.string().min(1, "اسم الخصم مطلوب"),
    opponentType: z.string().min(1, "نوع الخصم مطلوب"),
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

    // Step 4 – Court & Lawyer
    courtName: z.string().min(1, "اسم المحكمة مطلوب"),
    courtHall: z.string().optional().default(""),
    lawyerID: z.string().optional().default(""),
    lawyerName: z.string().optional().default(""),
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
  });

export type AddCaseFormValues = z.infer<typeof addCaseSchema>;

// ─── Edit Case Schema ─────────────────────────────────────────────────────────

export const editCaseSchema = z
  .object({
    caseTitle: z.string().min(1, "عنوان القضية مطلوب"),
    caseType: z.string().optional().default(""),
    caseStatus: z.string().optional().default(""),
    caseDescription: z.string().optional().default(""),
    startDate: z.string().optional().default(""),
    nextSessionDate: z.string().optional().default(""),
    clientName: z.string().min(1, "اسم الموكل مطلوب"),
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
    opponentName: z.string().optional().default(""),
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
    courtName: z.string().min(1, "اسم المحكمة مطلوب"),
    courtHall: z.string().optional().default(""),
    lawyerID: z.string().optional().default(""),
    lawyerName: z.string().optional().default(""),
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
