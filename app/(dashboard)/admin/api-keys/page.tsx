import { getAllApiKeysWithUsage } from "@/features/api-keys/queries";
import { requireAdmin } from "@/features/auth/api/guards";
import { RevokeKeyButton } from "@/components/dashboard/revoke-key-button";
import { formatBytes } from "@/lib/api-keys";
import { formatCount, timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "API Keys — Admin",
  description: "All API keys across the site with usage.",
};

export default async function AdminApiKeysPage() {
  await requireAdmin();
  const keys = getAllApiKeysWithUsage();

  return (
    <div className="px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every API key across the site, with current-month usage.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Limits</th>
              <th className="px-4 py-3 font-medium">Used this month</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Last used</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{key.ownerName}</div>
                  <div className="text-xs text-muted-foreground">{key.ownerEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-xs">{key.prefix}…</code>
                    <Badge variant={key.status === "revoked" ? "outline" : "default"}>
                      {key.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{key.name}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <div>{key.rateLimitPerMinute} req/min</div>
                  <div>max {formatBytes(key.maxFileBytes)}</div>
                  {key.monthlyRequests > 0 && <div>{formatCount(key.monthlyRequests)} req/mo</div>}
                  {key.monthlyBytes > 0 && <div>{formatBytes(key.monthlyBytes)}/mo</div>}
                </td>
                <td className="px-4 py-3 text-xs">
                  <div>{formatCount(key.usage.requests)} requests</div>
                  <div className="text-muted-foreground">{formatBytes(key.usage.bytesIn)} in</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {timeAgo(key.createdAt.toISOString())}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {key.lastUsedAt ? timeAgo(key.lastUsedAt.toISOString()) : "Never"}
                </td>
                <td className="px-4 py-3 text-right">
                  <RevokeKeyButton id={key.id} disabled={key.status === "revoked"} />
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No API keys created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
