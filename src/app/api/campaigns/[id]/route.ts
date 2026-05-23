import { NextRequest } from 'next/server';
import { campaignController } from '@/lib/api/controllers';

// GET /api/campaigns/[id]
// PUT /api/campaigns/[id]
// DELETE /api/campaigns/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return campaignController.getCampaignById(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return campaignController.updateCampaign(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return campaignController.deleteCampaign(request, await params);
}
