import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: mailboxId } = await params;

    // Verify ownership
    const mailbox = await prisma.mailbox.findFirst({
      where: { id: mailboxId, userId: session.user.id },
    });

    if (!mailbox) {
      return NextResponse.json({ error: 'Mailbox not found' }, { status: 404 });
    }

    // Test both SMTP and IMAP connections
    const { testSmtp } = await import('@/lib/mailer');
    const { testImap } = await import('@/lib/imap');

    let smtpOk = false;
    let imapOk = false;
    const errors = [];

    try {
      smtpOk = await testSmtp(mailboxId);
    } catch (error) {
      errors.push(`SMTP test failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      imapOk = await testImap(mailboxId);
    } catch (error) {
      errors.push(`IMAP test failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (!smtpOk || !imapOk) {
      return NextResponse.json(
        {
          error: 'Connection test failed',
          details: { smtpOk, imapOk, errors },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: { smtpOk, imapOk, message: 'All connections working' },
    });
  } catch (error) {
    console.error('Test mailbox error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 400 });
  }
}
