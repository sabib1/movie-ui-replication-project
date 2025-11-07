CREATE TABLE `movies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`genre` text NOT NULL,
	`release_year` integer NOT NULL,
	`director` text NOT NULL,
	`rating` real NOT NULL,
	`poster_image_url` text NOT NULL,
	`description` text NOT NULL,
	`duration` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
