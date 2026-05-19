import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const draftReplySchema = z.object({
  leadId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId } = draftReplySchema.parse(body);

    // Verify lead ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Run writer agent to draft reply
    const { runWriterAgent } = await import('@/lib/agents/writer-agent');
    const draftText = await runWriterAgent(leadId, session.user.id);

    return NextResponse.json({ data: { draft: draftText } });
  } catch (error) {
    console.error('AI draft reply error:', error);
    const message = error instanceof Error ? error.message : 'Draft generation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
