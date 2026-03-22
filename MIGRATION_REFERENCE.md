# Migration Reference: lawyer-main → mohamin

> **Purpose**: This document is the single source of truth for migrating components from the old React/Firebase project (`lawyer-main`) to the new Next.js 16 / Supabase project (`mohamin`). Read this before touching any component.

---

## Table of Contents

1. [Project Comparison](#1-project-comparison)
2. [Migration Checklist](#2-migration-checklist)
3. [Server vs Client Components](#3-server-vs-client-components)
4. [Routing: React Router → Next.js App Router](#4-routing-react-router--nextjs-app-router)
5. [Firebase → Supabase Mapping](#5-firebase--supabase-mapping)
6. [State Management: Redux → Server Actions & Hooks](#6-state-management-redux--server-actions--hooks)
7. [Auth Patterns](#7-auth-patterns)
8. [Styling & Color System](#8-styling--color-system)
9. [i18n / RTL Handling](#9-i18n--rtl-handling)
10. [Component-by-Component Migration Map](#10-component-by-component-migration-map)
11. [Code Snippets & Patterns](#11-code-snippets--patterns)
12. [Do's and Don'ts](#12-dos-and-donts)

---

## 1. Project Comparison

| Aspect                 | lawyer-main (Old)         | mohamin (New)                    |
| ---------------------- | ------------------------- | -------------------------------- |
| **Framework**          | React 19 + Vite           | Next.js 16 (App Router)          |
| **Language**           | JavaScript (.jsx)         | TypeScript (.tsx)                |
| **Routing**            | React Router v6           | Next.js App Router (file-based)  |
| **Backend/DB**         | Firebase (Firestore)      | Supabase (PostgreSQL)            |
| **Auth**               | Firebase Auth             | Supabase Auth (SSR)              |
| **File Storage**       | Firebase Storage          | Supabase Storage _(TBD)_         |
| **Push Notifications** | Firebase Cloud Messaging  | _(Not yet implemented)_          |
| **State Management**   | Redux Toolkit             | Server Actions + `useUser` hook  |
| **CSS**                | Tailwind CSS v4 (utility) | Tailwind CSS v3 (utility)        |
| **Icons**              | lucide-react              | lucide-react _(same)_            |
| **Toasts**             | react-hot-toast           | react-hot-toast _(same)_         |
| **Charts**             | recharts                  | _(not yet added)_                |
| **i18n**               | i18next (AR/EN, RTL)      | _(not yet added — hardcoded AR)_ |
| **Dev Port**           | 5173                      | 3001                             |

---

## 2. Migration Checklist

### Pages

| Old Page        | Old Path                                      | New Route                                      | Status     |
| --------------- | --------------------------------------------- | ---------------------------------------------- | ---------- |
| Landing         | `pages/Landing/LandingPage.jsx`               | `app/page.tsx`                                 | ⬜ Pending |
| Login           | `pages/login/SignInPage.jsx`                  | `app/(auth)/login/page.tsx`                    | ⬜ Pending |
| Signup          | `pages/signup/Signup.jsx`                     | `app/(auth)/signup/page.tsx`                   | ⬜ Pending |
| Forgot Password | `pages/ForgotPassword/ForgotPasswordPage.jsx` | `app/(auth)/forgot-password/page.tsx`          | ⬜ Pending |
| Owner Dashboard | `pages/Dashboard/OwnerDashboard.jsx`          | `app/(dashboard)/dashboard/page.tsx`           | ⬜ Pending |
| Cases List      | `pages/Cases/CasesManage.jsx`                 | `app/(dashboard)/cases/page.tsx`               | ⬜ Pending |
| Add Case        | `pages/AddCase/AddCasePage.jsx`               | `app/(dashboard)/cases/new/page.tsx`           | ⬜ Pending |
| Edit Case       | `pages/EditCase/EditCasePage.jsx`             | `app/(dashboard)/cases/[caseId]/edit/page.tsx` | ⬜ Pending |
| Case Details    | `pages/CaseDetails/CaseLayout.jsx`            | `app/(dashboard)/cases/[caseId]/page.tsx`      | ⬜ Pending |
| Office          | `pages/Office/OfficePage.jsx`                 | `app/(dashboard)/office/page.tsx`              | ⬜ Pending |
| Office Setup    | `pages/OfficeSetup/OfficeSetupPage.jsx`       | `app/(dashboard)/office-setup/page.tsx`        | ⬜ Pending |
| Posts           | `pages/Posts/PostsPage.jsx`                   | `app/(dashboard)/posts/page.tsx`               | ⬜ Pending |
| All Lawyers     | `pages/Lawyers/AllLawyers.jsx`                | `app/(dashboard)/lawyers/page.tsx`             | ⬜ Pending |
| Reports         | `pages/reports/Reports.jsx`                   | `app/(dashboard)/reports/page.tsx`             | ⬜ Pending |
| Settings        | `pages/Settings/SettingsPage.jsx`             | `app/(dashboard)/settings/page.tsx`            | ⬜ Pending |
| Today Missions  | `pages/Missions/TodayMissions.jsx`            | `app/(dashboard)/missions/page.tsx`            | ⬜ Pending |
| Admin Dashboard | `pages/Admin/Dashboard/Dashboard.jsx`         | `app/(admin)/admin/dashboard/page.tsx`         | ⬜ Pending |
| Admin Courts    | `pages/Admin/Courts/CourtsPage.jsx`           | `app/(admin)/admin/courts/page.tsx`            | ⬜ Pending |
| Admin Lawyers   | `pages/Admin/Lawyers/LawyerList.jsx`          | `app/(admin)/admin/lawyers/page.tsx`           | ⬜ Pending |
| Admin Owners    | `pages/Admin/Owners/Owner.jsx`                | `app/(admin)/admin/owners/page.tsx`            | ⬜ Pending |
| Admin Posts     | `pages/Admin/Posts/PostsPage.jsx`             | `app/(admin)/admin/posts/page.tsx`             | ⬜ Pending |

### Components

| Old Component      | Location                          | New Location                          | Status     |
| ------------------ | --------------------------------- | ------------------------------------- | ---------- |
| Header             | `components/Common/Header.jsx`    | `components/layout/Header.tsx`        | ⬜ Pending |
| Sidebar            | `components/Common/Sidebar.jsx`   | `components/layout/Sidebar.tsx`       | ⬜ Pending |
| Notification Modal | `components/Common/notification/` | `components/common/Notifications.tsx` | ⬜ Pending |
| Loader             | `components/UI/Loader.jsx`        | `components/ui/Loader.tsx`            | ⬜ Pending |
| ConfirmDialog      | `components/UI/ConfirmDialog.jsx` | `components/ui/ConfirmDialog.tsx`     | ⬜ Pending |

---

## 3. Server vs Client Components

**Default in Next.js App Router**: Every component is a **Server Component** unless marked `"use client"`.

### Decision Guide

| Use **Server Component** (default) | Use **"use client"**                               |
| ---------------------------------- | -------------------------------------------------- |
| Data fetching from Supabase        | `useState` / `useReducer`                          |
| Static layout/page structure       | `useEffect`                                        |
| SEO metadata                       | Event handlers (`onClick`, `onChange`, `onSubmit`) |
| No browser APIs needed             | Hooks (`useUser`, `useSupabase`)                   |
| Displaying data passed as props    | Browser APIs (`localStorage`, `window`)            |
|                                    | Real-time subscriptions                            |
|                                    | `react-hot-toast`                                  |
|                                    | File input, form with client validation            |

### Pattern: Data Fetching in Server Component, Interaction in Client

```tsx
// app/(dashboard)/cases/page.tsx  ← SERVER COMPONENT (no "use client")
import { getCasesByIds } from "@/services/cases";
import CasesTable from "@/components/cases/CasesTable"; // client component

export default async function CasesPage() {
  const { data: cases, error } = await getCasesByIds([...]);
  if (error) return <p>Error loading cases</p>;
  return <CasesTable cases={cases ?? []} />;
}
```

```tsx
// components/cases/CasesTable.tsx  ← CLIENT COMPONENT
"use client";

import { useState } from "react";
import type { Case } from "@/types";

export default function CasesTable({ cases }: { cases: Case[] }) {
  const [search, setSearch] = useState("");
  // ...filtering, sorting, UI interactions
}
```

---

## 4. Routing: React Router → Next.js App Router

### Route Mapping

| Concept          | React Router v6          | Next.js App Router                         |
| ---------------- | ------------------------ | ------------------------------------------ |
| Link navigation  | `<Link to="/dashboard">` | `<Link href="/dashboard">`                 |
| Programmatic nav | `useNavigate()`          | `useRouter()` from `next/navigation`       |
| Route params     | `useParams()`            | `useParams()` from `next/navigation`       |
| Search params    | `useSearchParams()`      | `useSearchParams()` from `next/navigation` |
| Nested layout    | `<Outlet />`             | `layout.tsx` + `{children}`                |
| Index route      | `index: true`            | `page.tsx` inside folder                   |
| Protected route  | Wrapper component        | Middleware or layout check                 |

### Before (React Router)

```jsx
// lawyer-main
import { useNavigate, useParams, Link } from "react-router-dom";

function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <Link to="/cases">Back to Cases</Link>
      <button onClick={() => navigate(`/case/${caseId}/edit`)}>Edit</button>
    </div>
  );
}
```

### After (Next.js App Router)

```tsx
// mohamin
"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const router = useRouter();

  return (
    <div>
      <Link href="/cases">Back to Cases</Link>
      <button onClick={() => router.push(`/cases/${caseId}/edit`)}>Edit</button>
    </div>
  );
}
```

### Route Equivalence Table

| Old URL              | New URL                |
| -------------------- | ---------------------- |
| `/`                  | `/`                    |
| `/login`             | `/login`               |
| `/signup`            | `/signup`              |
| `/forgot`            | `/forgot-password`     |
| `/office-setup`      | `/office-setup`        |
| `/dashboard`         | `/dashboard`           |
| `/cases`             | `/cases`               |
| `/addcase`           | `/cases/new`           |
| `/case/:caseId`      | `/cases/[caseId]`      |
| `/case/:caseId/edit` | `/cases/[caseId]/edit` |
| `/settings`          | `/settings`            |
| `/admin/dashboard`   | `/admin/dashboard`     |
| `/admin/courts`      | `/admin/courts`        |
| `/admin/lawyers`     | `/admin/lawyers`       |
| `/admin/owners`      | `/admin/owners`        |
| `/admin/posts`       | `/admin/posts`         |

---

## 5. Firebase → Supabase Mapping

### Authentication

| Firebase                                                | Supabase                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `createUserWithEmailAndPassword(auth, email, password)` | `supabase.auth.signUp({ email, password, options: { data: {...} } })` |
| `signInWithEmailAndPassword(auth, email, password)`     | `supabase.auth.signInWithPassword({ email, password })`               |
| `sendPasswordResetEmail(auth, email)`                   | `supabase.auth.resetPasswordForEmail(email, { redirectTo })`          |
| `signOut(auth)`                                         | `supabase.auth.signOut()`                                             |
| `onAuthStateChanged(auth, callback)`                    | `supabase.auth.onAuthStateChange((event, session) => {...})`          |
| `auth.currentUser`                                      | `(await supabase.auth.getUser()).data.user`                           |
| `updatePassword(user, newPassword)`                     | `supabase.auth.updateUser({ password: newPassword })`                 |

### Firestore → Supabase (PostgreSQL)

| Firebase Firestore                                         | Supabase                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| `collection("users")`                                      | `supabase.from("users")`                                 |
| `doc("users", uid)`                                        | `.eq("id", uid)`                                         |
| `getDoc(ref)`                                              | `.select("*").single()`                                  |
| `getDocs(query)`                                           | `.select("*")`                                           |
| `setDoc(ref, data)`                                        | `.insert(data)` or `.upsert(data)`                       |
| `updateDoc(ref, data)`                                     | `.update(data).eq("id", id)`                             |
| `deleteDoc(ref)`                                           | `.delete().eq("id", id)`                                 |
| `where("field", "==", value)`                              | `.eq("field", value)`                                    |
| `where("field", "in", array)`                              | `.in("field", array)`                                    |
| `orderBy("createdAt", "desc")`                             | `.order("created_at", { ascending: false })`             |
| `serverTimestamp()`                                        | `new Date().toISOString()` or SQL `now()`                |
| Sub-collection `users/{uid}/notificationSettings/settings` | Separate `notification_settings` table with `user_id` FK |

### Firestore Collection → Supabase Table Map

| Firestore Collection                        | Supabase Table          | Notes                         |
| ------------------------------------------- | ----------------------- | ----------------------------- |
| `users`                                     | `users`                 | Field names become snake_case |
| `offices`                                   | `offices`               | Same structure                |
| `cases`                                     | `cases`                 |                               |
| `case_notes` _(sub-collection)_             | `case_notes`            | Flat table with `case_id` FK  |
| `case_sessions` _(sub-collection)_          | `case_sessions`         | Flat table with `case_id` FK  |
| `case_attachments` _(sub-collection)_       | `case_attachments`      | Flat table with `case_id` FK  |
| `courts`                                    | `courts`                |                               |
| `posts`                                     | `posts`                 |                               |
| `notifications`                             | _(not yet implemented)_ |                               |
| `users/{uid}/notificationSettings/settings` | `notification_settings` | user_id FK                    |
| `missions`                                  | _(not yet implemented)_ |                               |

### Field Naming: camelCase → snake_case

| Old (Firestore)   | New (Supabase)      |
| ----------------- | ------------------- |
| `caseTitle`       | `case_title`        |
| `caseStatus`      | `case_status`       |
| `clientName`      | `client_name`       |
| `officeId`        | `office_id`         |
| `lawyerID`        | `lawyer_id`         |
| `nextSessionDate` | `next_session_date` |
| `createdAt`       | `created_at`        |
| `privateCasesIds` | `private_cases_ids` |
| `officeCasesIds`  | `office_cases_ids`  |
| `profileImageUrl` | `profile_image_url` |
| `postTitle`       | `post_title`        |
| `postContent`     | `post_content`      |
| `firstName`       | `first_name`        |
| `lastName`        | `last_name`         |

### Firebase Storage → Supabase Storage

| Firebase Storage                | Supabase Storage                                |
| ------------------------------- | ----------------------------------------------- |
| `getStorage(app)`               | `supabase.storage`                              |
| `ref(storage, 'path/file.jpg')` | `supabase.storage.from('bucket-name')`          |
| `uploadBytes(ref, file)`        | `.upload('path/file.jpg', file)`                |
| `getDownloadURL(ref)`           | `.getPublicUrl('path/file.jpg').data.publicUrl` |
| `deleteObject(ref)`             | `.remove(['path/file.jpg'])`                    |

---

## 6. State Management: Redux → Server Actions & Hooks

The mohamin project does **not use Redux**. Data flow is:

- **Read data**: Server Component fetches from Supabase directly via `services/*`
- **Write data**: Client Component calls a **Server Action** (function with `"use server"`)
- **Auth state**: `useUser()` hook provides current user on client side
- **UI state**: Local `useState` only — no global store

### Before (Redux Slice)

```jsx
// lawyer-main: cases page
import { useDispatch, useSelector } from "react-redux";
import { fetchCasesByIds } from "@/Store/Slices/casesSlice";

function CasesPage() {
  const dispatch = useDispatch();
  const { cases, loading, error } = useSelector((s) => s.cases);

  useEffect(() => {
    dispatch(fetchCasesByIds(user.office_cases_ids));
  }, []);
  // ...
}
```

### After (Server Component + Service)

```tsx
// mohamin: app/(dashboard)/cases/page.tsx
import { getCasesByIds } from "@/services/cases";

export default async function CasesPage() {
  const { data: cases, error } = await getCasesByIds([
    /* ids from session */
  ]);
  // ...
  return <CasesTable cases={cases ?? []} />;
}
```

### After (Server Action for mutations)

```tsx
// mohamin: components/cases/DeleteCaseButton.tsx
"use client";
import { deleteCase } from "@/services/cases";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeleteCaseButton({ caseId }: { caseId: string }) {
  const router = useRouter();

  async function handleDelete() {
    const { error } = await deleteCase(caseId);
    if (error) {
      toast.error("فشل الحذف");
      return;
    }
    toast.success("تم الحذف");
    router.refresh();
  }

  return <button onClick={handleDelete}>حذف</button>;
}
```

### Redux Slice → Service Function Map

| Redux Thunk          | Service Function                                 |
| -------------------- | ------------------------------------------------ |
| `fetchUser`          | `services/users.ts → getCurrentUser()`           |
| `saveUser`           | `services/users.ts → updateUserProfile()`        |
| `uploadProfileImage` | `services/users.ts` _(TBD)_                      |
| `fetchNotification`  | `services/users.ts → getNotificationSettings()`  |
| `saveNotification`   | `services/users.ts → saveNotificationSettings()` |
| `changePassword`     | `services/auth.ts → changePassword()`            |
| `logout`             | `services/auth.ts → signOut()`                   |
| `fetchCasesByIds`    | `services/cases.ts → getCasesByIds()`            |
| `addCase`            | `services/cases.ts` _(TBD)_                      |
| `updateCase`         | `services/cases.ts` _(TBD)_                      |
| `deleteCase`         | `services/cases.ts` _(TBD)_                      |
| `fetchCourts`        | `services/courts.ts → getCourts()`               |
| `fetchLawyers`       | `services/lawyers.ts → getAllLawyers()`          |
| `fetchPosts`         | `services/posts.ts → getAllPosts()`              |
| `fetchOffice`        | `services/office.ts → getOfficeById()`           |

---

## 7. Auth Patterns

### Getting the Current User

**In Server Components / Server Actions:**

```typescript
// lib/supabase/server.ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) redirect("/login");
```

**In Client Components:**

```tsx
"use client";
import { useUser } from "@/hooks/useUser";

export default function ProfileButton() {
  const { user, loading } = useUser();
  if (loading) return <Loader />;
  if (!user) return null;
  return <span>{user.email}</span>;
}
```

### Protected Routes

In mohamin, protection is done **inside the layout** (not a wrapper component):

```tsx
// app/(dashboard)/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <div className="flex min-h-screen">{/* sidebar + header + children */}</div>
  );
}
```

### Admin Route Protection

```tsx
// app/(admin)/layout.tsx
const { data: profile } = await supabase
  .from("users")
  .select("role")
  .eq("id", user.id)
  .single();
if (!profile?.role?.includes("admin")) redirect("/dashboard");
```

---

## 8. Styling & Color System

Both projects share the **same color palette**. Use Tailwind utility classes only — no CSS modules, no inline styles.

### Color Tokens

| Token           | Hex       | Tailwind Class Examples                        |
| --------------- | --------- | ---------------------------------------------- |
| Primary (brown) | `#6b4423` | `bg-primary`, `text-primary`, `border-primary` |
| Primary Dark    | `#4a2f19` | `bg-primary-dark`                              |
| Primary Light   | `#8b6239` | `bg-primary-light`                             |
| Secondary       | `#9c7856` | `bg-secondary`, `text-secondary`               |
| Accent (gold)   | `#c9a76b` | `bg-accent`, `text-accent`                     |
| Beige           | `#e8dcc8` | `bg-beige`, `hover:bg-beige`                   |
| Background      | `#fdfbf8` | `bg-background`                                |
| Surface         | `#ffffff` | `bg-surface`                                   |
| Surface Hover   | `#f9f6f2` | `hover:bg-surface-hover`                       |
| Text Primary    | `#2c1810` | `text-text-primary`                            |
| Text Secondary  | `#6b4423` | `text-text-secondary`                          |
| Text Muted      | `#8b7865` | `text-text-muted`                              |
| Border          | `#e8dcc8` | `border-border`                                |
| Divider         | `#f0e6d6` | `border-divider`                               |
| Success         | `#5a8b5f` | `bg-success`, `text-success`                   |
| Warning         | `#d4a24d` | `bg-warning`, `text-warning`                   |
| Error           | `#b85c4f` | `bg-error`, `text-error`                       |
| Info            | `#6b7fa8` | `bg-info`, `text-info`                         |

### Shadow Classes

```
shadow-sm  → 0 1px 3px rgba(107, 68, 35, 0.08)
shadow-md  → 0 4px 12px rgba(107, 68, 35, 0.12)
shadow-lg  → 0 8px 24px rgba(107, 68, 35, 0.16)
```

### Border Radius Classes

```
rounded-sm  → 8px
rounded-md  → 12px
rounded-lg  → 16px
rounded-xl  → 24px
```

### Common Layout Patterns

```tsx
// Card
<div className="bg-surface rounded-md shadow-sm border border-border p-6">

// Page Container
<div className="p-8 min-h-screen bg-background">

// Section Header
<h1 className="text-2xl font-bold text-text-primary">...</h1>

// Muted Label
<p className="text-sm text-text-muted">...</p>

// Primary Button
<button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-sm font-medium transition-colors">

// Secondary Button
<button className="border border-border text-text-secondary hover:bg-beige px-4 py-2 rounded-sm transition-colors">

// Active nav item (sidebar)
<a className="bg-primary text-white px-4 py-3 rounded-sm">

// Inactive nav item (sidebar)
<a className="text-text-secondary hover:bg-beige px-4 py-3 rounded-sm">

// Status Badges
<span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full">نشط</span>
<span className="bg-warning/10 text-warning text-xs px-2 py-1 rounded-full">معلق</span>
<span className="bg-error/10 text-error text-xs px-2 py-1 rounded-full">مغلق</span>
```

---

## 9. i18n / RTL Handling

The mohamin project currently:

- Sets `lang="ar"` and `dir="rtl"` in `app/layout.tsx` statically
- Does **not** have i18next set up yet
- All text is **hardcoded in Arabic**

### Rules While Migrating

1. **Write all UI text in Arabic** (default language)
2. **Do not add i18n setup** unless specifically asked
3. For direction-sensitive classes, use `rtl:` and `ltr:` Tailwind variants:
   ```tsx
   <div className="pr-4 rtl:pr-0 rtl:pl-4">
   ```
4. For icons that need to flip (arrows), use:
   ```tsx
   <ChevronRight className="rtl:rotate-180" />
   ```

---

## 10. Component-by-Component Migration Map

### Header Component

| Old                                      | New                                |
| ---------------------------------------- | ---------------------------------- |
| `components/Common/Header.jsx`           | `components/layout/Header.tsx`     |
| `useDispatch`, `useSelector` for user    | `useUser()` hook                   |
| `onAuthStateChanged` for auth            | `useUser()` hook                   |
| `localStorage` theme → `data-theme` attr | Same pattern (Client Component)    |
| `useNavigate()`                          | `useRouter()` from next/navigation |
| `<Link to="...">`                        | `<Link href="...">` from next/link |
| Firebase notification                    | _(stub/placeholder)_               |

**Decision: `"use client"`** — uses state, localStorage, event handlers.

---

### Sidebar Component

| Old                             | New                                              |
| ------------------------------- | ------------------------------------------------ |
| `components/Common/Sidebar.jsx` | `components/layout/Sidebar.tsx`                  |
| `useSelector` for user role     | Props from parent (Server Component passes role) |
| `<NavLink>` from react-router   | `usePathname()` + `<Link href>` for active state |
| Role-based menu items           | Same (pass `role` as prop)                       |

**Decision: `"use client"`** — needs `usePathname()` for active link detection.

---

### Loader Component

```tsx
// components/ui/Loader.tsx
export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-10 h-10 border-4 border-beige border-t-primary rounded-full animate-spin" />
    </div>
  );
}
```

**Decision: Server Component** — no interactivity needed.

---

### ConfirmDialog Component

**Decision: `"use client"`** — modal state, button events.

```tsx
"use client";
// components/ui/ConfirmDialog.tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

### Settings Page (Tabs)

Old tabs: Profile, Notifications, Appearance, Security

**Decision**: Parent page is Server Component. Each tab is a Client Component.

```
app/(dashboard)/settings/page.tsx          ← Server (fetches user profile)
components/settings/SettingsTabs.tsx       ← Client (tab switching state)
components/settings/ProfileTab.tsx         ← Client (form, image upload)
components/settings/NotificationsTab.tsx   ← Client (toggles)
components/settings/SecurityTab.tsx        ← Client (password form)
components/settings/AppearanceTab.tsx      ← Client (theme toggle)
```

---

### Case Details (Nested Tabs)

Old: `CaseLayout.jsx` with `Outlet` → CaseDetails, Notes, Documents

New: Use Next.js nested layouts or tab state:

```
app/(dashboard)/cases/[caseId]/page.tsx     ← Server Component (fetch case)
components/cases/CaseTabs.tsx               ← Client (tab switching)
components/cases/CaseDetailsTab.tsx         ← Client
components/cases/CaseNotesTab.tsx           ← Client
components/cases/CaseDocumentsTab.tsx       ← Client
```

---

### Add Case (Multi-Step Form)

Old: Steps 1–4 as child routes with `<Outlet>`

New: Single page with local state for current step (no router involvement):

```
app/(dashboard)/cases/new/page.tsx          ← Client Component (step state)
components/cases/add/Step1.tsx              ← Client
components/cases/add/Step2.tsx              ← Client
components/cases/add/Step3.tsx              ← Client
components/cases/add/Step4.tsx              ← Client
```

---

## 11. Code Snippets & Patterns

### Fetching Data in Server Component

```tsx
// app/(dashboard)/lawyers/page.tsx
import { getAllLawyers } from "@/services/lawyers";
import LawyersGrid from "@/components/lawyers/LawyersGrid";

export default async function LawyersPage() {
  const { data: lawyers, error } = await getAllLawyers();

  if (error) {
    return <p className="text-error p-8">{error}</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">المحامون</h1>
      <LawyersGrid lawyers={lawyers ?? []} />
    </div>
  );
}
```

### Form with Server Action

```tsx
"use client";
// components/cases/AddCaseForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddCaseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Call service function (marked "use server" internally)
    const { error } = await createCase({
      caseTitle: formData.get("caseTitle") as string,
      // ...
    });

    if (error) {
      toast.error("فشل إضافة القضية");
    } else {
      toast.success("تم إضافة القضية");
      router.push("/cases");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="caseTitle"
        placeholder="عنوان القضية"
        className="w-full border border-border rounded-sm px-4 py-2 bg-surface text-text-primary focus:outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-sm disabled:opacity-50 transition-colors"
      >
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
```

### Real-time Subscriptions (Replace Firebase onSnapshot)

```tsx
"use client";
// Use useSupabase() hook for real-time
import { useSupabase } from "@/hooks/useSupabase";
import { useEffect, useState } from "react";
import type { Post } from "@/types";

export default function PostsFeed({ initial }: { initial: Post[] }) {
  const supabase = useSupabase();
  const [posts, setPosts] = useState(initial);

  useEffect(() => {
    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          // handle INSERT / UPDATE / DELETE
          if (payload.eventType === "INSERT") {
            setPosts((prev) => [payload.new as Post, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
```

### Replacing firebase.storage Upload

```tsx
"use client";
import { useSupabase } from "@/hooks/useSupabase";

async function uploadFile(file: File, userId: string) {
  const supabase = useSupabase(); // inside component
  const ext = file.name.split(".").pop();
  const path = `profiles/${userId}.${ext}`;

  const { error } = await supabase.storage
    .from("avatars") // bucket name
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
```

### `useUser()` Hook Usage

```tsx
"use client";
import { useUser } from "@/hooks/useUser";
import Loader from "@/components/ui/Loader";

export default function UserGreeting() {
  const { user, loading } = useUser();

  if (loading) return <Loader />;
  if (!user) return null;

  return <p className="text-text-primary">مرحباً، {user.email}</p>;
}
```

---

## 12. Do's and Don'ts

### ✅ DO

- **Always add `"use client"` when** using any hook, event handler, or browser API
- **Use TypeScript** — write `.tsx` files, use types from `types/index.ts`
- **Use Tailwind color tokens** — `bg-primary`, `text-text-muted`, etc. (not raw hex)
- **Fetch data in Server Components** by default — pass data as props to Client Components
- **Use `router.refresh()`** after mutations to revalidate server data
- **Write Arabic text** for all UI labels (current project is AR-first)
- **Import types** with `import type { ... }` syntax
- **Use `useSupabase()`** hook for real-time subscriptions (browser client)
- **Use `lib/supabase/server.ts`** for server-side data fetching

### ❌ DON'T

- Don't import from `firebase/*` — replace with `@/services/*` or `@/lib/supabase/*`
- Don't import from `react-router-dom` — use `next/navigation` and `next/link`
- Don't use Redux `useDispatch` / `useSelector` — no Redux in mohamin
- Don't use `useNavigate` — use `useRouter()` from `next/navigation`
- Don't add `"use client"` to pages that only fetch data (keep them Server Components)
- Don't use hardcoded colors like `#6b4423` — use Tailwind tokens
- Don't use CSS modules or inline `style={{}}` unless absolutely necessary
- Don't copy Firebase config or credentials into this project
- Don't add recharts without installing it first (`npm install recharts`)

---

## Appendix: Existing Services Reference

```typescript
// services/auth.ts
signIn(email, password);
signUp(email, password, metadata);
resetPassword(email);
signOut();
changePassword(newPassword);
getSession();

// services/users.ts
getCurrentUser();
updateUserProfile(userId, updates);
getNotificationSettings(userId);
saveNotificationSettings(userId, settings);

// services/cases.ts
getCaseById(caseId);
getCasesByIds(ids);
getAllCases();
getCaseNotes(caseId);
getCaseSessions(caseId);
getCaseAttachments(caseId);

// services/lawyers.ts
getAllLawyers();
getLawyersByOffice(officeId);

// services/courts.ts
getCourts();
addCourt(name);
updateCourt(id, payload);
deleteCourt(id);

// services/office.ts
getOfficeById(id);
getAllOffices();
createOffice(payload);
updateOffice(id, payload);

// services/posts.ts
getAllPosts();
getPostById(id);
createPost(payload);
deletePost(id);
```

---

_Last updated: March 22, 2026_  
_Source: lawyer-main (React 19 + Firebase) → mohamin (Next.js 16 + Supabase)_
