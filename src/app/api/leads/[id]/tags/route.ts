import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const tagSchema = z.object({
  name: z.string().min(1).max(50),
});

// POST: Add tag to lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leadId } = await params;
    const body = await request.json();
    const { name } = tagSchema.parse(body);

    // Verify lead ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Find or create tag
    let tag = await prisma.tag.findFirst({
      where: { userId: session.user.id, name },
    });

    if (!tag) {
      tag = await prisma.tag.create({
        data: { userId: session.user.id, name },
      });
    }

    // Add tag to lead
    await prisma.leadTag.create({
      data: { leadId, tagId: tag.id },
    });

    return NextResponse.json({ data: { tag } });
  } catch (error) {
    console.error('Tag error:', error);
    const message = error instanceof z.ZodError ? error.errors[0]?.message : 'Failed to add tag';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE: Remove tag from lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leadId } = await params;
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    if (!tagId) {
      return NextResponse.json({ error: 'tagId required' }, { status: 400 });
    }

    // Verify lead ownership and tag ownership
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: session.user.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId: session.user.id },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Remove tag from lead
    await prisma.leadTag.deleteMany({
      where: { leadId, tagId },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json({ error: 'Failed to remove tag' }, { status: 400 });
  }
}
