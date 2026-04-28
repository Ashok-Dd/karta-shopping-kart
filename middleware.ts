import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isAdminRoute = nextUrl.pathname.startsWith("/dashboard");
  const isProtectedRoute = nextUrl.pathname.startsWith("/cart") ||
    nextUrl.pathname.startsWith("/checkout") ||
    nextUrl.pathname.startsWith("/orders") ||
    nextUrl.pathname.startsWith("/profile");
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl));
  }

  if (isAdminRoute && (!isLoggedIn || (session?.user as { role?: string })?.role !== "ADMIN")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
