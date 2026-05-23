/*
  Warnings:

  - A unique constraint covering the columns `[userId,label]` on the table `Mailbox` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MailboxStatus" AS ENUM ('UNTESTED', 'CONNECTED', 'SMTP_ERROR', 'IMAP_ERROR', 'AUTH_ERROR', 'RATE_LIMITED', 'DISCONNECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MailboxType" ADD VALUE 'CLOUDFLARE_WORKER';
ALTER TYPE "MailboxType" ADD VALUE 'GMAIL_IMAP';

-- DropIndex
DROP INDEX "Mailbox_isActive_idx";

-- DropIndex
DROP INDEX "Mailbox_isDefault_idx";

-- DropIndex
DROP INDEX "Mailbox_type_idx";

-- AlterTable
ALTER TABLE "Mailbox" ADD COLUMN     "connectionStatus" "MailboxStatus" NOT NULL DEFAULT 'UNTESTED',
ADD COLUMN     "dailySendLimit" INTEGER NOT NULL DEFAULT 400,
ADD COLUMN     "fromDomain" TEXT,
ADD COLUMN     "fromName" TEXT,
ADD COLUMN     "gmailEmail" TEXT,
ADD COLUMN     "imapEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imapSsl" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "imapUidNext" INTEGER,
ADD COLUMN     "isWarmedUp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "lastSentAt" TIMESTAMP(3),
ADD COLUMN     "lastTestedAt" TIMESTAMP(3),
ADD COLUMN     "lastWebhookAt" TIMESTAMP(3),
ADD COLUMN     "replyTo" TEXT,
ADD COLUMN     "sendCountToday" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "smtpSsl" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "warmupStartedAt" TIMESTAMP(3),
ADD COLUMN     "webhookVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Mailbox_userId_isDefault_idx" ON "Mailbox"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "Mailbox_userId_type_idx" ON "Mailbox"("userId", "type");

-- CreateIndex
CREATE INDEX "Mailbox_imapEnabled_lastImapSync_idx" ON "Mailbox"("imapEnabled", "lastImapSync");

-- CreateIndex
CREATE INDEX "Mailbox_fromDomain_idx" ON "Mailbox"("fromDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Mailbox_userId_label_key" ON "Mailbox"("userId", "label");
