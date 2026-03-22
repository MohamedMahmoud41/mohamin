# next-app — Next.js 14 Migration

A parallel Next.js 14 project living alongside the original Vite + React app.  
Both projects share the same Git repository; neither references the other's source code.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies (first time only)

```bash
# Old project (root)
npm install

# New project
cd next-app && npm install
```

### Start development servers

From the **root** of the repository:

```bash
# Run only the old Vite app  →  http://localhost:5173
npm run dev:old

# Run only the new Next.js app  →  http://localhost:3001
npm run dev:new

# Run both simultaneously (requires `concurrently` — install once: npm i -D concurrently)
npm run dev:both
```

### Configure Supabase

Copy `next-app/.env.local` and fill in your project credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## Folder Structure

```
next-app/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Public auth pages (login, signup, forgot-password)
│   ├── (dashboard)/        # Protected user pages
│   │   └── settings/       # Settings tabs (profile, notifications, appearance, security)
│   ├── (admin)/            # Admin-only pages
│   ├── globals.css         # Tailwind directives + component utility classes
│   ├── layout.tsx          # Root layout (RTL, Arabic metadata, Toaster)
│   └── not-found.tsx       # 404 page
├── components/             # Shared React components (UI, layout pieces)
├── hooks/
│   ├── useSupabase.ts      # Stable Supabase browser client for Client Components
│   └── useUser.ts          # Current auth user + loading state
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client (Client Components)
│   │   └── server.ts       # Server client (Server Components / Actions)
│   └── utils.ts            # Shared utilities (formatDate, validators, normalizeStatus)
├── services/               # Data-fetching layer (replaces Redux thunks + Firebase calls)
│   ├── auth.ts             # Server Actions: signIn, signUp, resetPassword, signOut
│   ├── cases.ts            # Cases CRUD + notes / sessions / attachments
│   ├── courts.ts           # Courts CRUD
│   ├── lawyers.ts          # Lawyers queries
│   ├── office.ts           # Offices CRUD
│   ├── posts.ts            # Posts CRUD
│   └── users.ts            # User profile + notification settings
├── types/
│   └── index.ts            # TypeScript interfaces for all domain models
├── middleware.ts            # Edge auth guard (replaces ProtectedRoute / AdminProtectedRoute)
├── next.config.js
├── tailwind.config.ts       # Design tokens ported from old project's CSS @theme block
└── .env.local               # Supabase credentials (never commit!)
```

---

## Migration Strategy

### Guiding principle

Migrate **one page at a time**. Users can keep using the old app while the new one is built in parallel. Once a page is fully migrated and tested in the new app, the corresponding old component can be removed.

### Recommended order

| Priority | Page / Feature                   | Notes                                          |
| -------- | -------------------------------- | ---------------------------------------------- |
| 1        | Login / Signup / Forgot Password | Unblocks all other work — auth must work first |
| 2        | Dashboard                        | High-value landing page after login            |
| 3        | Cases list + Case details        | Core feature                                   |
| 4        | Add / Edit Case                  | Wizard; most complex page                      |
| 5        | Office page                      | Simpler read/update                            |
| 6        | Posts                            | Add Supabase Realtime channel for live updates |
| 7        | Lawyers, Reports                 | Lower complexity                               |
| 8        | Settings tabs                    | Profile, notifications, appearance, security   |
| 9        | Admin pages                      | Courts, Lawyers, Owners, Posts management      |

### Key pattern changes

#### State management: Redux → Server Components

Old pattern (Vite + Redux):

```jsx
// Dispatch a thunk, then select from store
dispatch(fetchCases());
const cases = useSelector(selectCases);
```

New pattern (Next.js Server Component):

```tsx
// Fetch directly on the server — no store needed
import { getAllCases } from "@/services/cases";

export default async function CasesPage() {
  const { data: cases, error } = await getAllCases();
  // render cases directly
}
```

For **client-side interactivity** that still needs reactive state, use `useState` / `useReducer` or a lightweight library like Zustand.

#### Auth: Firebase → Supabase Server Actions

Old pattern:

```js
await signInWithEmailAndPassword(auth, email, password);
```

New pattern (Server Action called from a Client Component form):

```ts
// services/auth.ts  ("use server")
const { error } = await supabase.auth.signInWithPassword({ email, password });
```

#### Route guards: React components → Edge Middleware

The old project uses three wrapper components (`ProtectedRoute`, `AdminProtectedRoute`, `PublicRoute`).  
In the new project, a single `middleware.ts` on the Edge handles all redirect logic before any React code runs.

#### Real-time (Firestore `onSnapshot` → Supabase Realtime)

Pages that need live data (e.g. Posts) should add a Supabase channel subscription **inside a Client Component**:

```tsx
"use client";
const supabase = useSupabase();
useEffect(() => {
  const channel = supabase
    .channel("posts")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts" },
      handleChange,
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## Supabase Database Schema (suggested)

| Table              | Key columns                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `users`            | id, email, display_name, role (text[]), office_id, avatar_url, phone, ... |
| `offices`          | id, name, address, phone, logo_url, owner_id, ...                         |
| `cases`            | id, title, status, court_id, office_id, lawyer_id, client_name, ...       |
| `case_notes`       | id, case_id, content, author_id, created_at                               |
| `case_sessions`    | id, case_id, date, location, notes, created_at                            |
| `case_attachments` | id, case_id, file_url, file_name, file_type, created_at                   |
| `lawyers`          | (view over `users` where role @> '{lawyer}')                              |
| `courts`           | id, name                                                                  |
| `posts`            | id, content, author_id, office_id, created_at                             |
| `missions`         | id, title, description, assigned_to, case_id, status, due_date            |

Enable **Row-Level Security (RLS)** on all tables and define policies based on `auth.uid()`.

---

## Tech Stack Comparison

|           | Old project         | New project                |
| --------- | ------------------- | -------------------------- |
| Framework | Vite + React 19     | Next.js 14 (App Router)    |
| Language  | JavaScript (JSX)    | TypeScript (TSX)           |
| Styling   | Tailwind CSS v4     | Tailwind CSS v3            |
| Auth      | Firebase Auth       | Supabase Auth              |
| Database  | Firestore           | Supabase (PostgreSQL)      |
| State     | Redux Toolkit       | Server Components + hooks  |
| Routing   | react-router-dom v6 | Next.js file-based routing |
| Dev port  | 5173                | 3001                       |
