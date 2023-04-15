-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "onTimestamp" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_id_idx" ON "Reminder"("id");

-- CreateIndex
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");
