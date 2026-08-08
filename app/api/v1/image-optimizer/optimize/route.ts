// app/api/v1/image-optimizer/optimize/route.ts
// POST /api/v1/image-optimizer/optimize
// Multipart: `image` (file) + optional `options` (JSON string).
// Authenticated with an API key; per-key rate limit + monthly quotas are
// enforced in lib/api-keys.ts. Returns the optimized file with stats headers.
import { NextRequest } from "next/server";
import {
  ApiError,
  apiErrorResponse,
  authenticateApiKey,
  formatBytes,
  logUsage,
  rateLimitHeaders,
  touchLastUsed,
  type ApiKeyAuth,
} from "@/lib/api-keys";
import {
  optimizeImage,
  optimizeOptionsSchema,
  type OptimizeOptions,
} from "@/features/apps/image-optimizer/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENDPOINT = "/api/v1/image-optimizer/optimize";

function outputFilename(originalName: string, format: string): string {
  const safe = originalName.split(/[\\/]/).pop() ?? "image";
  const base = safe.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${format === "jpeg" ? "jpg" : format}`;
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  const ip =
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || null;
  let authed: ApiKeyAuth | null = null;

  try {
    authed = await authenticateApiKey(request, ip);

    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      throw new ApiError(
        400,
        "INVALID_REQUEST",
        "Missing `image` file field. Send a multipart/form-data request with a file part named `image`."
      );
    }
    if (file.size === 0) {
      throw new ApiError(400, "INVALID_REQUEST", "The uploaded file is empty.");
    }
    if (file.size > authed.maxFileBytes) {
      throw new ApiError(
        413,
        "FILE_TOO_LARGE",
        `File is ${formatBytes(file.size)}; the limit for this key is ${formatBytes(authed.maxFileBytes)}.`,
        { limit: authed.maxFileBytes }
      );
    }

    let options: OptimizeOptions;
    const rawOptions = form.get("options");
    if (rawOptions) {
      try {
        options = optimizeOptionsSchema.parse(JSON.parse(String(rawOptions)));
      } catch {
        throw new ApiError(
          400,
          "INVALID_OPTIONS",
          "The `options` field must be a JSON object matching the documented schema.",
          {
            schema_hint: {
              format: "webp | jpeg | png | gif | tiff",
              quality: "integer 1-100",
              width: "max width in px",
              lossless: "boolean",
              progressive: "boolean",
              strip_metadata: "boolean",
            },
          }
        );
      }
    } else {
      options = optimizeOptionsSchema.parse({});
    }

    const input = Buffer.from(await file.arrayBuffer());
    let result;
    try {
      result = await optimizeImage(input, options);
    } catch {
      throw new ApiError(
        422,
        "INVALID_IMAGE",
        "The uploaded file could not be processed as an image."
      );
    }

    logUsage(authed.id, ENDPOINT, "ok", input.length, result.data.length, Date.now() - started);
    touchLastUsed(authed.id);

    const filename = outputFilename(file.name, result.format);
    return new Response(new Uint8Array(result.data), {
      status: 200,
      headers: {
        "content-type": result.mime,
        "content-length": String(result.data.length),
        "content-disposition": `inline; filename="${filename}"`,
        "cache-control": "private, no-store",
        "x-mrez-format": result.format,
        "x-mrez-original-bytes": String(input.length),
        "x-mrez-optimized-bytes": String(result.data.length),
        "x-mrez-width": String(result.width),
        "x-mrez-height": String(result.height),
        ...rateLimitHeaders(authed.rateLimit),
      },
    });
  } catch (err) {
    if (authed) {
      logUsage(authed.id, ENDPOINT, "rejected", 0, 0, Date.now() - started);
    }
    return apiErrorResponse(err);
  }
}
