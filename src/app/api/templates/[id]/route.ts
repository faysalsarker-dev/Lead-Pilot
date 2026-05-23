import { NextRequest } from 'next/server';
import { templateController } from '@/lib/api/controllers';

// GET /api/templates/[id]
// PUT /api/templates/[id]
// DELETE /api/templates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return templateController.getTemplateById(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return templateController.updateTemplate(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return templateController.deleteTemplate(request, await params);
}
