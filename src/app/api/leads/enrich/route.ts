import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const enrichSchema = z.object({
  leadId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadId } = enrichSchema.parse(body);

    // Verify lead ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Trigger enricher agent
    const { runEnricherAgent } = await import('@/lib/agents/enricher-agent');
    await runEnricherAgent(leadId);

    return NextResponse.json({
      data: { success: true, message: 'Enrichment started' },
    });
  } catch (error) {
    console.error('Enrich error:', error);
    const message = error instanceof z.ZodError ? error.errors[0]?.message : 'Enrichment failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
