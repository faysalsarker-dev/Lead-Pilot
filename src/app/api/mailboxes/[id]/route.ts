import { NextRequest } from 'next/server';
import { mailboxController } from '@/lib/api/controllers';

// GET /api/mailboxes/[id]
// PUT /api/mailboxes/[id]
// DELETE /api/mailboxes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return mailboxController.getMailboxById(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return mailboxController.updateMailbox(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return mailboxController.deleteMailbox(request, await params);
}
