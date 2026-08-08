import Link from "next/link";
import { BookOpen, KeyRound, ShieldCheck, Terminal } from "lucide-react";
import { API_BASE, OUTPUT_FORMATS, INPUT_FORMATS } from "@/features/apps/image-optimizer/constants";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Image Optimizer API — MRez",
  description:
    "Server-side image optimization API with API keys, rate limits, and monthly quotas.",
};

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.82em] text-foreground">
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-xs leading-relaxed text-foreground">
      {children}
    </pre>
  );
}

const ERROR_CODES = [
  { code: "UNAUTHENTICATED", status: 401, meaning: "No API key was sent." },
  { code: "INVALID_API_KEY", status: 401, meaning: "The key doesn't exist." },
  { code: "KEY_REVOKED", status: 403, meaning: "The key was revoked from the dashboard." },
  { code: "KEY_EXPIRED", status: 403, meaning: "The key's expiry date has passed." },
  { code: "INVALID_REQUEST", status: 400, meaning: "Missing or empty `image` file." },
  { code: "INVALID_OPTIONS", status: 400, meaning: "`options` is not a valid JSON object." },
  { code: "FILE_TOO_LARGE", status: 413, meaning: "File exceeds the key's max file size." },
  { code: "INVALID_IMAGE", status: 422, meaning: "The file can't be decoded as an image." },
  { code: "RATE_LIMITED", status: 429, meaning: "Per-minute rate limit exceeded." },
  { code: "QUOTA_EXCEEDED", status: 429, meaning: "Monthly request or upload quota reached." },
];

export default function ApiDocsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
      <div className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit gap-1.5">
          <Terminal className="h-3.5 w-3.5" />
          API Reference · v1
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Image Optimizer API
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Server-side image optimization. Upload an image, get a smaller one back
          — with per-key rate limits and monthly quotas enforced for you.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {/* Authentication */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <KeyRound className="size-4 text-primary" /> Authentication
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              Every request must carry an API key created in the{" "}
              <Link href="/dashboard/api-keys" className="underline underline-offset-2">
                dashboard
              </Link>
              . Keys look like <Code>mrez_live_…</Code> and are shown once at
              creation. Send them as a bearer token:
            </p>
            <Pre>{`curl -X POST ${API_BASE}/optimize \\
  -H "Authorization: Bearer mrez_live_…" \\
  -F "image=@photo.jpg"`}</Pre>
            <p className="text-muted-foreground">
              The <Code>X-API-Key</Code> header is accepted as an alternative to
              <Code> Authorization</Code>.
            </p>
          </div>
        </section>

        {/* Limits */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="size-4 text-primary" /> Limits &amp; quotas
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
            <p>
              Limits are configured per key when it&apos;s created and can be
              enforced per minute and per month:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
              <li>
                <strong>Rate limit</strong> — max requests per minute (fixed
                window, e.g. <Code>60/min</Code>).
              </li>
              <li>
                <strong>Monthly requests</strong> — max calls per calendar month
                (0 = unlimited).
              </li>
              <li>
                <strong>Monthly upload</strong> — max bytes uploaded per calendar
                month (0 = unlimited).
              </li>
              <li>
                <strong>Max file size</strong> — per-request upload ceiling (max
                50 MB).
              </li>
            </ul>
            <p>
              Rate limiting is enforced globally with Redis, so the limit holds
              across every server instance. Responses include{" "}
              <Code>X-RateLimit-Limit</Code>, <Code>X-RateLimit-Remaining</Code>,
              and <Code>X-RateLimit-Reset</Code> headers. Rejected calls return{" "}
              <Code>429</Code> with a <Code>retry_after</Code> field.
            </p>
          </div>
        </section>

        {/* Endpoints */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Terminal className="size-4 text-primary" /> Endpoints
          </h2>

          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>GET</Badge>
                <CardTitle className="font-mono text-sm">/api/v1/image-optimizer</CardTitle>
              </div>
              <CardDescription>Service metadata — public, no auth required.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-foreground/90">
              Returns the base URL, supported formats, endpoint list, and a link
              to this page. Useful for discovering the API at runtime.
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary">POST</Badge>
                <CardTitle className="font-mono text-sm">
                  /api/v1/image-optimizer/optimize
                </CardTitle>
              </div>
              <CardDescription>
                Optimize one image — authenticated, rate limited, quota checked.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground/90">
              <p>
                Send a <Code>multipart/form-data</Code> body with an{" "}
                <Code>image</Code> file part and an optional <Code>options</Code>{" "}
                JSON string. The optimized file is returned as the response body.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Field</th>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">image</td>
                      <td className="py-2 pr-4 text-xs">file (required)</td>
                      <td className="py-2 text-xs">
                        Input: {INPUT_FORMATS.join(", ")}.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">options</td>
                      <td className="py-2 pr-4 text-xs">JSON string</td>
                      <td className="py-2 text-xs">Processing options, see below.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <p className="mb-2 font-medium">Options object</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">Key</th>
                        <th className="py-2 pr-4 font-medium">Default</th>
                        <th className="py-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">format</td>
                        <td className="py-2 pr-4 font-mono text-xs">"webp"</td>
                        <td className="py-2 text-xs">Output: {OUTPUT_FORMATS.join(", ")}.</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">quality</td>
                        <td className="py-2 pr-4 font-mono text-xs">80</td>
                        <td className="py-2 text-xs">Integer 1–100 (ignored by PNG).</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">width</td>
                        <td className="py-2 pr-4 font-mono text-xs">—</td>
                        <td className="py-2 text-xs">
                          Max output width in px; scales down, never up.
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">lossless</td>
                        <td className="py-2 pr-4 font-mono text-xs">false</td>
                        <td className="py-2 text-xs">Lossless encoding (WebP/PNG).</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">progressive</td>
                        <td className="py-2 pr-4 font-mono text-xs">false</td>
                        <td className="py-2 text-xs">Progressive JPEG.</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">stripMetadata</td>
                        <td className="py-2 pr-4 font-mono text-xs">true</td>
                        <td className="py-2 text-xs">
                          Removes EXIF/GPS; images are auto-oriented.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <p className="mb-2 font-medium">Response headers</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">Header</th>
                        <th className="py-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">X-MRez-Format</td>
                        <td className="py-2 text-xs">Output format.</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">X-MRez-Original-Bytes / X-MRez-Optimized-Bytes</td>
                        <td className="py-2 text-xs">Input and output sizes.</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">X-MRez-Width / X-MRez-Height</td>
                        <td className="py-2 text-xs">Output dimensions.</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">X-RateLimit-*</td>
                        <td className="py-2 text-xs">Per-minute window state.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Errors */}
        <section>
          <h2 className="text-lg font-semibold">Errors</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            Errors use a consistent shape — a JSON body with a machine-readable{" "}
            <Code>code</Code>, a human <Code>message</Code>, and a link to these
            docs:
          </p>
          <Pre>{`{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded — 60 requests per minute.",
    "documentation_url": "/docs/api",
    "retry_after": 42
  }
}`}</Pre>
          <div className="mt-3 overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Code</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ERROR_CODES.map((e) => (
                  <tr key={e.code}>
                    <td className="px-4 py-2 font-mono text-xs">{e.code}</td>
                    <td className="px-4 py-2 font-mono text-xs">{e.status}</td>
                    <td className="px-4 py-2 text-xs">{e.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Examples */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="size-4 text-primary" /> Examples
          </h2>
          <div className="mt-3 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">cURL — WebP at quality 75, max 1600px</p>
              <Pre>{`curl -X POST ${API_BASE}/optimize \\
  -H "Authorization: Bearer mrez_live_…" \\
  -F "image=@photo.jpg" \\
  -F 'options={"format":"webp","quality":75,"width":1600,"stripMetadata":true}' \\
  --output optimized.webp`}</Pre>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Node.js (fetch)</p>
              <Pre>{`import { readFile } from "node:fs/promises";

const form = new FormData();
form.append("image", new Blob([await readFile("photo.jpg")]), "photo.jpg");
form.append("options", JSON.stringify({ format: "jpeg", quality: 85 }));

const res = await fetch("${API_BASE}/optimize", {
  method: "POST",
  headers: { Authorization: "Bearer " + process.env.MREZ_API_KEY },
  body: form,
});
const buffer = Buffer.from(await res.arrayBuffer());`}</Pre>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Python (requests)</p>
              <Pre>{`import requests

resp = requests.post(
    "${API_BASE}/optimize",
    headers={"Authorization": "Bearer " + API_KEY},
    files={"image": open("photo.jpg", "rb")},
    data={"options": '{"format":"webp","quality":80}'},
)
open("optimized.webp", "wb").write(resp.content)
print(resp.headers["x-mrez-original-bytes"], "->", resp.headers["x-mrez-optimized-bytes"])`}</Pre>
            </div>
          </div>
        </section>

        <p className="rounded-xl border border-dashed p-5 text-sm leading-relaxed text-muted-foreground">
          The machine-readable spec is served at{" "}
          <a href="/api/v1/docs" className="underline underline-offset-2 hover:text-foreground">
            /api/v1/docs
          </a>{" "}
          (OpenAPI 3.1). Use the{" "}
          <Link href="/apps/image-optimizer" className="underline underline-offset-2 hover:text-foreground">
            browser tool
          </Link>{" "}
          for one-off compression — it never uploads anything.
        </p>
      </div>
    </main>
  );
}
