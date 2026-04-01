/**
 * Utility helpers — shared across the Next.js app
 *
 * Mirrors utilities from the old React project:
 *   src/utils/formatDate.js
 *   src/utils/validation.js
 *   src/utils/normalizeCase.js
 */

// ─── Date Formatting ────────────────────────────────────────────────────────

/** Format a date as a localized Arabic date-time string */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format a date as a relative human-readable string (e.g., "منذ 3 دقائق") */
export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "غير معروف";
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "منذ لحظات";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `منذ ${diffInDays} يوم`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `منذ ${diffInMonths} شهر`;
  return `منذ ${Math.floor(diffInDays / 365)} سنة`;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Validate email format */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate Egyptian phone number
 * Rules: exactly 11 digits, starts with 01
 */
export function validateEgyptianPhone(phone: string): boolean {
  return /^01[0-9]{9}$/.test(phone);
}

/**
 * Validate password strength
 * Rules: min 8 chars, uppercase, lowercase, digit, special character
 */
export function validatePassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    password,
  );
}

// ─── Case Status Normalization ───────────────────────────────────────────────

/**
 * Normalize Arabic/English case status strings to a canonical value.
 * Mirrors src/utils/normalizeCase.js from the old project.
 */
export type NormalizedStatus =
  | "active"
  | "pending"
  | "completed"
  | "closed"
  | "unknown";

export function normalizeStatus(status: string | undefined): NormalizedStatus {
  const value = status?.toString().trim().toLowerCase() ?? "";

  if (
    ["نشطه", "نشطة", "active", "runing", "running", "جارية", "جاري"].includes(
      value,
    )
  )
    return "active";

  if (["قيد الانتظار", "pending", "انتظار", "قيد الإنتظار"].includes(value))
    return "pending";

  if (
    [
      "مكتملة",
      "completed",
      "won",
      "مكسوبة",
      "مكسوبه",
      "منتهية لصالح الموكل",
    ].includes(value)
  )
    return "completed";

  if (["closed", "مغلقة"].includes(value)) return "closed";

  return "unknown";
}
