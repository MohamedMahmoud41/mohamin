/**
 * Global TypeScript types for the application
 *
 * Derived from the data shapes used in the old React project's Redux slices
 * and Firestore documents. Adapted for Supabase (snake_case table columns).
 */

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = "lawyer" | "officeOwner" | "admin";

export interface User {
  id: string; // Supabase auth.users id
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole[];
  officeId: string | null;
  specialization: string;
  experience: string;
  bio: string;
  profileImageUrl: string;
  /** Array of case IDs assigned directly to this user */
  privateCasesIds: string[];
  /** Array of case IDs linked through the office */
  officeCasesIds: string[];
  fcmToken?: string;
  isBanned: boolean;
  isTest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  newCases: boolean;
  sessionReminder: boolean;
  caseUpdates: boolean;
  emailNotifications: boolean;
}

// ─── Office ──────────────────────────────────────────────────────────────────

export interface Office {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  ownerId: string;
  membersIds: string[];
  casesIds: string[];
  createdAt: string;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  officeId: string;
  name: string;
  type: "individual" | "company";
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Case ────────────────────────────────────────────────────────────────────

export type CaseStatus =
  | "active"
  | "pending"
  | "completed"
  | "closed"
  | "unknown";

export interface CaseNumber {
  caseNumber: string;
  caseYear: string;
}

export interface Case {
  id: string;
  caseTitle: string;
  caseCategory: CaseCategory;
  caseType: string;
  caseStatus: string; // raw string from DB — use normalizeStatus() to normalize
  caseDescription: string;
  startDate: string;
  nextSessionDate: string | null;
  officeId: string;
  lawyerID: string;
  /** All assigned lawyer IDs (from case_lawyers junction table) */
  lawyerIDs: string[];
  /** Reference to clients table */
  clientId?: string;
  /** Composite case numbers (max 5) */
  caseNumbers: CaseNumber[];
  /** Civil-specific fields */
  civilDegree?: string;
  courtId?: string;
  courtName: string;
  caseTypeId?: string;
  /** Criminal-specific fields */
  courtDivisionId?: string;
  governorateId?: string;
  policeStationId?: string;
  partialProsecutionId?: string;
  /** Personal-specific fields */
  personalServiceTypeId?: string;
  personalCourtDivisionId?: string;
  familyCourtId?: string;
  personalPartialProsecutionId?: string;
  /** Deprecated — kept for backward compat */
  courtHall?: string;
  courtNum?: string;
  /** Client info */
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress?: string;
  clientType?: string;
  clientNationalId?: string;
  clientRole?: string;
  /** Opponent info */
  opponentName: string;
  opponentPhone: string;
  opponentEmail?: string;
  opponentAddress?: string;
  opponentType?: string;
  opponentNationalId?: string;
  opponentRole?: string;
  /** Related IDs */
  casesNotes?: CaseNote[];
  caseSessions?: CaseSession[];
  caseAttachments?: CaseAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  noteTitle: string;
  notes: string;
  noteOwner: string;
  noteDate: string;
  createdAt: string;
}

export type SessionStatus = "upcoming" | "held";
export type SessionDecision = "adjourned" | "judgment_reserved" | "judged";
export type SessionCategory = "normal" | "appeal" | "cassation";

export interface CaseSession {
  id: string;
  caseId: string;
  sessionDate: string;
  status: SessionStatus;
  decision?: SessionDecision | null;
  category: SessionCategory;
  isMandatory: boolean;
  notes: string;
  createdAt: string;
}

export interface SessionAttachment {
  id: string;
  sessionId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface CaseAttachment {
  id: string;
  caseId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

// ─── Case Report (محاضر المحكمة) ─────────────────────────────────────────────

export interface CaseReport {
  id: string;
  caseId: string;
  documentType: string;
  documentNumber: string;
  deliveryDate: string | null;
  receiverName: string;
  courtId: string | null;
  bailiffOffice: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Lawyer ──────────────────────────────────────────────────────────────────

export interface Lawyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  officeId: string | null;
  officeCasesIds: string[];
  profileImageUrl: string;
  createdAt: string;
}

// ─── Court ───────────────────────────────────────────────────────────────────

export type CourtDegree = "appeal" | "primary" | "partial" | "full" | "family";
export type CaseCategory = "civil" | "criminal" | "personal";

export interface Governorate {
  id: string;
  name: string;
  code?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Court {
  id: string;
  name: string;
  governorateId: string | null;
  courtDegree: CourtDegree | null;
  address: string;
  locationUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourtDivision {
  id: string;
  name: string;
  category: CaseCategory;
  createdAt: string;
  updatedAt: string;
}

export interface PartialProsecution {
  id: string;
  name: string;
  courtId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  governorateId: string | null;
  address: string;
  locationUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseType {
  id: string;
  name: string;
  category: CaseCategory;
  courtIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Post ────────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  postTitle: string;
  postContent: string;
  postOfficeName: string;
  officeId: string;
  authorId: string;
  postTime: string;
  createdAt: string;
}

// ─── Mission ─────────────────────────────────────────────────────────────────

export interface Mission {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  assignedTo: string | null;
  contextType: "user" | "office";
  contextId: string;
  dueDate?: string;
  createdAt: string;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ─── Dashboard session (enriched, used on dashboard) ─────────────────────────

export interface DashboardSession {
  sessionId: string;
  caseId: string;
  sessionDate: string;
  /** Raw status from DB – use getSessionDisplayStatus() to derive "overdue" */
  status: SessionStatus;
  category: SessionCategory;
  isMandatory: boolean;
  caseTitle: string;
  clientName: string;
  courtName: string;
}

// ─── Case-Lawyer junction (from case_lawyers table) ─────────────────────────

export interface CaseLawyer {
  caseId: string;
  lawyerId: string;
  assignedAt: string;
}
