import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const leadSchema = z.object({
  leadIds: z.array(z.string()).optional(),
});

// GET: List leads in campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Verify campaign ownership
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: session.user.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    const [campaignLeads, total] = await Promise.all([
      prisma.campaignLead.findMany({
        where: { campaignId },
        include: { lead: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.campaignLead.count({ where: { campaignId } }),
    ]);

    return NextResponse.json({
      data: campaignLeads,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get campaign leads error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign leads' }, { status: 400 });
  }
}

// POST: Add leads to campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const body = await request.json();
    const { leadIds } = leadSchema.parse(body);

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json({ error: 'No lead IDs provided' }, { status: 400 });
    }

    // Verify campaign ownership
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: session.user.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Verify all leads belong to user
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds }, userId: session.user.id },
    });

    if (leads.length !== leadIds.length) {
      return NextResponse.json({ error: 'Some leads not found' }, { status: 404 });
    }

    // Create campaign leads (skip duplicates)
    const result = await prisma.campaignLead.createMany({
      data: leadIds.map((leadId) => ({ campaignId, leadId })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      data: { added: result.count },
    });
  } catch (error) {
    console.error('Add campaign leads error:', error);
    const message = error instanceof z.ZodError ? error.errors[0]?.message : 'Failed to add leads';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
