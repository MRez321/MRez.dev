"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** lucide-react dropped brand icons — inline LinkedIn glyph. */
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-3.5">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function shareIntent(network: "x" | "linkedin", url: string, title: string) {
  if (network === "x") {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  }
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function PostShare({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      trackEvent("share", { network: "copy", path: url });
    } catch {
      // clipboard unavailable — nothing to do
    }
  }

  const shared = (network: "x" | "linkedin") => trackEvent("share", { network, path: url });

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Share2 className="h-4 w-4" />
        Share
      </span>
      <Button variant="outline" size="sm" asChild aria-label="Share on X (Twitter)">
        <a
          href={shareIntent("x", url, title)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => shared("x")}
        >
          X
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild aria-label="Share on LinkedIn">
        <a
          href={shareIntent("linkedin", url, title)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => shared("linkedin")}
        >
          <LinkedinIcon />
          LinkedIn
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={copyLink} aria-label="Copy link">
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
