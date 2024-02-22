-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" text PRIMARY KEY NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL
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
CREATE TABLE IF NOT EXISTS "ReferralCode" (
	"id" text PRIMARY KEY NOT NULL,
	"service" text NOT NULL,
	"code" text NOT NULL,
	"expiry_date" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServerChannelsSettings" (
	"guildId" text NOT NULL,
	"reminderChannel" text,
	"autobumpThreads" text[] DEFAULT 'RRAY['
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
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralCode_code_key" ON "ReferralCode" ("code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ServerChannelsSettings_guildId_key" ON "ServerChannelsSettings" ("guildId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ServerChannelsSettings_reminderChannel_key" ON "ServerChannelsSettings" ("reminderChannel");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ServerChannelsSettings_guildId_idx" ON "ServerChannelsSettings" ("guildId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Reminder_id_idx" ON "Reminder" ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Reminder_userId_idx" ON "Reminder" ("userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/