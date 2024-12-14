-- AlterTable
ALTER TABLE "ServerChannelsSettings" ADD COLUMN     "aocKey" TEXT,
ADD COLUMN     "aocLeaderboardId" TEXT;

-- CreateTable
CREATE TABLE "AocLeaderboard" (
    "guildId" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AocLeaderboard_guildId_key" ON "AocLeaderboard"("guildId");

-- CreateIndex
CREATE INDEX "AocLeaderboard_guildId_idx" ON "AocLeaderboard"("guildId");
