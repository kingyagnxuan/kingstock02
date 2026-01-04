CREATE TABLE `invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inviterId` int NOT NULL,
	`inviteeId` int,
	`invitationCode` varchar(50) NOT NULL,
	`invitationLink` text NOT NULL,
	`status` enum('pending','completed','expired') NOT NULL DEFAULT 'pending',
	`inviterPointsRewarded` int NOT NULL DEFAULT 0,
	`inviteePointsRewarded` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`expiresAt` timestamp,
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_invitationCode_unique` UNIQUE(`invitationCode`)
);
--> statement-breakpoint
CREATE TABLE `pushLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pushNotificationId` int NOT NULL,
	`userId` int NOT NULL,
	`wechatId` varchar(100),
	`status` enum('pending','sent','failed','read') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`sentAt` timestamp,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pushLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pushNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockCode` varchar(10) NOT NULL,
	`stockName` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`buyRange` varchar(100) NOT NULL,
	`targetUsers` enum('all','premium','specific') NOT NULL DEFAULT 'all',
	`specificUserIds` text,
	`pushChannels` varchar(100) NOT NULL DEFAULT 'wechat',
	`status` enum('draft','scheduled','sent','cancelled') NOT NULL DEFAULT 'draft',
	`scheduledTime` timestamp,
	`sentTime` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`usedPoints` int NOT NULL DEFAULT 0,
	`availablePoints` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPoints_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planType` enum('free','monthly','yearly') NOT NULL DEFAULT 'free',
	`price` int NOT NULL DEFAULT 0,
	`pointsUsed` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive','expired','cancelled') NOT NULL DEFAULT 'active',
	`stripeSubscriptionId` varchar(255),
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`autoRenew` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSubscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `wechatId` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);