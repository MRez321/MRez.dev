import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Fixed small table of stat-card tones — add one here, use it anywhere. */
const STAT_TONES: Record<
  string,
  { chip: string }
> = {
  sky: { chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  emerald: { chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  amber: { chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  violet: { chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  rose: { chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  indigo: { chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
};

export type StatTone = keyof typeof STAT_TONES;

/** Chip classes for a tone — reuse outside StatCard (e.g. list rows). */
export function statToneChip(tone: StatTone) {
  return STAT_TONES[tone].chip;
}

/** Colorful stat card: tinted icon chip + big number. */
export function StatCard({
  label,
  value,
  Icon,
  tone = "sky",
}: {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  tone?: StatTone;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", STAT_TONES[tone].chip)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
