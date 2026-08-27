CREATE TABLE IF NOT EXISTS "AocLeaderboard" (
	"guildId" text NOT NULL,
	"result" jsonb NOT NULL,
	"updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ReferralCode" (
	"id" text PRIMARY KEY NOT NULL,
	"service" text NOT NULL,
	"code" text NOT NULL,
	"expiry_date" timestamp(3) NOT NULL,
	"guildId" text NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Reminder" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"onTimestamp" integer NOT NULL,
	"message" text NOT NULL,
	"guildId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ReputationLog" (
	"id" text PRIMARY KEY NOT NULL,
	"fromUserId" text NOT NULL,
	"toUserId" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"operation" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServerChannelsSettings" (
	"guildId" text NOT NULL,
	"reminderChannel" text,
	"autobumpThreads" text[] DEFAULT '{"RAY"}',
	"aocKey" text,
	"aocLeaderboardId" text,
	"honeypotChannel" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" text PRIMARY KEY NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReferralCode_userId_fkey') THEN
		ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Reminder_userId_fkey') THEN
		ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReputationLog_fromUserId_fkey') THEN
		ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReputationLog_toUserId_fkey') THEN
		ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
	END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "AocLeaderboard_guildId_idx" ON "AocLeaderboard" USING btree ("guildId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "AocLeaderboard_guildId_key" ON "AocLeaderboard" USING btree ("guildId" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Reminder_id_idx" ON "Reminder" USING btree ("id" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Reminder_userId_idx" ON "Reminder" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ServerChannelsSettings_guildId_idx" ON "ServerChannelsSettings" USING btree ("guildId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ServerChannelsSettings_guildId_key" ON "ServerChannelsSettings" USING btree ("guildId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ServerChannelsSettings_reminderChannel_key" ON "ServerChannelsSettings" USING btree ("reminderChannel" text_ops);

--> statement-breakpoint
DROP TABLE IF EXISTS "_prisma_migrations";