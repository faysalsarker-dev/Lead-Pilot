import { NextRequest } from 'next/server';
import { leadController } from '@/lib/api/controllers';

// GET /api/leads
// POST /api/leads
export async function GET(request: NextRequest) {
  return leadController.getLeads(request);
}

export async function POST(request: NextRequest) {
  return leadController.createLead(request);
}
