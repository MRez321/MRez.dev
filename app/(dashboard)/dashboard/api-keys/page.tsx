import Link from "next/link";
import { BookOpen, KeyRound, Terminal } from "lucide-react";
import { requireUser } from "@/features/auth/api/queries";
import { getMyApiKeys } from "@/features/api-keys/queries";
import { CreateApiKeyForm } from "@/components/dashboard/create-api-key-form";
import { RevokeKeyButton } from "@/components/dashboard/revoke-key-button";
import { formatBytes } from "@/lib/api-keys";
import { formatCount, timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "API Keys — MRez",
  description: "Manage API keys and limits for the MRez Image Optimizer API.",
};

function UsageBar({
  used,
  limit,
  label,
}: {
  used: number;
  limit: number;
  label: string;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const nearLimit = pct >= 90;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={nearLimit ? "font-medium text-destructive" : "text-foreground"}>
          {formatCount(used)} / {formatCount(limit)}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={nearLimit ? "h-full bg-destructive" : "h-full bg-primary"}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function ApiKeysPage() {
  const session = await requireUser();
  const keys = getMyApiKeys(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Credentials for the public API. Each key has its own rate limit,
            monthly quotas, and max file size.
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/docs/api" icon={<BookOpen className="size-4" />}>
            API docs
          </ButtonLink>
          <ButtonLink href="/apps/image-optimizer" icon={<Terminal className="size-4" />}>
            Try the app
          </ButtonLink>
        </div>
      </div>

      <CreateApiKeyForm />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your keys ({keys.length})
        </h2>
        {keys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <KeyRound className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">No API keys yet</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Create one above, then call{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                  POST /api/v1/image-optimizer/optimize
                </code>{" "}
                with it.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => {
              const revoked = key.status === "revoked";
              return (
                <Card key={key.id} className={revoked ? "opacity-60" : undefined}>
                  <CardHeader className="flex-row items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{key.name}</CardTitle>
                        <Badge variant={revoked ? "outline" : "default"}>
                          {revoked ? "Revoked" : "Active"}
                        </Badge>
                      </div>
                      <code className="mt-1 block font-mono text-xs text-muted-foreground">
                        {key.prefix}…
                      </code>
                    </div>
                    <RevokeKeyButton id={key.id} disabled={revoked} />
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <dt className="text-xs text-muted-foreground">Rate limit</dt>
                        <dd>{key.rateLimitPerMinute} req / min</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Max file size</dt>
                        <dd>{formatBytes(key.maxFileBytes)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Created</dt>
                        <dd>{timeAgo(key.createdAt.toISOString())}</dd>
                      </div>
                      {key.monthlyRequests > 0 ? (
                        <div className="sm:col-span-1">
                          <UsageBar
                            used={key.usage.requests}
                            limit={key.monthlyRequests}
                            label="Requests this month"
                          />
                        </div>
                      ) : (
                        <div>
                          <dt className="text-xs text-muted-foreground">Monthly requests</dt>
                          <dd>Unlimited</dd>
                        </div>
                      )}
                      {key.monthlyBytes > 0 ? (
                        <div>
                          <UsageBar
                            used={key.usage.bytesIn}
                            limit={key.monthlyBytes}
                            label="Upload this month"
                          />
                        </div>
                      ) : (
                        <div>
                          <dt className="text-xs text-muted-foreground">Monthly upload</dt>
                          <dd>Unlimited</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-xs text-muted-foreground">Last used</dt>
                        <dd>{key.lastUsedAt ? timeAgo(key.lastUsedAt.toISOString()) : "Never"}</dd>
                      </div>
                    </dl>
                    {!revoked && key.monthlyRequests === 0 && key.monthlyBytes === 0 && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        This key has no monthly quota — requests are only limited by the per-minute
                        rate limit.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ButtonLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      {icon}
      {children}
    </Link>
  );
}
