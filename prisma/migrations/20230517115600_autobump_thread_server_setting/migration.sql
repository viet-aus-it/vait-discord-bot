-- AlterTable
ALTER TABLE "ServerChannelsSettings" ADD COLUMN     "autobumpThreads" TEXT[] DEFAULT ARRAY[]::TEXT[];
