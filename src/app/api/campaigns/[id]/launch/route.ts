import { NextRequest } from 'next/server';
import { campaignController } from '@/backend/controllers';

// POST /api/campaigns/[id]/launch
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return campaignController.launchCampaign(request, params);
}
