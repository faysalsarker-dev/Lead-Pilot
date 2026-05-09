import { NextRequest } from 'next/server';
import { templateController } from '@/backend/controllers';

// GET /api/templates
// POST /api/templates
export async function GET(request: NextRequest) {
  return templateController.getTemplates(request);
}

export async function POST(request: NextRequest) {
  return templateController.createTemplate(request);
}
