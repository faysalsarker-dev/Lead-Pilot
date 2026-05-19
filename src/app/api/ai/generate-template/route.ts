import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const generateTemplateSchema = z.object({
  goal: z.string().min(10).max(500),
  templateType: z.enum(['INITIAL', 'FOLLOWUP_1', 'FOLLOWUP_2', 'FINAL']),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { goal, templateType } = generateTemplateSchema.parse(body);

    // Run template generator agent
    const { runTemplateGeneratorAgent } = await import('@/lib/agents/writer-agent');
    const template = await runTemplateGeneratorAgent(session.user.id, goal, templateType);

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error('AI generate template error:', error);
    const message = error instanceof z.ZodError ? error.errors[0]?.message : 'Template generation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
