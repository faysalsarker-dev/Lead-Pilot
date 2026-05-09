import { NextRequest } from 'next/server';
import { mailboxController } from '@/backend/controllers';

// GET /api/mailboxes/[id]
// PUT /api/mailboxes/[id]
// DELETE /api/mailboxes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return mailboxController.getMailboxById(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return mailboxController.updateMailbox(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return mailboxController.deleteMailbox(request, params);
}
