import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsEvent } from "@/lib/schema";

export const TRAFFIC_RANGE_DAYS = 30;
export const CHART_DAYS = 14;

export type TrafficStats = {
  pageviews: number;
  visitors: number;
  events: number;
  todayPageviews: number;
  daily: { day: string; pageviews: number; events: number }[];
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  eventBreakdown: { name: string; count: number }[];
};

/** Aggregates over the first-party analytics_event log (30-day window). */
export async function getTrafficStats(): Promise<TrafficStats> {
  const since = new Date(Date.now() - TRAFFIC_RANGE_DAYS * 24 * 60 * 60 * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totals, todayCount, daily, topPages, topReferrers, eventBreakdown] = await Promise.all([
    db
      .select({
        pageviews: sql<number>`SUM(CASE WHEN ${analyticsEvent.name} = 'pageview' THEN 1 ELSE 0 END)`,
        visitors: sql<number>`COUNT(DISTINCT ${analyticsEvent.visitorId})`,
        events: sql<number>`COUNT(*)`,
      })
      .from(analyticsEvent)
      .where(gte(analyticsEvent.createdAt, since)),
    db
      .select({ value: count() })
      .from(analyticsEvent)
      .where(and(eq(analyticsEvent.name, "pageview"), gte(analyticsEvent.createdAt, today))),
    db
      .select({
        day: sql<string>`strftime('%Y-%m-%d', ${analyticsEvent.createdAt}, 'unixepoch')`,
        pageviews: sql<number>`SUM(CASE WHEN ${analyticsEvent.name} = 'pageview' THEN 1 ELSE 0 END)`,
        events: sql<number>`COUNT(*)`,
      })
      .from(analyticsEvent)
      .where(gte(analyticsEvent.createdAt, since))
      .groupBy(sql`strftime('%Y-%m-%d', ${analyticsEvent.createdAt}, 'unixepoch')`)
      .orderBy(asc(sql`strftime('%Y-%m-%d', ${analyticsEvent.createdAt}, 'unixepoch')`)),
    db
      .select({ path: analyticsEvent.path, views: count() })
      .from(analyticsEvent)
      .where(and(eq(analyticsEvent.name, "pageview"), gte(analyticsEvent.createdAt, since)))
      .groupBy(analyticsEvent.path)
      .orderBy(desc(count()))
      .limit(10),
    db
      .select({ referrer: analyticsEvent.referrer, views: count() })
      .from(analyticsEvent)
      .where(
        and(
          eq(analyticsEvent.name, "pageview"),
          sql`${analyticsEvent.referrer} IS NOT NULL AND ${analyticsEvent.referrer} != ''`,
          gte(analyticsEvent.createdAt, since)
        )
      )
      .groupBy(analyticsEvent.referrer)
      .orderBy(desc(count()))
      .limit(8),
    db
      .select({ name: analyticsEvent.name, count: count() })
      .from(analyticsEvent)
      .where(
        and(sql`${analyticsEvent.name} != 'pageview'`, gte(analyticsEvent.createdAt, since))
      )
      .groupBy(analyticsEvent.name)
      .orderBy(desc(count())),
  ]);

  const first = totals[0];
  return {
    pageviews: first?.pageviews ?? 0,
    visitors: first?.visitors ?? 0,
    events: first?.events ?? 0,
    todayPageviews: todayCount[0]?.value ?? 0,
    daily: daily.map((d) => ({
      day: d.day ?? "",
      pageviews: d.pageviews ?? 0,
      events: d.events ?? 0,
    })),
    topPages: topPages
      .map((p) => ({ path: p.path ?? "/", views: p.views }))
      .filter((p) => p.views > 0),
    topReferrers: topReferrers
      .map((r) => ({ referrer: r.referrer ?? "", views: r.views }))
      .filter((r) => r.views > 0),
    eventBreakdown: eventBreakdown.map((e) => ({ name: e.name, count: e.count })),
  };
}
