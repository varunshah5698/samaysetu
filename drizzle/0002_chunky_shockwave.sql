CREATE TABLE `delivery_notification_outbox` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deliveryId` int NOT NULL,
	`trackingCode` varchar(40) NOT NULL,
	`eventType` varchar(40) NOT NULL,
	`channels` varchar(64) NOT NULL,
	`providerState` enum('provider_required','queued') NOT NULL DEFAULT 'provider_required',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delivery_notification_outbox_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `delivery_notification_delivery_idx` ON `delivery_notification_outbox` (`deliveryId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `delivery_notification_state_idx` ON `delivery_notification_outbox` (`providerState`,`createdAt`);