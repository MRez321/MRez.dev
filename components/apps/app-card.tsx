import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AppMeta } from "@/features/apps/registry";

export function AppCard({ app }: { app: AppMeta }) {
  const isSoon = app.status === "soon";

  const content = (
    <div
      className={`group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-all ${
        isSoon
          ? "cursor-not-allowed border-dashed opacity-60"
          : "hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-lg hover:shadow-primary/5"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <app.icon className="h-5 w-5" />
        </span>
        {isSoon ? (
          <Badge variant="secondary" className="text-[10px]">
            Coming soon
          </Badge>
        ) : (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>

      <h3 className="mt-4 font-semibold">{app.name}</h3>
      <p className="mt-1 text-sm font-medium text-primary">{app.tagline}</p>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {app.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {app.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  if (isSoon) {
    return <div aria-disabled>{content}</div>;
  }

  return <a href={app.href} className="block h-full">{content}</a>;
}
