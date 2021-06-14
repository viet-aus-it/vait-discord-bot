-- AlterTable
ALTER TABLE "ReputationLog" ADD COLUMN     "operation" JSONB NOT NULL DEFAULT E'{}';
