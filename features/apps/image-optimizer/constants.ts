// features/apps/image-optimizer/constants.ts
// Shared by the server-side API pipeline and the client-side mini app.

export const OUTPUT_FORMATS = ["webp", "jpeg", "png", "gif", "tiff"] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export const INPUT_FORMATS = ["jpeg", "png", "webp", "gif", "tiff", "avif", "svg"] as const;

export const MIME_BY_FORMAT: Record<OutputFormat, string> = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  tiff: "image/tiff",
};

export const EXT_BY_FORMAT: Record<OutputFormat, string> = {
  webp: "webp",
  jpeg: "jpg",
  png: "png",
  gif: "gif",
  tiff: "tiff",
};

/** Canonical origin used in docs/examples; falls back to localhost in dev. */
export const SITE_ORIGIN =
  (process.env.NEXT_PUBLIC_APP_URL ?? "https://mrez.dev").replace(/\/+$/, "") ||
  "https://mrez.dev";

export const API_BASE = `${SITE_ORIGIN}/api/v1/image-optimizer`;
