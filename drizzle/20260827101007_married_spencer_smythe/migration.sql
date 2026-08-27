CREATE TABLE "AocLeaderboard" (
	"guildId" text NOT NULL,
	"result" jsonb NOT NULL,
	"updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ReferralCode" (
	"id" text PRIMARY KEY NOT NULL,
	"service" text NOT NULL,
	"code" text NOT NULL,
	"expiry_date" timestamp(3) NOT NULL,
	"guildId" text NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Reminder" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"onTimestamp" integer NOT NULL,
	"message" text NOT NULL,
	"guildId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ReputationLog" (
	"id" text PRIMARY KEY NOT NULL,
	"fromUserId" text NOT NULL,
	"toUserId" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"operation" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ServerChannelsSettings" (
	"guildId" text NOT NULL,
	"reminderChannel" text,
	"autobumpThreads" text[] DEFAULT '{"RAY"}',
	"aocKey" text,
	"aocLeaderboardId" text,
	"honeypotChannel" text
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "AocLeaderboard_guildId_idx" ON "AocLeaderboard" USING btree ("guildId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "AocLeaderboard_guildId_key" ON "AocLeaderboard" USING btree ("guildId" text_ops);--> statement-breakpoint
CREATE INDEX "Reminder_id_idx" ON "Reminder" USING btree ("id" text_ops);--> statement-breakpoint
CREATE INDEX "Reminder_userId_idx" ON "Reminder" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "ServerChannelsSettings_guildId_idx" ON "ServerChannelsSettings" USING btree ("guildId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ServerChannelsSettings_guildId_key" ON "ServerChannelsSettings" USING btree ("guildId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ServerChannelsSettings_reminderChannel_key" ON "ServerChannelsSettings" USING btree ("reminderChannel" text_ops);

--> statement-breakpoint
DROP TABLE IF EXISTS "_prisma_migrations";