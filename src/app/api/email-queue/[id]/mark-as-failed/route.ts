import { NextRequest } from 'next/server';
import { emailQueueService } from '@/backend/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/backend/middleware/response-handler';
import { handleError } from '@/backend/middleware/errors';
import { requireAuth } from '@/backend/middleware/auth';

// POST /api/email-queue/[id]/mark-as-failed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const body = await request.json();
    const failReason = body.failReason || 'Unknown error';

    const email = await emailQueueService.markEmailAsFailed(params.id, failReason);
    return sendJsonResponse(createSuccessResponse(email, 'Email marked as failed'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
