import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const tagUpdateSchema = z.object({
  name: z.string().min(1).max(50),
});

// PUT: Update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: tagId } = await params;
    const body = await request.json();
    const { name } = tagUpdateSchema.parse(body);

    // Verify ownership
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId: session.user.id },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const updated = await prisma.tag.update({
      where: { id: tagId },
      data: { name },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Update tag error:', error);
    const message = error instanceof z.ZodError ? error.errors[0]?.message : 'Failed to update tag';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE: Delete tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: tagId } = await params;

    // Verify ownership
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId: session.user.id },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Delete tag and all associations
    await prisma.leadTag.deleteMany({
      where: { tagId },
    });

    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 400 });
  }
}
