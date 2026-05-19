import prisma from '@/lib/prisma';
import { calculateScheduledAt } from '@/lib/scheduler';
import crypto from 'crypto';

/**
 * Creates pixel tracking token
 */
function generatePixelToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Builds email body with variable substitution
 * Supports: {{name}}, {{business}}, {{pain_point}}, {{your_name}}
 */
export function buildEmailBody(
  template: string,
  variables: {
    name?: string;
    business?: string;
    painPoint?: string;
    yourName?: string;
  }
): string {
  let body = template;

  if (variables.name) {
    body = body.replace(/\{\{name\}\}/g, variables.name);
  }
  if (variables.business) {
    body = body.replace(/\{\{business\}\}/g, variables.business);
  }
  if (variables.painPoint) {
    body = body.replace(/\{\{pain_point\}\}/g, variables.painPoint);
  }
  if (variables.yourName) {
    body = body.replace(/\{\{your_name\}\}/g, variables.yourName);
  }

  return body;
}

/**
 * Selects A/B subject line
 */
export function assignSubject(subjectA: string, subjectB: string | null | undefined): string {
  if (!subjectB) return subjectA;

  // 50/50 random selection
  return Math.random() < 0.5 ? subjectA : subjectB;
}

/**
 * Queues emails for a campaign
 * Creates EmailQueue rows with calculated UTC scheduledAt times
 */
export async function queueCampaignEmails(
  campaignId: string,
  leadIds: string[],
  templateType: 'INITIAL' | 'FOLLOWUP_1' | 'FOLLOWUP_2' | 'FINAL',
  baseTime: Date = new Date()
) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      initialTemplate: true,
      followup1Template: true,
      followup2Template: true,
      finalTemplate: true,
    },
  });

  if (!campaign) {
    throw new Error(`Campaign not found: ${campaignId}`);
  }

  // Select template based on type
  let template = null;
  if (templateType === 'INITIAL') {
    template = campaign.initialTemplate;
  } else if (templateType === 'FOLLOWUP_1') {
    template = campaign.followup1Template;
  } else if (templateType === 'FOLLOWUP_2') {
    template = campaign.followup2Template;
  } else if (templateType === 'FINAL') {
    template = campaign.finalTemplate;
  }

  if (!template) {
    throw new Error(`Template not found for ${templateType}`);
  }

  // Get user for your_name variable
  const user = await prisma.user.findUnique({
    where: { id: campaign.user.id },
  });

  // Create queue entries for each lead
  const queueEntries = await Promise.all(
    leadIds.map(async (leadId) => {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) return null;

      // Select subject (A/B test)
      const subject = assignSubject(template!.subjectA, template!.subjectB);

      // Build email body with variables
      const body = buildEmailBody(template!.body, {
        name: lead.name,
        business: lead.businessName,
        painPoint: lead.aiPainPoints || undefined,
        yourName: user?.name || 'Team',
      });

      // Generate pixel token
      const pixelToken = generatePixelToken();

      // Calculate scheduled time in UTC
      const scheduledAt = calculateScheduledAt(
        campaign.sendWindow,
        lead.timezone || 'UTC',
        baseTime
      );

      // Add staggered delay (2-5 minutes between emails)
      const staggerMinutes = Math.floor(Math.random() * 4) + 2;
      scheduledAt.setMinutes(scheduledAt.getMinutes() + staggerMinutes);

      return {
        campaignId,
        leadId,
        mailboxId: campaign.mailboxId,
        templateId: template!.id,
        templateType,
        subject,
        body,
        scheduledAt,
        // pixelToken is stored in body as img tag
      };
    })
  );

  // Filter out nulls and insert
  const validEntries = queueEntries.filter((e) => e !== null);

  if (validEntries.length > 0) {
    await prisma.emailQueue.createMany({
      data: validEntries,
    });
  }

  return validEntries.length;
}

/**
 * Cancels all pending follow-up emails for a lead
 */
export async function cancelPendingFollowups(leadId: string) {
  await prisma.emailQueue.updateMany({
    where: {
      leadId,
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
    },
  });
}

/**
 * Gets next batch of emails to send
 * Returns up to `batchSize` emails that are ready to send
 */
export async function getNextEmailBatch(batchSize: number = 10) {
  const now = new Date();

  return prisma.emailQueue.findMany({
    where: {
      status: 'PENDING',
      scheduledAt: {
        lte: now,
      },
    },
    include: {
      lead: true,
      mailbox: true,
      campaign: true,
    },
    take: batchSize,
  });
}
