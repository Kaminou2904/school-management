import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    // Role-based access control
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
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public routes
        if (pathname.startsWith("/login") || pathname.startsWith("/api/auth") || pathname.startsWith("/api/seed")) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/seed).*)",
  ],
};
