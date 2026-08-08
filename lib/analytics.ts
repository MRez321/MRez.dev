// Client-side analytics helpers.
//
// One facade for three sinks:
//  1. First-party beacon -> /api/internal/track (stored in SQLite, shown in
//     the admin dashboard). Always on, no cookies, no third parties.
//  2. GA4 (gtag)          -> only when NEXT_PUBLIC_GA_ID is set.
//  3. Plausible           -> only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set
//     (the queue stub installed by the analytics provider buffers events
//     until the script loads).
//
// Every function is a no-op where its sink isn't configured and must never
// throw — analytics must not break the app.

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: ((event: string, options?: { props?: Record<string, unknown> }) => void) & {
      q?: unknown[];
    };
    dataLayer?: unknown[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

/** Stable per-browser id (localStorage, no cookie consent needed). */
function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem("mrez_visitor");
    if (!id) {
      id = window.crypto?.randomUUID?.() ?? `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem("mrez_visitor", id);
    }
    return id;
  } catch {
    return "";
  }
}

function beacon(name: string, props?: AnalyticsProps, meta?: { path?: string; referrer?: string }) {
  try {
    const body = JSON.stringify({
      name,
      path: meta?.path ?? window.location.pathname,
      referrer: meta?.referrer ?? document.referrer,
      visitorId: getVisitorId(),
      props,
    });
    navigator.sendBeacon?.("/api/internal/track", new Blob([body], { type: "application/json" }));
  } catch {
    // tracking is best-effort
  }
}

/** Fire a custom event to every configured sink. */
export function trackEvent(name: string, props?: AnalyticsProps) {
  try {
    if (GA_ID) gtag("event", name, props ?? {});
    if (typeof window !== "undefined" && typeof window.plausible === "function") {
      window.plausible(name, { props: props ?? {} });
    }
    beacon(name, props);
  } catch {
    // never break the app over analytics
  }
}

/** Route-change pageview. GA4 needs an explicit event; Plausible auto-tracks. */
export function trackPageView(pathname: string, referrer?: string) {
  try {
    if (GA_ID) {
      gtag("event", "page_view", {
        page_path: pathname,
        page_referrer: referrer ?? "",
        page_title: typeof document !== "undefined" ? document.title : undefined,
      });
    }
    beacon("pageview", undefined, { path: pathname, referrer });
  } catch {
    // best-effort
  }
}
