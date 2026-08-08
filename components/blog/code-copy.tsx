"use client";

import { useEffect } from "react";

/**
 * Hydration enhancer: adds a language label + copy button to every code
 * block inside <article>. Runs once per mount; the DOM walk is idempotent
 * (guarded by a data attribute on each <pre>).
 */
export function CodeCopy() {
  useEffect(() => {
    const pres = document.querySelectorAll<HTMLPreElement>("article pre");
    for (const pre of Array.from(pres)) {
      if (pre.dataset.copyReady === "1") continue;
      pre.dataset.copyReady = "1";
      pre.classList.add("relative");

      const code = pre.querySelector("code");
      const lang = code?.className.match(/language-([\w-]+)/)?.[1];

      const header = document.createElement("div");
      header.className =
        "flex items-center justify-between gap-2 border-b border-border/60 bg-muted/60 px-3 py-1.5 text-xs";
      const langLabel = document.createElement("span");
      langLabel.className = "font-mono text-muted-foreground";
      langLabel.textContent = lang ?? "code";
      header.appendChild(langLabel);

      const copy = document.createElement("button");
      copy.type = "button";
      copy.className =
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
      copy.textContent = "Copy";
      copy.setAttribute("aria-label", "Copy code to clipboard");
      copy.addEventListener("click", () => {
        if (!code?.textContent) return;
        void navigator.clipboard.writeText(code.textContent).then(() => {
          copy.textContent = "Copied!";
          window.setTimeout(() => {
            copy.textContent = "Copy";
          }, 2000);
        });
      });
      header.appendChild(copy);

      pre.insertBefore(header, pre.firstChild);
    }
  }, []);

  return null;
}
