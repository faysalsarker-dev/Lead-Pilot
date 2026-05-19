import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Cron: Resets send counts for mailboxes
 * Runs daily at midnight
 * Verify CRON_SECRET in middleware.ts
 */
export async function POST(request: NextRequest) {
  try {
    // Reset send counts on all mailboxes
    const result = await prisma.mailbox.updateMany({
      data: {
        sendCountToday: 0,
        lastSendCountReset: new Date(),
      },
    });

    // Mark bounced campaigns as auto-paused if bounce rate is high
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'RUNNING' },
    });

    let autoPaused = 0;

    for (const campaign of campaigns) {
      const bounceRate = campaign.totalSent > 0 ? (campaign.totalBounced / campaign.totalSent) * 100 : 0;

      if (bounceRate > 5) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'PAUSED',
            autoPaused: true,
          },
        });

        await prisma.notification.create({
          data: {
            userId: campaign.userId,
            campaignId: campaign.id,
            type: 'CAMPAIGN_PAUSED',
            message: `Campaign auto-paused: bounce rate ${bounceRate.toFixed(1)}% exceeded 5% threshold`,
          },
        });

        autoPaused++;
      }
    }

    return NextResponse.json({
      data: { resetCount: result.count, autoPaused, message: 'Send counts reset' },
    });
  } catch (error) {
    console.error('Reset send counts cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
