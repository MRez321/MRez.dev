"use client";

import { useRef, useState } from "react";
import { Check, Copy, KeyRound, Plus, X } from "lucide-react";
import { createApiKey, type CreateApiKeyResult } from "@/app/actions/api-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const inputCls =
  "h-8 w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function CreateApiKeyForm() {
  const [result, setResult] = useState<CreateApiKeyResult | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await createApiKey(new FormData(e.currentTarget));
      setResult(res);
      if (res.ok) {
        formRef.current?.reset();
        setCopied(false);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" />
          Create API key
        </CardTitle>
        <CardDescription>
          Keys authenticate against the{" "}
          <a href="/docs/api" className="underline underline-offset-2 hover:text-foreground">
            Image Optimizer API
          </a>{" "}
          — every key carries its own rate limit and monthly quotas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                name="name"
                required
                maxLength={60}
                placeholder="e.g. Production server"
                className="mt-1.5 h-8"
              />
            </div>
            <div>
              <Label htmlFor="key-rate">Requests / min</Label>
              <Input
                id="key-rate"
                name="rateLimitPerMinute"
                type="number"
                min={1}
                max={10000}
                defaultValue={60}
                className={cn("mt-1.5", inputCls)}
              />
            </div>
            <div>
              <Label htmlFor="key-max-file">Max file (MB)</Label>
              <Input
                id="key-max-file"
                name="maxFileMegabytes"
                type="number"
                min={1}
                max={50}
                defaultValue={10}
                className={cn("mt-1.5", inputCls)}
              />
            </div>
            <div>
              <Label htmlFor="key-month-req">
                Monthly requests <span className="text-muted-foreground">(0 = ∞)</span>
              </Label>
              <Input
                id="key-month-req"
                name="monthlyRequests"
                type="number"
                min={0}
                defaultValue={0}
                className={cn("mt-1.5", inputCls)}
              />
            </div>
            <div>
              <Label htmlFor="key-month-mb">
                Monthly upload (MB) <span className="text-muted-foreground">(0 = ∞)</span>
              </Label>
              <Input
                id="key-month-mb"
                name="monthlyMegabytes"
                type="number"
                min={0}
                defaultValue={0}
                className={cn("mt-1.5", inputCls)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending} className="gap-1.5">
              <Plus className="size-4" />
              {pending ? "Creating…" : "Create key"}
            </Button>
            {result?.ok === false && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}
          </div>
        </form>

        {result?.ok && (
          <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Key created — copy it now</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  For security the full key is shown only once and never stored.
                </p>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setResult(null)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border bg-background px-3 py-2 font-mono text-xs">
                {result.key}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(result.key);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="shrink-0"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
