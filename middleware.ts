import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2],
            ),
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
    "/office-setup",
    "/posts",
    "/reports",
    "/lawyers",
    "/missions",
    "/settings",
    "/admin",
  ];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Ban / expiry / role checks for logged-in users on protected routes ──
  if (isProtected && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_banned, is_test, created_at, role")
      .eq("id", user.id)
      .single();

    // Banned account
    if (profile?.is_banned) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("reason", "banned");
      const redirect = NextResponse.redirect(url);
      for (const cookie of supabaseResponse.cookies.getAll()) {
        redirect.cookies.set(cookie.name, cookie.value, cookie);
      }
      return redirect;
    }

    // Expired test account (72h)
    if (profile?.is_test) {
      const age = Date.now() - new Date(profile.created_at).getTime();
      if (age > 72 * 60 * 60 * 1000) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("reason", "expired");
        const redirect = NextResponse.redirect(url);
        for (const cookie of supabaseResponse.cookies.getAll()) {
          redirect.cookies.set(cookie.name, cookie.value, cookie);
        }
        return redirect;
      }
    }

    // Admin-only routes
    if (pathname.startsWith("/admin") && !profile?.role?.includes("admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
