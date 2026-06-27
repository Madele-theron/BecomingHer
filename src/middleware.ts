import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public access to login page and auth API
  if (path === "/login" || path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authToken = request.cookies.get("auth_token")?.value;

  if (authToken !== "authenticated") {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
