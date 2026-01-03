CREATE TABLE `aiConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`stockCode` varchar(10),
	`model` varchar(50) DEFAULT 'gpt-4',
	`systemPrompt` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketInsights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`outlook` text NOT NULL,
	`strategy` text NOT NULL,
	`hotSectors` text NOT NULL,
	`riskFactors` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketInsights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stockRecommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stockCode` varchar(10) NOT NULL,
	`stockName` varchar(100) NOT NULL,
	`recommendationType` enum('buy','hold','sell') NOT NULL,
	`targetPrice` varchar(20),
	`stopLoss` varchar(20),
	`reason` text NOT NULL,
	`recommendDate` timestamp NOT NULL DEFAULT (now()),
	`currentPrice` varchar(20),
	`priceChangePercent` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stockRecommendations_id` PRIMARY KEY(`id`)
);
