import { NextRequest } from 'next/server';
import { campaignController } from '@/backend/controllers';

// GET /api/campaigns
// POST /api/campaigns
export async function GET(request: NextRequest) {
  return campaignController.getCampaigns(request);
}

export async function POST(request: NextRequest) {
  return campaignController.createCampaign(request);
}
