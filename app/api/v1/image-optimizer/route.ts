// app/api/v1/image-optimizer/route.ts
// Service metadata for the Image Optimizer API — public, no auth required.
import { NextRequest } from "next/server";
import { API_DOCS_URL, OPENAPI_URL } from "@/lib/api-keys";
import { INPUT_FORMATS, OUTPUT_FORMATS } from "@/features/apps/image-optimizer/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const base = `${request.nextUrl.origin}/api/v1/image-optimizer`;
  return Response.json({
    name: "MRez Image Optimizer API",
    version: "1.0.0",
    base_url: base,
    authentication: {
      type: "bearer",
      description:
        "Send `Authorization: Bearer <key>` (or `X-API-Key: <key>`) with an API key created in the dashboard.",
      key_management_url: `${request.nextUrl.origin}/dashboard/api-keys`,
    },
    endpoints: [
      {
        method: "GET",
        path: base,
        description: "Service metadata (this document).",
      },
      {
        method: "POST",
        path: `${base}/optimize`,
        description:
          "Optimize one image and receive the optimized file back with stats in response headers.",
        content_type: "multipart/form-data",
      },
    ],
    formats: {
      input: INPUT_FORMATS,
      output: OUTPUT_FORMATS,
    },
    limits: {
      per_key: {
        rate_limit_per_minute: "Configurable at key creation (default 60).",
        monthly_requests: "Configurable at key creation (0 = unlimited).",
        monthly_bytes: "Configurable at key creation (0 = unlimited).",
        max_file_bytes: "Configurable at key creation (default 10,485,760).",
      },
    },
    rate_limit_headers: [
      "x-ratelimit-limit",
      "x-ratelimit-remaining",
      "x-ratelimit-reset",
    ],
    docs_url: API_DOCS_URL,
    openapi_url: OPENAPI_URL,
  });
}
