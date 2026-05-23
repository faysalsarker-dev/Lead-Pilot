/*
  Warnings:

  - You are about to drop the column `aiEnriched` on the `Lead` table. All the data in the column will be lost.
  - The `aiPainPoints` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,email]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('SERVICE', 'PROJECT');

-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('UNKNOWN', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadSource" ADD VALUE 'TIKTOK';
ALTER TYPE "LeadSource" ADD VALUE 'FACEBOOK_ADS';
ALTER TYPE "LeadSource" ADD VALUE 'COLD_CALL';
ALTER TYPE "LeadSource" ADD VALUE 'EVENT';

-- AlterEnum
ALTER TYPE "LeadStatus" ADD VALUE 'GHOST';

-- DropIndex
DROP INDEX "Lead_aiEnriched_idx";

-- DropIndex
DROP INDEX "Lead_email_idx";

-- DropIndex
DROP INDEX "Lead_hasReplied_idx";

-- DropIndex
DROP INDEX "Lead_isActive_idx";

-- DropIndex
DROP INDEX "Lead_status_idx";

-- DropIndex
DROP INDEX "Lead_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "aiEnriched",
ADD COLUMN     "aiAdCopy" TEXT,
ADD COLUMN     "area" TEXT,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "budgetRange" "BudgetRange",
ADD COLUMN     "capturedAt" TIMESTAMP(3),
ADD COLUMN     "capturedFrom" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enrichmentError" TEXT,
ADD COLUMN     "enrichmentStatus" "EnrichmentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "googleMapsPlaceId" TEXT,
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "instagramHandle" TEXT,
ADD COLUMN     "internalLabel" TEXT,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "lastContactedAt" TIMESTAMP(3),
ADD COLUMN     "lastReplyAt" TIMESTAMP(3),
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "observedProblems" TEXT[],
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "quickNote" TEXT,
ADD COLUMN     "softDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" "LeadSource",
ADD COLUMN     "statusUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tiktokHandle" TEXT,
ADD COLUMN     "totalEmailsSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twitterHandle" TEXT,
ADD COLUMN     "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "urgency" "Urgency",
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "whatsappOptedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workType" "WorkType",
ADD COLUMN     "youtubeUrl" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "aiPainPoints",
ADD COLUMN     "aiPainPoints" TEXT[];

-- CreateIndex
CREATE INDEX "Lead_userId_source_idx" ON "Lead"("userId", "source");

-- CreateIndex
CREATE INDEX "Lead_userId_priority_idx" ON "Lead"("userId", "priority");

-- CreateIndex
CREATE INDEX "Lead_userId_isActive_idx" ON "Lead"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Lead_userId_isInterested_idx" ON "Lead"("userId", "isInterested");

-- CreateIndex
CREATE INDEX "Lead_userId_isPinned_idx" ON "Lead"("userId", "isPinned");

-- CreateIndex
CREATE INDEX "Lead_userId_workType_idx" ON "Lead"("userId", "workType");

-- CreateIndex
CREATE INDEX "Lead_userId_enrichmentStatus_idx" ON "Lead"("userId", "enrichmentStatus");

-- CreateIndex
CREATE INDEX "Lead_userId_softDeleted_idx" ON "Lead"("userId", "softDeleted");

-- CreateIndex
CREATE INDEX "Lead_userId_campaignRunning_idx" ON "Lead"("userId", "campaignRunning");

-- CreateIndex
CREATE INDEX "Lead_statusUpdatedAt_idx" ON "Lead"("statusUpdatedAt");

-- CreateIndex
CREATE INDEX "Lead_observedProblems_idx" ON "Lead"("observedProblems");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_userId_email_key" ON "Lead"("userId", "email");
