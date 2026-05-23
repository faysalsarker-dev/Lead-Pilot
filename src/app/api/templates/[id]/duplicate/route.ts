import { NextRequest } from 'next/server';
import { templateController } from '@/lib/api/controllers';

// POST /api/templates/[id]/duplicate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return templateController.duplicateTemplate(request, await params);
}
