import { NextRequest } from 'next/server';
import { campaignController } from '@/lib/api/controllers';

// POST /api/campaigns/[id]/resume
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return campaignController.resumeCampaign(request, await params);
}
