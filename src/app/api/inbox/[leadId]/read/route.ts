import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leadId = params.leadId;

    // Verify lead ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Mark all replies as read
    await prisma.reply.updateMany({
      where: { leadId },
      data: { isRead: true },
    });

    // Mark conversation as read
    const conversation = await prisma.conversation.findUnique({
      where: { leadId },
    });

    if (conversation) {
      await prisma.conversation.update({
        where: { leadId },
        data: { isRead: true },
      });
    }

    return NextResponse.json({
      data: { success: true, message: 'Marked as read' },
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 400 });
  }
}
