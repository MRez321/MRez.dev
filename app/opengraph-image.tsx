import { ImageResponse } from "next/og";
import { OgShell } from "@/components/og/og-shell";

export const alt = "MRez — Mohammadreza Mousavi, full-stack developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default share card for the site (statically optimized at build time). */
export default function Image() {
  return new ImageResponse(
    <OgShell
      eyebrow="Mohammadreza Mousavi"
      title="MRez — code that ships."
      subtitle="Full-stack developer · Laravel packages & modern web apps · notes and mini tools on mrez.dev"
      footerRight="mrez.dev"
    />,
    { ...size }
  );
}
