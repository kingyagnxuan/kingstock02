CREATE TABLE `reportRecommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`stockCode` varchar(10) NOT NULL,
	`stockName` varchar(100) NOT NULL,
	`currentPrice` varchar(20) NOT NULL,
	`buyRange` varchar(50) NOT NULL,
	`targetPrice` varchar(20) NOT NULL,
	`stopLossPrice` varchar(20) NOT NULL,
	`reason` text NOT NULL,
	`technicalAnalysis` text,
	`fundamentalAnalysis` text,
	`riskLevel` enum('low','medium','high') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reportRecommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `researchReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`reportType` enum('stock','sector','industry') NOT NULL,
	`targetCode` varchar(50) NOT NULL,
	`targetName` varchar(100) NOT NULL,
	`summary` text NOT NULL,
	`fullContent` text NOT NULL,
	`marketSentiment` varchar(50),
	`sectorHotspots` text,
	`capitalFlow` text,
	`policyBenefits` text,
	`recommendations` text NOT NULL,
	`riskFactors` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `researchReports_id` PRIMARY KEY(`id`)
);
