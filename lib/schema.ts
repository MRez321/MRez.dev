// lib/schema.ts
import {
    sqliteTable,
    text,
    integer,
    primaryKey,
    index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
    image: text("image"),
    role: text("role").notNull().default("user"),
    banned: integer("banned", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => user.id),
});

export const account = sqliteTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => user.id),
    accessToken: text("accessToken"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
});

export const verification = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }),
    updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

// --- Blog -------------------------------------------------------------------

export const postStatuses = ["draft", "published", "scheduled", "archived"] as const;
export type PostStatus = (typeof postStatuses)[number];

export const post = sqliteTable("post", {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull().default(""),
    coverImage: text("coverImage"),
    status: text("status", { enum: postStatuses }).notNull().default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    views: integer("views").notNull().default(0),
    publishedAt: integer("publishedAt", { mode: "timestamp" }),
    scheduledFor: integer("scheduledFor", { mode: "timestamp" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
    authorId: text("authorId")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const tag = sqliteTable("tag", {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
});

export const postTag = sqliteTable(
    "postTag",
    {
        postId: text("postId")
            .notNull()
            .references(() => post.id, { onDelete: "cascade" }),
        tagId: text("tagId")
            .notNull()
            .references(() => tag.id, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.postId, t.tagId] })]
);

export const postRelations = relations(post, ({ one, many }) => ({
    author: one(user, { fields: [post.authorId], references: [user.id] }),
    tags: many(postTag),
}));

export const postTagRelations = relations(postTag, ({ one }) => ({
    post: one(post, { fields: [postTag.postId], references: [post.id] }),
    tag: one(tag, { fields: [postTag.tagId], references: [tag.id] }),
}));

// --- Analytics --------------------------------------------------------------

/**
 * First-party event log fed by a sendBeacon from the client tracker
 * (`lib/analytics.ts`). Raw rows are aggregated in the admin dashboard;
 * old rows are pruned opportunistically by the tracking route.
 *
 * `createdAt` is stored in unix seconds (drizzle `timestamp` mode).
 */
export const analyticsEvent = sqliteTable(
    "analytics_event",
    {
        id: text("id").primaryKey(),
        /** "pageview" or a custom event name (signup, theme_toggle, ...). */
        name: text("name").notNull(),
        /** Client path, e.g. "/blog/foo". */
        path: text("path"),
        /** document.referrer at pageview time. */
        referrer: text("referrer"),
        /** Stable per-browser id from localStorage (no cookies). */
        visitorId: text("visitorId"),
        /** JSON object with event-specific fields. */
        props: text("props"),
        createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    },
    (t) => [index("analytics_event_name_createdAt_idx").on(t.name, t.createdAt)]
);

// --- Public API keys ---------------------------------------------------------

export const apiKeyStatuses = ["active", "revoked"] as const;
export type ApiKeyStatus = (typeof apiKeyStatuses)[number];

/**
 * API keys for the public v1 API (Bearer auth). Only the SHA-256 hash and a
 * short display prefix are stored — the raw key is shown exactly once at
 * creation time, never again.
 */
export const apiKey = sqliteTable(
    "api_key",
    {
        id: text("id").primaryKey(),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        /** Display prefix, e.g. "mrez_live_1a2b3c4d" — never the full key. */
        prefix: text("prefix").notNull(),
        /** SHA-256 hex of the full key; the only lookup column. */
        keyHash: text("keyHash").notNull().unique(),
        status: text("status", { enum: apiKeyStatuses }).notNull().default("active"),
        /** Max requests per minute (fixed window). */
        rateLimitPerMinute: integer("rateLimitPerMinute").notNull().default(60),
        /** Monthly request quota; 0 = unlimited. */
        monthlyRequests: integer("monthlyRequests").notNull().default(0),
        /** Monthly upload quota in bytes; 0 = unlimited. */
        monthlyBytes: integer("monthlyBytes").notNull().default(0),
        /** Max bytes for a single upload. */
        maxFileBytes: integer("maxFileBytes").notNull().default(10 * 1024 * 1024),
        lastUsedAt: integer("lastUsedAt", { mode: "timestamp" }),
        createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
        expiresAt: integer("expiresAt", { mode: "timestamp" }),
        revokedAt: integer("revokedAt", { mode: "timestamp" }),
    },
    (t) => [index("api_key_userId_idx").on(t.userId)]
);

/**
 * One row per authenticated v1 API request — the source of truth for monthly
 * quota accounting and per-key usage in the dashboard.
 */
export const apiKeyUsage = sqliteTable(
    "api_key_usage",
    {
        id: text("id").primaryKey(),
        keyId: text("keyId")
            .notNull()
            .references(() => apiKey.id, { onDelete: "cascade" }),
        endpoint: text("endpoint").notNull(),
        /** "ok" | "rejected" */
        status: text("status").notNull(),
        bytesIn: integer("bytesIn").notNull().default(0),
        bytesOut: integer("bytesOut").notNull().default(0),
        durationMs: integer("durationMs").notNull().default(0),
        createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    },
    (t) => [index("api_key_usage_keyId_createdAt_idx").on(t.keyId, t.createdAt)]
);

export const apiKeyRelations = relations(apiKey, ({ one, many }) => ({
    user: one(user, { fields: [apiKey.userId], references: [user.id] }),
    usage: many(apiKeyUsage),
}));

export const apiKeyUsageRelations = relations(apiKeyUsage, ({ one }) => ({
    key: one(apiKey, { fields: [apiKeyUsage.keyId], references: [apiKey.id] }),
}));