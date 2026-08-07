// lib/schema.ts
import {
    sqliteTable,
    text,
    integer,
    primaryKey,
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