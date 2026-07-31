// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        // Only redirect to login if they are trying to access a protected route
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // ONLY protect the dashboard and any other explicitly private routes.
    // Everything else (like "/" or "/about") is public.
    matcher: ["/dashboard/:path*"],
};