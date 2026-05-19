-- AddColumn enrichmentStatus to Lead
ALTER TABLE "Lead" ADD COLUMN "enrichmentStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AddColumn source to Lead  
ALTER TABLE "Lead" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'MANUAL';

-- AddColumns for soft delete
ALTER TABLE "Lead" ADD COLUMN "softDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AddColumns to Mailbox for send tracking
ALTER TABLE "Mailbox" ADD COLUMN "sendCountToday" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Mailbox" ADD COLUMN "lastSendCountReset" TIMESTAMP(3);

-- AddColumn geminiApiKey to User (encrypted)
ALTER TABLE "User" ADD COLUMN "geminiApiKey" TEXT;

-- CreateTable for Tag model
CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable for LeadTag model
CREATE TABLE "LeadTag" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LeadTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for Tag
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex for LeadTag
CREATE INDEX "LeadTag_leadId_idx" ON "LeadTag"("leadId");
CREATE INDEX "LeadTag_tagId_idx" ON "LeadTag"("tagId");
CREATE UNIQUE INDEX "LeadTag_leadId_tagId_key" ON "LeadTag"("leadId", "tagId");

-- Add foreign keys
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadTag" ADD CONSTRAINT "LeadTag_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadTag" ADD CONSTRAINT "LeadTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index for soft delete filtering
CREATE INDEX "Lead_softDeleted_idx" ON "Lead"("softDeleted");
CREATE INDEX "Lead_userId_softDeleted_idx" ON "Lead"("userId", "softDeleted");
