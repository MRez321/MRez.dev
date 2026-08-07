import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    // Only redirect to signin if they are trying to access a protected route
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // ONLY protect private routes.
  // Everything else (like "/" or "/about") is public.
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
