-- CreateTable
CREATE TABLE "ServerChannelsSettings" (
    "guildId" TEXT NOT NULL,
    "reminderChannel" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "ServerChannelsSettings_guildId_key" ON "ServerChannelsSettings"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "ServerChannelsSettings_reminderChannel_key" ON "ServerChannelsSettings"("reminderChannel");

-- CreateIndex
CREATE INDEX "ServerChannelsSettings_guildId_idx" ON "ServerChannelsSettings"("guildId");
