"use client";

import { trackEvent } from "@/lib/analytics";

/** Client anchor that fires a custom analytics event on click. */
export function TrackedAnchor({
  href,
  eventName,
  eventProps,
  className,
  children,
}: {
  href: string;
  eventName: string;
  eventProps?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackEvent(eventName, eventProps)}
    >
      {children}
    </a>
  );
}
