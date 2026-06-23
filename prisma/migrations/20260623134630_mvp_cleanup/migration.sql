/*
  Warnings:

  - You are about to drop the column `fromDomain` on the `Mailbox` table. All the data in the column will be lost.
  - You are about to drop the column `isWarmedUp` on the `Mailbox` table. All the data in the column will be lost.
  - You are about to drop the column `lastWebhookAt` on the `Mailbox` table. All the data in the column will be lost.
  - You are about to drop the column `warmupStartedAt` on the `Mailbox` table. All the data in the column will be lost.
  - You are about to drop the column `webhookVerified` on the `Mailbox` table. All the data in the column will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reply` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AgentJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'SENT', 'SKIPPED');

-- AlterEnum
ALTER TYPE "LeadSource" ADD VALUE 'AI_AGENT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'FOLLOWUP_DUE';
ALTER TYPE "NotificationType" ADD VALUE 'AI_AGENT_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'AI_AGENT_FAILED';

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_leadId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_leadId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_mailboxId_fkey";

-- DropIndex
DROP INDEX "Mailbox_fromDomain_idx";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "category" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "EmailQueue" ADD COLUMN     "bodyHash" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "Mailbox" DROP COLUMN "fromDomain",
DROP COLUMN "isWarmedUp",
DROP COLUMN "lastWebhookAt",
DROP COLUMN "warmupStartedAt",
DROP COLUMN "webhookVerified";

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "usedVariables" TEXT[];

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "Reply";

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAgentJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT,
    "category" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT NOT NULL,
    "maxResults" INTEGER NOT NULL DEFAULT 50,
    "status" "AgentJobStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMsg" TEXT,
    "totalFound" INTEGER NOT NULL DEFAULT 0,
    "totalSaved" INTEGER NOT NULL DEFAULT 0,
    "totalSkipped" INTEGER NOT NULL DEFAULT 0,
    "outputFile" TEXT,
    "importedAt" TIMESTAMP(3),
    "importedToCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIAgentJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FollowUp_userId_idx" ON "FollowUp"("userId");

-- CreateIndex
CREATE INDEX "FollowUp_leadId_idx" ON "FollowUp"("leadId");

-- CreateIndex
CREATE INDEX "FollowUp_scheduledAt_idx" ON "FollowUp"("scheduledAt");

-- CreateIndex
CREATE INDEX "FollowUp_status_idx" ON "FollowUp"("status");

-- CreateIndex
CREATE INDEX "FollowUp_userId_status_idx" ON "FollowUp"("userId", "status");

-- CreateIndex
CREATE INDEX "FollowUp_userId_scheduledAt_idx" ON "FollowUp"("userId", "scheduledAt");

-- CreateIndex
CREATE INDEX "AIAgentJob_userId_idx" ON "AIAgentJob"("userId");

-- CreateIndex
CREATE INDEX "AIAgentJob_campaignId_idx" ON "AIAgentJob"("campaignId");

-- CreateIndex
CREATE INDEX "AIAgentJob_status_idx" ON "AIAgentJob"("status");

-- CreateIndex
CREATE INDEX "AIAgentJob_userId_status_idx" ON "AIAgentJob"("userId", "status");

-- CreateIndex
CREATE INDEX "AIAgentJob_createdAt_idx" ON "AIAgentJob"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_tags_idx" ON "Lead"("tags");

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAgentJob" ADD CONSTRAINT "AIAgentJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAgentJob" ADD CONSTRAINT "AIAgentJob_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
