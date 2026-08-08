CREATE TABLE `analytics_event` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`path` text,
	`referrer` text,
	`visitorId` text,
	`props` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_event_name_createdAt_idx` ON `analytics_event` (`name`,`createdAt`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_postTag` (
	`postId` text NOT NULL,
	`tagId` text NOT NULL,
	PRIMARY KEY(`postId`, `tagId`),
	FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_postTag`("postId", "tagId") SELECT "postId", "tagId" FROM `postTag`;--> statement-breakpoint
DROP TABLE `postTag`;--> statement-breakpoint
ALTER TABLE `__new_postTag` RENAME TO `postTag`;--> statement-breakpoint
PRAGMA foreign_keys=ON;