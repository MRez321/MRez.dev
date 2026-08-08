"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { trackEvent, trackPageView } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_BASE_URL = process.env.NEXT_PUBLIC_PLAUSIBLE_BASE_URL ?? "https://plausible.io";
const isProd = process.env.NODE_ENV === "production";

/**
 * Analytics wiring for the whole app:
 * - GA4 + Plausible scripts (production only, config-gated via env).
 * - First-party pageview beacon on every route change.
 * - Outbound link tracking (delegated, one listener).
 *
 * The first-party beacon always runs (dev included) so the admin dashboard has
 * data to show; third-party scripts need their env vars and production.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.href;
      if (!href || !href.startsWith("http")) return;
      try {
        if (new URL(href).hostname === window.location.hostname) return;
      } catch {
        return;
      }
      trackEvent("outbound_click", { url: href });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!isProd) return null;

  return (
    <>
      {GA_ID ? (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script
            id="ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              // send_page_view:false — the pageview beacon above emits it,
              // avoiding a double count on first load.
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});`,
            }}
          />
        </>
      ) : null}
      {PLAUSIBLE_DOMAIN ? (
        <>
          <Script
            id="plausible-queue"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)};`,
            }}
          />
          <Script
            strategy="afterInteractive"
            src={`${PLAUSIBLE_BASE_URL}/js/script.js`}
            data-domain={PLAUSIBLE_DOMAIN}
          />
        </>
      ) : null}
    </>
  );
}
