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

export const civilDegreeMap = {
  appeal: "استئناف",
  primary: "ابتدائي",
  partial: "جزئي",
} as const;

export const clientTypeMap = {
  فرد: "فرد",
  شركة: "شركة",
} as const;

export const clientRoleMap = {
  مدعي: "مدعي",
  "مدعى عليه": "مدعى عليه",
  وكيل: "وكيل",
  شاهد: "شاهد",
} as const;

export const opponentRoleMap = {
  مدعي: "مدعي",
  "مدعى عليه": "مدعى عليه",
  وكيل: "وكيل",
  شاهد: "شاهد",
} as const;

// ─── Enum types (derived from map keys) ──────────────────────────────────────

export type CaseCategory = keyof typeof caseCategoryMap;
export type CourtDegree = keyof typeof courtDegreeMap;
export type CivilDegree = keyof typeof civilDegreeMap;
export type ClientType = keyof typeof clientTypeMap;
export type ClientRole = keyof typeof clientRoleMap;
export type OpponentRole = keyof typeof opponentRoleMap;

// ─── Helper functions ─────────────────────────────────────────────────────────

export function displayCaseCategory(value: CaseCategory): string {
  return caseCategoryMap[value];
}

export function displayCourtDegree(value: CourtDegree): string {
  return courtDegreeMap[value];
}

export function displayClientRole(value: string): string {
  return (clientRoleMap as Record<string, string>)[value] ?? value;
}

export function displayOpponentRole(value: string): string {
  return (opponentRoleMap as Record<string, string>)[value] ?? value;
}

// ─── Select options (for dropdowns / form selects) ───────────────────────────

export const caseCategoryOptions = (
  Object.entries(caseCategoryMap) as [CaseCategory, string][]
).map(([value, label]) => ({ value, label }));

export const courtDegreeOptions = (
  Object.entries(courtDegreeMap) as [CourtDegree, string][]
).map(([value, label]) => ({ value, label }));

export const civilDegreeOptions = (
  Object.entries(civilDegreeMap) as [CivilDegree, string][]
).map(([value, label]) => ({ value, label }));

export const clientRoleOptions = (
  Object.entries(clientRoleMap) as [ClientRole, string][]
).map(([value, label]) => ({ value, label }));

export const clientTypeOptions = (
  Object.entries(clientTypeMap) as [ClientType, string][]
).map(([value, label]) => ({ value, label }));

export const opponentRoleOptions = (
  Object.entries(opponentRoleMap) as [OpponentRole, string][]
).map(([value, label]) => ({ value, label }));

// ─── Data normalization helpers (use before DB inserts) ───────────────────────

/** Trim + collapse consecutive whitespace */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
