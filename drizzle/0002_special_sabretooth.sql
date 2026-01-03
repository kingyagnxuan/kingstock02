CREATE TABLE `uploadedFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`messageId` int,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`s3Key` varchar(500) NOT NULL,
	`s3Url` text NOT NULL,
	`extractedText` text,
	`analysisResult` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploadedFiles_id` PRIMARY KEY(`id`)
);
