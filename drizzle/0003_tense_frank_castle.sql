CREATE TABLE `avatars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user` ADD `avatar_url` text;