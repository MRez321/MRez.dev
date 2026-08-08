import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsEvent } from "@/lib/schema";

const MAX_NAME = 64;
const MAX_PATH = 512;
const MAX_REFERRER = 1024;
const MAX_PROPS_JSON = 4096;
const RETENTION_DAYS = 90;

type TrackBody = {
  name?: unknown;
  path?: unknown;
  referrer?: unknown;
  visitorId?: unknown;
  props?: unknown;
};

function cleanString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * First-party analytics beacon. Client-only (no cookies, no IP stored), so the
 * payload is capped and validated rather than authenticated. Best-effort: the
 * route answers 204 even when the row is dropped, so tracking can never slow
 * down or break a page.
 */
export async function POST(request: NextRequest) {
  // Only accept same-origin beacons from real browsers.
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return new NextResponse(null, { status: 204 });
  }

  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const name = cleanString(body.name, MAX_NAME);
  if (!name) return new NextResponse(null, { status: 204 });

  const props = typeof body.props === "object" && body.props !== null ? body.props : undefined;

  db.insert(analyticsEvent)
    .values({
      id: randomUUID(),
      name,
      path: cleanString(body.path, MAX_PATH),
      referrer: cleanString(body.referrer, MAX_REFERRER),
      visitorId: cleanString(body.visitorId, 128),
      props: props !== undefined ? JSON.stringify(props).slice(0, MAX_PROPS_JSON) : null,
      createdAt: new Date(),
    })
    .run();

  // Opportunistic retention sweep (~2% of requests).
  if (Math.random() < 0.02) {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    db.delete(analyticsEvent).where(lt(analyticsEvent.createdAt, cutoff)).run();
  }

  return new NextResponse(null, { status: 204 });
}
