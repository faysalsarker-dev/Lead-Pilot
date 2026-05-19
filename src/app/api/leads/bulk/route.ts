import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const bulkSchema = z.object({
  leadIds: z.array(z.string()).min(1),
  status: z.enum(['NEW', 'CONTACTED', 'ACTIVE', 'INTERESTED', 'CONVERTED', 'REJECTED']),
});

// PUT: Update status for multiple leads
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leadIds, status } = bulkSchema.parse(body);

    // Verify all leads belong to user
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds }, userId: session.user.id },
    });

    if (leads.length !== leadIds.length) {
      return NextResponse.json({ error: 'Some leads not found' }, { status: 404 });
    }

    // Update status
    const result = await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { status },
    });

    return NextResponse.json({
      data: { updated: result.count },
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    const message = error instanceof z.ZodError ? error.errors[0]?.message : 'Bulk update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE: Soft delete multiple leads
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadIds = searchParams.get('ids')?.split(',') || [];

    if (leadIds.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    // Verify all leads belong to user
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds }, userId: session.user.id },
    });

    if (leads.length !== leadIds.length) {
      return NextResponse.json({ error: 'Some leads not found' }, { status: 404 });
    }

    // Soft delete
    const result = await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { softDeleted: true, deletedAt: new Date() },
    });

    return NextResponse.json({
      data: { deleted: result.count },
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json({ error: 'Bulk delete failed' }, { status: 400 });
  }
}
