import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const tagSchema = z.object({
  name: z.string().min(1).max(50),
});

// GET: List all tags for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: tags });
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 400 });
  }
}

// POST: Create new tag
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = tagSchema.parse(body);

    // Check for duplicates
    const existing = await prisma.tag.findFirst({
      where: { userId: session.user.id, name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Tag already exists' },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: { userId: session.user.id, name },
    });

    return NextResponse.json({ data: tag });
  } catch (error) {
    console.error('Create tag error:', error);
    const message = error instanceof z.ZodError ? error.errors[0]?.message : 'Failed to create tag';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
