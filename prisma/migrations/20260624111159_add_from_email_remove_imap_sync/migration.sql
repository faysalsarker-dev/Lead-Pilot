/*
  Warnings:

  - The values [SMTP_ERROR,IMAP_ERROR,AUTH_ERROR,RATE_LIMITED,DISCONNECTED] on the enum `MailboxStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLOUDFLARE_WORKER] on the enum `MailboxType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `imapUidNext` on the `Mailbox` table. All the data in the column will be lost.
  - You are about to drop the column `lastImapSync` on the `Mailbox` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MailboxStatus_new" AS ENUM ('UNTESTED', 'TESTING', 'CONNECTED', 'FAILED');
ALTER TABLE "public"."Mailbox" ALTER COLUMN "connectionStatus" DROP DEFAULT;
ALTER TABLE "Mailbox" ALTER COLUMN "connectionStatus" TYPE "MailboxStatus_new" USING ("connectionStatus"::text::"MailboxStatus_new");
ALTER TYPE "MailboxStatus" RENAME TO "MailboxStatus_old";
ALTER TYPE "MailboxStatus_new" RENAME TO "MailboxStatus";
DROP TYPE "public"."MailboxStatus_old";
ALTER TABLE "Mailbox" ALTER COLUMN "connectionStatus" SET DEFAULT 'UNTESTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MailboxType_new" AS ENUM ('GMAIL_IMAP', 'GMAIL_OAUTH', 'CUSTOM_SMTP');
ALTER TABLE "Mailbox" ALTER COLUMN "type" TYPE "MailboxType_new" USING ("type"::text::"MailboxType_new");
ALTER TYPE "MailboxType" RENAME TO "MailboxType_old";
ALTER TYPE "MailboxType_new" RENAME TO "MailboxType";
DROP TYPE "public"."MailboxType_old";
COMMIT;

-- DropIndex
DROP INDEX "Mailbox_imapEnabled_lastImapSync_idx";

-- AlterTable
ALTER TABLE "Mailbox" DROP COLUMN "imapUidNext",
DROP COLUMN "lastImapSync",
ADD COLUMN     "fromEmail" TEXT;

-- CreateIndex
CREATE INDEX "Mailbox_userId_imapEnabled_idx" ON "Mailbox"("userId", "imapEnabled");
