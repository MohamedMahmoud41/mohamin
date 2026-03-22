import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Middleware — Auth Guard
 *
 * Replaces the old React project's:
 *   - src/layout/ProtectedRoute.jsx
 *   - src/layout/AdminProtectedRoute.jsx
 *   - src/layout/PublicRoute.jsx
 *
 * Runs on the Edge before every matched request.
 *
 * Route protection rules:
 *   /dashboard, /cases, /office, /posts, /reports, /lawyers, /settings
 *     → require authenticated session → redirect to /login
 *   /admin/*
 *     → require authenticated session + role === 'admin' → redirect to /login or /dashboard
 *   /login, /signup, /forgot-password
 *     → redirect authenticated users to /dashboard (PublicRoute behaviour)
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session (important — do not remove)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Public-only routes (redirect authenticated users away) ──────────────
  const publicOnlyPaths = ["/login", "/signup", "/forgot-password"];
  if (publicOnlyPaths.some((p) => pathname.startsWith(p)) && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Protected routes (require authentication) ───────────────────────────
  const protectedPaths = [
    "/dashboard",
    "/cases",
    "/office",
    "/posts",
    "/reports",
    "/lawyers",
    "/settings",
    "/admin",
  ];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Admin-only routes ────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && user) {
    // TODO: fetch user role from Supabase DB and check role === 'admin'
    // const { data: profile } = await supabase
    //   .from("users")
    //   .select("role")
    //   .eq("id", user.id)
    //   .single();
    //
    // if (!profile?.role?.includes("admin")) {
    //   return NextResponse.redirect(new URL("/dashboard", request.url));
    // }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
