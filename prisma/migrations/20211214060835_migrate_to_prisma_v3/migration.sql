-- DropForeignKey
ALTER TABLE "ReputationLog" DROP CONSTRAINT "ReputationLog_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "ReputationLog" DROP CONSTRAINT "ReputationLog_toUserId_fkey";

-- AddForeignKey
ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
