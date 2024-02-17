/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `ReferralCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");
