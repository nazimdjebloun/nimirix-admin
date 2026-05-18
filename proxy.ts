import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth-server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("better-auth.session_token");
  const isRootPage = pathname === "/";
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (!isRootPage && !isAuthPage) {
    return NextResponse.next();
  }

  if (!hasSession) {
    if (isRootPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  const authenticated = await isAuthenticated().catch(() => false);

  if (!authenticated) {
    if (isRootPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/forgot-password", "/reset-password"],
};
