import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow Next.js internals and auth/seed APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/seed") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Unauthenticated: only /login is public
  if (!token) {
    if (pathname === "/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Authenticated user hitting /login → redirect to their dashboard
  if (pathname === "/login") {
    const role = token.role as string;
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    if (role === "teacher") return NextResponse.redirect(new URL("/teacher/dashboard", req.url));
    if (role === "student") return NextResponse.redirect(new URL("/student/dashboard", req.url));
  }

  // Role-based route guard
  const role = token.role as string;
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
