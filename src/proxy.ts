import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { GUEST_COOKIE, GUEST_VALUE } from "@/lib/guest";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

const PROTECTED_PATHS = [
  "/dashboard",
  "/transactions",
  "/accounts",
  "/categories",
  "/budgets",
  "/goals",
  "/reports",
  "/settings",
];

const AUTH_PATHS = ["/login", "/register"];

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isAuthPage(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * 1. Menyegarkan sesi Supabase (cookie httpOnly) sebelum halaman dirender.
 * 2. Menjaga halaman terproteksi: harus sesi ATAU mode guest.
 * 3. Pengguna yang sudah masuk tidak boleh membuka /login & /register.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const needsAuth = isProtected(pathname) || isAuthPage(pathname);

  let user: { id: string } | null = null;

  if (isSupabaseConfigured && needsAuth) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  const guest = request.cookies.get(GUEST_COOKIE)?.value === GUEST_VALUE;

  if (isProtected(pathname) && !user && !guest) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/dashboard" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Mode guest tidak boleh membuka /settings.
  if (pathname === "/settings" && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Semua rute kecuali aset statis & API internal.
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|.*\\..*).*)",
  ],
};
