import { NextRequest } from 'next/server';
import { campaignController } from '@/backend/controllers';

// POST /api/campaigns/[id]/resume
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return campaignController.resumeCampaign(request, params);
}
