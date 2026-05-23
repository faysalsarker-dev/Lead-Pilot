import { NextRequest } from 'next/server';
import { leadController } from '@/lib/api/controllers';

// POST /api/leads/bulk/create
export async function POST(request: NextRequest) {
  return leadController.bulkCreateLeads(request);
}
