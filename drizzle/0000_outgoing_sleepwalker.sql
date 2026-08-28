CREATE TABLE `delivery_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deliveryId` varchar(80) NOT NULL,
	`fileName` varchar(160) NOT NULL,
	`fileKey` text NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`sizeBytes` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delivery_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `delivery_files_user_created_idx` ON `delivery_files` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `delivery_files_delivery_idx` ON `delivery_files` (`deliveryId`);