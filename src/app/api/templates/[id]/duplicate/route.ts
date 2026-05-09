import { NextRequest } from 'next/server';
import { templateController } from '@/backend/controllers';

// POST /api/templates/[id]/duplicate
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return templateController.duplicateTemplate(request, params);
}
