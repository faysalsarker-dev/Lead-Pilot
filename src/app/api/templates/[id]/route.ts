import { NextRequest } from 'next/server';
import { templateController } from '@/backend/controllers';

// GET /api/templates/[id]
// PUT /api/templates/[id]
// DELETE /api/templates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return templateController.getTemplateById(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return templateController.updateTemplate(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return templateController.deleteTemplate(request, params);
}
