import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail } from '@/lib/mailer';

const replySchema = z.object({
  body: z.string().min(10),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leadId = params.leadId;
    const body = await request.json();
    const { body: replyText } = replySchema.parse(body);

    // Verify lead ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get default mailbox
    const mailbox = await prisma.mailbox.findFirst({
      where: { userId: session.user.id, isDefault: true, isActive: true },
    });

    if (!mailbox) {
      return NextResponse.json({ error: 'No active mailbox configured' }, { status: 400 });
    }

    // Get last email subject for threading
    const lastReply = await prisma.reply.findFirst({
      where: { leadId },
      orderBy: { receivedAt: 'desc' },
    });

    const subject = lastReply?.subject ? `Re: ${lastReply.subject}` : `Re: Your inquiry`;

    // Send email
    await sendEmail(mailbox.id, lead.email, subject, replyText);

    // Add to conversation
    let conversation = await prisma.conversation.findUnique({
      where: { leadId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { leadId },
      });
    }

    // Append to messages
    const messages = (conversation.messages as any[]) || [];
    messages.push({
      role: 'user',
      body: replyText,
      subject,
      sentAt: new Date(),
    });

    await prisma.conversation.update({
      where: { leadId },
      data: { messages },
    });

    // Mark conversation as read
    await prisma.conversation.update({
      where: { leadId },
      data: { isRead: true },
    });

    return NextResponse.json({
      data: { success: true, message: 'Reply sent' },
    });
  } catch (error) {
    console.error('Send reply error:', error);
    const message = error instanceof z.ZodError ? error.errors[0]?.message : 'Failed to send reply';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
