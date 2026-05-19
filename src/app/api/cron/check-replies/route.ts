import { NextRequest, NextResponse } from 'next/server';
import { scanMailbox } from '@/lib/imap';
import prisma from '@/lib/prisma';

/**
 * Cron: Scans IMAP mailboxes for new replies
 * Runs every 10 minutes
 * Verify CRON_SECRET in middleware.ts
 */
export async function POST(request: NextRequest) {
  try {
    // Get all active mailboxes
    const mailboxes = await prisma.mailbox.findMany({
      where: { isActive: true },
    });

    let scanned = 0;
    let repliesFound = 0;

    for (const mailbox of mailboxes) {
      try {
        await scanMailbox(mailbox.id);
        scanned++;
      } catch (error) {
        console.error(`Failed to scan mailbox ${mailbox.id}:`, error);
        // Continue with other mailboxes
      }
    }

    // Count new replies since last cron
    const recentReplies = await prisma.reply.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      },
    });

    repliesFound = recentReplies.length;

    return NextResponse.json({
      data: { scanned, repliesFound, message: 'Mailboxes scanned' },
    });
  } catch (error) {
    console.error('Check replies cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
