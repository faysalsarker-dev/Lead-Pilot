import { NextRequest } from 'next/server';
import { replyService } from '@/lib/api/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/lib/api/middleware/response-handler';
import { handleError } from '@/lib/api/middleware/errors';
import { requireAuth } from '@/lib/api/middleware/auth';

// POST /api/replies/[id]/mark-as-read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const { id } = await params;
    const reply = await replyService.markReplyAsRead(id);
    return sendJsonResponse(createSuccessResponse(reply, 'Reply marked as read'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
