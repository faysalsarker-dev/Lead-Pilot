import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { queueCampaignEmails } from '@/lib/queue';
import { addDaysInTimezone } from '@/lib/scheduler';

/**
 * Cron: Queues follow-up emails that are due
 * Runs daily at 9am
 * Verify CRON_SECRET in middleware.ts
 */
export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    // Find campaigns that are running
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'RUNNING' },
      include: { campaignLeads: true },
    });

    let followupsQueued = 0;

    for (const campaign of campaigns) {
      for (const campaignLead of campaign.campaignLeads) {
        // Check if follow-up 1 is due
        if (!campaignLead.followup1SentAt && campaignLead.sentAt) {
          const dueDate = addDaysInTimezone(
            campaignLead.sentAt,
            campaign.followup1Days,
            (await prisma.lead.findUnique({ where: { id: campaignLead.leadId } }))?.timezone || 'UTC'
          );

          if (dueDate <= now) {
            await queueCampaignEmails(campaign.id, [campaignLead.leadId], 'FOLLOWUP_1');
            followupsQueued++;
          }
        }

        // Check if follow-up 2 is due
        if (!campaignLead.followup2SentAt && campaignLead.followup1SentAt) {
          const dueDate = addDaysInTimezone(
            campaignLead.followup1SentAt,
            campaign.followup2Days,
            (await prisma.lead.findUnique({ where: { id: campaignLead.leadId } }))?.timezone || 'UTC'
          );

          if (dueDate <= now) {
            await queueCampaignEmails(campaign.id, [campaignLead.leadId], 'FOLLOWUP_2');
            followupsQueued++;
          }
        }

        // Check if final follow-up is due
        if (!campaignLead.finalSentAt && campaignLead.followup2SentAt) {
          const dueDate = addDaysInTimezone(
            campaignLead.followup2SentAt,
            campaign.finalDays,
            (await prisma.lead.findUnique({ where: { id: campaignLead.leadId } }))?.timezone || 'UTC'
          );

          if (dueDate <= now) {
            await queueCampaignEmails(campaign.id, [campaignLead.leadId], 'FINAL');
            followupsQueued++;
          }
        }
      }
    }

    return NextResponse.json({
      data: { followupsQueued, message: 'Follow-ups scheduled' },
    });
  } catch (error) {
    console.error('Followups cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
