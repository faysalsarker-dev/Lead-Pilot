import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { getNextEmailBatch } from '@/lib/queue';

/**
 * Cron: Sends pending emails from the queue
 * Runs every 5 minutes
 * Verify CRON_SECRET in middleware.ts
 */
export async function POST(request: NextRequest) {
  try {
    // Middleware already verified CRON_SECRET
    const batch = await getNextEmailBatch(10);

    if (batch.length === 0) {
      return NextResponse.json({ data: { sent: 0, message: 'No emails to send' } });
    }

    let sent = 0;
    let failed = 0;

    for (const email of batch) {
      try {
        await sendEmail(email.mailboxId, email.lead.email, email.subject, email.body);

        // Mark as sent
        await (await import('@/lib/prisma')).default.emailQueue.update({
          where: { id: email.id },
          data: { status: 'SENT', sentAt: new Date() },
        });

        // Update campaign lead
        await (await import('@/lib/prisma')).default.campaignLead.updateMany({
          where: { leadId: email.leadId, campaignId: email.campaignId },
          data: { sentAt: new Date() },
        });

        sent++;
      } catch (error) {
        failed++;
        const prisma = (await import('@/lib/prisma')).default;
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            failReason: error instanceof Error ? error.message : String(error),
            retryCount: { increment: 1 },
          },
        });
      }
    }

    return NextResponse.json({
      data: { sent, failed, processed: batch.length },
    });
  } catch (error) {
    console.error('Send queue cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
