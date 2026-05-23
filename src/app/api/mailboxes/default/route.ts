import { NextRequest } from 'next/server';
import { mailboxController } from '@/lib/api/controllers';

// GET /api/mailboxes/default
export async function GET(request: NextRequest) {
  return mailboxController.getDefaultMailbox(request);
}
