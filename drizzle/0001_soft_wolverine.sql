CREATE TABLE `deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackingCode` varchar(40) NOT NULL,
	`area` varchar(180) NOT NULL,
	`latitude` varchar(32) NOT NULL,
	`longitude` varchar(32) NOT NULL,
	`requestedDay` varchar(16) NOT NULL,
	`preferredTime` varchar(8) NOT NULL,
	`selectedSlot` varchar(32) NOT NULL,
	`predictedScore` int NOT NULL,
	`status` enum('booked','assigned','out_for_delivery','delivered','rescheduled') NOT NULL DEFAULT 'booked',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `deliveries_trackingCode_unique` UNIQUE(`trackingCode`)
);
--> statement-breakpoint
CREATE TABLE `delivery_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deliveryId` int NOT NULL,
	`eventType` varchar(40) NOT NULL,
	`note` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delivery_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `deliveries_status_idx` ON `deliveries` (`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `deliveries_tracking_idx` ON `deliveries` (`trackingCode`);--> statement-breakpoint
CREATE INDEX `delivery_events_delivery_idx` ON `delivery_events` (`deliveryId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `delivery_events_created_idx` ON `delivery_events` (`createdAt`);