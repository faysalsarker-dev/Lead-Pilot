/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `enrichmentStatus` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `softDeleted` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `lastSendCountReset` on the `Mailbox` table. All the data in the column will be lost.
  - You are about to drop the column `sendCountToday` on the `Mailbox` table. All the data in the column will be lost.
  - You are about to drop the column `geminiApiKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `LeadTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EnrichmentStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('FACEBOOK', 'GOOGLE_MAPS', 'LINKEDIN', 'INSTAGRAM', 'TWITTER', 'REFERRAL', 'MANUAL', 'CSV_IMPORT', 'OTHER');

-- DropForeignKey
ALTER TABLE "LeadTag" DROP CONSTRAINT "LeadTag_leadId_fkey";

-- DropForeignKey
ALTER TABLE "LeadTag" DROP CONSTRAINT "LeadTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- DropIndex
DROP INDEX "Lead_softDeleted_idx";

-- DropIndex
DROP INDEX "Lead_userId_softDeleted_idx";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "deletedAt",
DROP COLUMN "enrichmentStatus",
DROP COLUMN "softDeleted",
DROP COLUMN "source";

-- AlterTable
ALTER TABLE "Mailbox" DROP COLUMN "lastSendCountReset",
DROP COLUMN "sendCountToday";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "geminiApiKey",
ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoggedInAt" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "LeadTag";

-- DropTable
DROP TABLE "Tag";
