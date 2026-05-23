import { NextRequest } from 'next/server';
import { emailQueueService } from '@/lib/api/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/lib/api/middleware/response-handler';
import { handleError } from '@/lib/api/middleware/errors';
import { requireAuth } from '@/lib/api/middleware/auth';

// GET /api/email-queue/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const { id } = await params;
    const email = await emailQueueService.getEmailById(id);
    return sendJsonResponse(createSuccessResponse(email, 'Email queue item retrieved successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
