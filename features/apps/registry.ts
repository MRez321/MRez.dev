import { ImageIcon, type LucideIcon } from "lucide-react";

export type AppStatus = "live" | "soon";

export type AppMeta = {
  /** URL-safe id; must match the route folder under app/(apps)/apps/<slug> */
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** Route to the app page, e.g. /apps/<slug> */
  href: string;
  icon: LucideIcon;
  status: AppStatus;
  tags: string[];
  /** Featured apps render larger on the hub */
  featured?: boolean;
};

/**
 * HOW TO ADD A MINI APP
 * ---------------------
 * 1. Create the route:   app/(apps)/apps/<slug>/page.tsx
 * 2. Add the app's logic under: features/apps/<slug>/  (data, hooks, lib)
 * 3. Add one entry to APP_REGISTRY below. The /apps hub picks it up
 *    automatically — no other wiring needed.
 *
 * status: "live" -> clickable card on the hub.
 *         "soon" -> dashed "coming soon" teaser (link disabled).
 *
 * Apps keep their own route + folder so one app can never break another.
 */
export const APP_REGISTRY: AppMeta[] = [
  {
    slug: "image-optimizer",
    name: "Image Optimizer",
    tagline: "Compress images right in your browser",
    description:
      "Drop in an image, tune the quality, and download a smaller version — nothing is uploaded. A server-side API with rate limits is also available.",
    href: "/apps/image-optimizer",
    icon: ImageIcon,
    status: "live",
    featured: true,
    tags: ["images", "client-side", "api"],
  },
];
