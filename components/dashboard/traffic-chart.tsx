"use client";

import type { TrafficStats } from "@/features/analytics/api/queries";

/** Minimal dependency-free bar chart for the traffic dashboard. */
export function TrafficChart({ daily }: { daily: TrafficStats["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.pageviews));

  return (
    <div>
      <div className="flex h-40 items-end gap-1">
        {daily.map((d) => (
          <div
            key={d.day}
            className="group relative flex h-full flex-1 flex-col justify-end"
            title={`${d.day} — ${d.pageviews} pageviews`}
          >
            <div
              className="w-full rounded-t-sm bg-primary/70 transition-colors group-hover:bg-primary"
              style={{ height: `${Math.max(2, (d.pageviews / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{daily[0]?.day?.slice(5) ?? ""}</span>
        <span>{daily[daily.length - 1]?.day?.slice(5) ?? ""}</span>
      </div>
    </div>
  );
}
