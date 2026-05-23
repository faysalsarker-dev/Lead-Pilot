import { NextRequest } from 'next/server';
import { mailboxController } from '@/lib/api/controllers';

// POST /api/mailboxes/[id]/set-default
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return mailboxController.setDefaultMailbox(request, await params);
}
