"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/analytics";

/** Report Core Web Vitals as custom events (self-hosted + GA4/Plausible). */
export function WebVitals() {
  useReportWebVitals((metric) => {
    trackEvent("web_vitals", {
      name: metric.name,
      value: Math.round(metric.value * 100) / 100,
      rating: metric.rating,
      id: metric.id,
    });
  });
  return null;
}
