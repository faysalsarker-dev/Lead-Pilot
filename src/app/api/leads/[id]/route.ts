import { NextRequest } from 'next/server';
import { leadController } from '@/backend/controllers';

// GET /api/leads/[id]
// PUT /api/leads/[id]
// DELETE /api/leads/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return leadController.getLeadById(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return leadController.updateLead(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return leadController.deleteLead(request, params);
}
