import { NextRequest } from 'next/server';
import { mailboxController } from '@/lib/api/controllers';

// GET /api/mailboxes
// POST /api/mailboxes
export async function GET(request: NextRequest) {
  return mailboxController.getMailboxes(request);
}

export async function POST(request: NextRequest) {
  return mailboxController.createMailbox(request);
}
