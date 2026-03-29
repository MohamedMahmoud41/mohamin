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

// ─── Case ────────────────────────────────────────────────────────────────────

export type CaseStatus =
  | "active"
  | "pending"
  | "completed"
  | "closed"
  | "unknown";

export interface Case {
  id: string;
  caseTitle: string;
  caseType: string;
  caseStatus: string; // raw string from DB — use normalizeStatus() to normalize
  caseDescription: string;
  startDate: string;
  nextSessionDate: string | null;
  officeId: string;
  lawyerID: string;
  courtName: string;
  courtHall?: string;
  courtNum?: string;
  /** Client info */
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress?: string;
  clientType?: string;
  /** Opponent info */
  opponentName: string;
  opponentPhone: string;
  opponentEmail?: string;
  opponentAddress?: string;
  opponentType?: string;
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

export interface CaseSession {
  id: string;
  caseId: string;
  sessionDate: string;
  status: SessionStatus;
  decision?: SessionDecision | null;
  notes: string;
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

export interface Court {
  id: string;
  name: string;
  city: string;
  createdAt: string;
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
  caseTitle: string;
  clientName: string;
  courtName: string;
}
