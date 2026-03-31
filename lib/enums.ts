// ─── Enum value maps (DB English → UI Arabic) ────────────────────────────────

export const caseCategoryMap = {
  civil: "مدني",
  criminal: "جنائي",
  personal: "شئون شخصية",
} as const;

export const courtDegreeMap = {
  appeal: "استئناف",
  primary: "ابتدائي",
  partial: "جزئي",
  full: "كلية",
  family: "شئون الاسره",
} as const;

// ─── Enum types (derived from map keys) ──────────────────────────────────────

export type CaseCategory = keyof typeof caseCategoryMap;
export type CourtDegree = keyof typeof courtDegreeMap;

// ─── Helper functions ─────────────────────────────────────────────────────────

export function displayCaseCategory(value: CaseCategory): string {
  return caseCategoryMap[value];
}

export function displayCourtDegree(value: CourtDegree): string {
  return courtDegreeMap[value];
}

// ─── Select options (for dropdowns / form selects) ───────────────────────────

export const caseCategoryOptions = (
  Object.entries(caseCategoryMap) as [CaseCategory, string][]
).map(([value, label]) => ({ value, label }));

export const courtDegreeOptions = (
  Object.entries(courtDegreeMap) as [CourtDegree, string][]
).map(([value, label]) => ({ value, label }));

// ─── Data normalization helpers (use before DB inserts) ───────────────────────

/** Trim + collapse consecutive whitespace */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
