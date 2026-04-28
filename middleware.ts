import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,          // ← was NEXTAUTH_SECRET, must be AUTH_SECRET
    secureCookie: process.env.NODE_ENV === "production",  // ← required on Vercel (HTTPS)
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"      // ← NextAuth v5 production cookie name
        : "authjs.session-token",              // ← NextAuth v5 dev cookie name
  });

  const { pathname } = req.nextUrl;
  const isLoggedIn   = !!token;

  const isAdminRoute = pathname.startsWith("/dashboard");

  const isProtectedRoute =
    pathname.startsWith("/cart")     ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders")   ||
    pathname.startsWith("/profile");

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  if (isAdminRoute && (!isLoggedIn || token?.role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};