import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("__session");

  // /admin is intentionally excluded here — it has its own independent
  // password gate (both in the UI and via the x-admin-pass header on its
  // API routes), so it doesn't need a Firebase session on top of that.
  if (
    request.nextUrl.pathname.startsWith("/checkout") ||
    request.nextUrl.pathname.startsWith("/orders")
  ) {
    if (!session) {
      // Redirect to /login if no session
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Note: We don't verify the session token explicitly here using firebase-admin
    // because firebase-admin SDK requires Node.js runtime, but middleware runs in Edge.
    // Full role-based verification should happen inside the /admin components or API routes.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/orders/:path*"
  ],
};