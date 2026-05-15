import { NextResponse, type NextRequest } from "next/server";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { isRoleAllowedOnRoute, getRoleRedirect } from "@/lib/auth/page-access";
import type { Role } from "@/lib/auth/roles";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. FAST PATH: Skip middleware for static assets AND prefetches.
  // Next.js prefetches pages on hover. We don't need to block these with DB calls.
  if (
    request.headers.get("x-nextjs-prefetch") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. CHECK COOKIE: If the session token is missing, they are definitely logged out.
  // We can redirect to login in 0ms without hitting Convex.
  const hasSession = request.cookies.has("better-auth.session_token");
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. DATABASE CHECK: Only hit Convex if we absolutely have to.
  const user = await fetchAuthQuery(api.users.getCurrentUser).catch(() => null);

  // Unauthenticated users: redirect to login if trying to access protected routes
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated users: redirect away from auth pages
  if (user && isAuthPage) {
    const role = (user.role ?? "user") as Role;
    return NextResponse.redirect(new URL(getRoleRedirect(role), request.url));
  }

  // Authenticated users: handle root redirection and RBAC
  if (user && !isAuthPage) {
    const role = (user.role ?? "user") as Role;
    
    // Redirect from root / to their specific role dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL(getRoleRedirect(role), request.url));
    }

    // Check if the current user's role is allowed on this specific route
    if (!isRoleAllowedOnRoute(role, pathname)) {
      const landingPage = getRoleRedirect(role);
      return NextResponse.redirect(new URL(landingPage, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
