import { NextRequest } from 'next/server';
import { campaignController } from '@/lib/api/controllers';

// POST /api/campaigns/[id]/launch
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return campaignController.launchCampaign(request, await params);
}
