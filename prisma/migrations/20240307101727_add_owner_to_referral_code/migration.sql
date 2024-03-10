/*
  Warnings:

  - Added the required column `guildId` to the `ReferralCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ReferralCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ReferralCode_code_key";

-- AlterTable
ALTER TABLE "ReferralCode" ADD COLUMN     "guildId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
