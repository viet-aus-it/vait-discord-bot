DROP TABLE "_prisma_migrations";--> statement-breakpoint
ALTER TABLE "ReputationLog" DROP CONSTRAINT "ReputationLog_fromUserId_fkey";
--> statement-breakpoint
ALTER TABLE "ReputationLog" DROP CONSTRAINT "ReputationLog_toUserId_fkey";
--> statement-breakpoint
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userId_fkey";
--> statement-breakpoint
ALTER TABLE "ReputationLog" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "ServerChannelsSettings" ALTER COLUMN "autobumpThreads" DROP DEFAULT;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_fromUserId_User_id_fk" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_toUserId_User_id_fk" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
