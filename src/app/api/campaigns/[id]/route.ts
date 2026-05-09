import { NextRequest } from 'next/server';
import { campaignController } from '@/backend/controllers';

// GET /api/campaigns/[id]
// PUT /api/campaigns/[id]
// DELETE /api/campaigns/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return campaignController.getCampaignById(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return campaignController.updateCampaign(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return campaignController.deleteCampaign(request, params);
}
