import { AppCard } from "@/components/apps/app-card";
import { APP_REGISTRY } from "@/features/apps/registry";

export const metadata = {
  title: "Mini Apps — MRez",
  description: "Small tools, no signup required.",
};

export default function AppsPage() {
  const live = APP_REGISTRY.filter((app) => app.status === "live");
  const soon = APP_REGISTRY.filter((app) => app.status === "soon");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
      <section className="py-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Mini apps
        </h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Small, focused tools that do one thing well. No signup, no tracking
          — just open and use.
        </p>
      </section>

      <section className="pb-12">
        {live.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((app) => (
              <AppCard key={app.slug} app={app} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No apps published yet — check back soon.
          </p>
        )}

        {soon.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              In the works
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {soon.map((app) => (
                <AppCard key={app.slug} app={app} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
