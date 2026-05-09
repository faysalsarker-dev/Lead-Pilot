import { NextRequest } from 'next/server';
import { emailQueueService } from '@/backend/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/backend/middleware/response-handler';
import { handleError } from '@/backend/middleware/errors';
import { requireAuth } from '@/backend/middleware/auth';

// GET /api/email-queue/stats
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const stats = await emailQueueService.getQueueStats();
    return sendJsonResponse(createSuccessResponse(stats, 'Queue stats retrieved successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
