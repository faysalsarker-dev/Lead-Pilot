import { NextRequest } from 'next/server';
import { leadController } from '@/lib/api/controllers';

// GET /api/leads/[id]
// PUT /api/leads/[id]
// DELETE /api/leads/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return leadController.getLeadById(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return leadController.updateLead(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return leadController.deleteLead(request, await params);
}
