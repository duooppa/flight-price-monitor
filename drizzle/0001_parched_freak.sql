CREATE TABLE `flightLegs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`flightId` int NOT NULL,
	`legIndex` int NOT NULL,
	`departure` timestamp NOT NULL,
	`arrival` timestamp NOT NULL,
	`origin` varchar(3) NOT NULL,
	`destination` varchar(3) NOT NULL,
	`segmentCount` int NOT NULL,
	`duration` int NOT NULL,
	CONSTRAINT `flightLegs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flightSearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionToken` varchar(255),
	`origin` varchar(3) NOT NULL,
	`destination` varchar(3) NOT NULL,
	`departureDate` varchar(10) NOT NULL,
	`returnDate` varchar(10),
	`adults` int DEFAULT 1,
	`cabinClass` varchar(20) DEFAULT 'economy',
	`status` enum('pending','completed','expired') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `flightSearches_id` PRIMARY KEY(`id`),
	CONSTRAINT `flightSearches_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `flightSegments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`legId` int NOT NULL,
	`segmentIndex` int NOT NULL,
	`departure` timestamp NOT NULL,
	`arrival` timestamp NOT NULL,
	`origin` varchar(3) NOT NULL,
	`destination` varchar(3) NOT NULL,
	`operatingCarrier` varchar(255),
	`flightNumber` varchar(10),
	`aircraft` varchar(10),
	`duration` int NOT NULL,
	CONSTRAINT `flightSegments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`searchId` int NOT NULL,
	`itineraryId` varchar(255) NOT NULL,
	`price` int NOT NULL,
	`currency` varchar(3) NOT NULL,
	`isDirectFlight` int NOT NULL,
	`stopCount` int DEFAULT 0,
	`totalDuration` int,
	`outboundDuration` int,
	`returnDuration` int,
	`airline` varchar(255),
	`deepLink` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`origin` varchar(3) NOT NULL,
	`destination` varchar(3) NOT NULL,
	`targetPrice` int NOT NULL,
	`currency` varchar(3) NOT NULL,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `priceAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`flightId` int NOT NULL,
	`price` int NOT NULL,
	`currency` varchar(3) NOT NULL,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`origin` varchar(3) NOT NULL,
	`destination` varchar(3) NOT NULL,
	`originName` text,
	`destinationName` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `routes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedRoutes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`origin` varchar(3) NOT NULL,
	`destination` varchar(3) NOT NULL,
	`originName` text,
	`destinationName` text,
	`name` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedRoutes_id` PRIMARY KEY(`id`)
);
