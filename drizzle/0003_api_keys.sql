CREATE TABLE `api_key` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`prefix` text NOT NULL,
	`keyHash` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`rateLimitPerMinute` integer DEFAULT 60 NOT NULL,
	`monthlyRequests` integer DEFAULT 0 NOT NULL,
	`monthlyBytes` integer DEFAULT 0 NOT NULL,
	`maxFileBytes` integer DEFAULT 10485760 NOT NULL,
	`lastUsedAt` integer,
	`createdAt` integer NOT NULL,
	`expiresAt` integer,
	`revokedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_key_keyHash_unique` ON `api_key` (`keyHash`);--> statement-breakpoint
CREATE INDEX `api_key_userId_idx` ON `api_key` (`userId`);--> statement-breakpoint
CREATE TABLE `api_key_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`keyId` text NOT NULL,
	`endpoint` text NOT NULL,
	`status` text NOT NULL,
	`bytesIn` integer DEFAULT 0 NOT NULL,
	`bytesOut` integer DEFAULT 0 NOT NULL,
	`durationMs` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`keyId`) REFERENCES `api_key`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `api_key_usage_keyId_createdAt_idx` ON `api_key_usage` (`keyId`,`createdAt`);