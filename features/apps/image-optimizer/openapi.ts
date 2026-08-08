// features/apps/image-optimizer/openapi.ts
// OpenAPI 3.1 document for the public v1 API, served at /api/v1/docs.
import { API_BASE, SITE_ORIGIN } from "./constants";

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "MRez Image Optimizer API",
    version: "1.0.0",
    description:
      "Server-side image optimization with per-key rate limits and monthly quotas. Create an API key in the dashboard, then send images as multipart/form-data and get optimized files back.\n\nDocs: /docs/api",
  },
  servers: [{ url: API_BASE }],
  security: [{ bearerAuth: [] }],
  tags: [{ name: "Image Optimizer" }],
  paths: {
    "": {
      get: {
        tags: ["Image Optimizer"],
        summary: "Service metadata",
        description: "Returns endpoint list, supported formats, and limits. Public — no auth required.",
        security: [],
        responses: {
          "200": {
            description: "Service metadata",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
    "/optimize": {
      post: {
        tags: ["Image Optimizer"],
        summary: "Optimize an image",
        description:
          "Upload one image and receive the optimized file in the response body. Sizing and processing stats are returned in `x-mrez-*` and `x-ratelimit-*` headers.\n\nThe `options` form field is an optional JSON string: `{\"format\":\"webp\",\"quality\":80,\"width\":1600,\"lossless\":false,\"progressive\":false,\"stripMetadata\":true}`. Inputs are auto-oriented and never upscaled.",
        operationId: "optimizeImage",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "Image file (jpeg, png, webp, gif, tiff, avif, svg).",
                  },
                  options: {
                    type: "string",
                    description: "Optional JSON string with processing options.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Optimized image. Stats in response headers.",
            headers: {
              "X-MRez-Format": { schema: { type: "string" }, description: "Output format." },
              "X-MRez-Original-Bytes": { schema: { type: "integer" }, description: "Uploaded size in bytes." },
              "X-MRez-Optimized-Bytes": { schema: { type: "integer" }, description: "Optimized size in bytes." },
              "X-MRez-Width": { schema: { type: "integer" }, description: "Output width in px." },
              "X-MRez-Height": { schema: { type: "integer" }, description: "Output height in px." },
              "X-RateLimit-Limit": { schema: { type: "integer" }, description: "Requests allowed per minute for this key." },
              "X-RateLimit-Remaining": { schema: { type: "integer" }, description: "Requests remaining in the current minute window." },
              "X-RateLimit-Reset": { schema: { type: "integer" }, description: "Unix seconds when the window resets." },
            },
            content: {
              "image/*": { schema: { type: "string", format: "binary" } },
            },
          },
          "400": { description: "Missing/empty file or invalid options JSON.", $ref: "#/components/responses/Error" },
          "401": { description: "Missing, invalid, or revoked API key.", $ref: "#/components/responses/Error" },
          "413": { description: "File exceeds the key's max file size.", $ref: "#/components/responses/Error" },
          "422": { description: "File is not a processable image.", $ref: "#/components/responses/Error" },
          "429": {
            description: "Rate limit or monthly quota exceeded (includes `retry_after`).",
            $ref: "#/components/responses/Error",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: `API key (mrez_live_...). Create one at ${SITE_ORIGIN}/dashboard/api-keys.`,
      },
    },
    responses: {
      Error: {
        description: "Error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message", "documentation_url"],
            properties: {
              code: { type: "string", description: "Machine-readable error code." },
              message: { type: "string" },
              documentation_url: { type: "string" },
              retry_after: { type: "integer", description: "Seconds to wait (429 only)." },
              limit: { type: "integer", description: "Configured limit that was hit (429/413 only)." },
            },
          },
        },
      },
    },
  },
} as const;

export type OpenApiDocument = typeof openApiDocument;
