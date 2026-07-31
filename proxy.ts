// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
    // Optimistic check: verifies the cookie exists, but does NOT validate it against the database.
    // This is the recommended approach for performance. Actual security validation
    // must happen inside your Server Components or Server Actions.
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Protect all routes except static files, Next.js internals, auth routes, and public pages
    matcher: ["/((?!.*\\..*|_next|login|signup|api/auth).*)"],
};