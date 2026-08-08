// app/api/v1/docs/route.ts
// OpenAPI 3.1 document for the public v1 API. Public — no auth required.
import { NextRequest } from "next/server";
import { openApiDocument } from "@/features/apps/image-optimizer/openapi";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Mirror the caller's origin so the spec is correct on any host.
  const origin = request.nextUrl.origin;
  const doc = {
    ...openApiDocument,
    servers: [{ url: `${origin}/api/v1/image-optimizer` }],
    components: {
      ...openApiDocument.components,
      securitySchemes: {
        ...openApiDocument.components.securitySchemes,
        bearerAuth: {
          ...openApiDocument.components.securitySchemes.bearerAuth,
          description: `API key (mrez_live_...). Create one at ${origin}/dashboard/api-keys.`,
        },
      },
    },
  };
  return Response.json(doc, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
