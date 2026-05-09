import { NextRequest } from 'next/server';
import { mailboxController } from '@/backend/controllers';

// POST /api/mailboxes/[id]/set-default
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return mailboxController.setDefaultMailbox(request, params);
}
