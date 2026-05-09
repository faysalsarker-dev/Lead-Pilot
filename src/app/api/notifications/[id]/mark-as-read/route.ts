import { NextRequest } from 'next/server';
import { notificationService } from '@/backend/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/backend/middleware/response-handler';
import { handleError } from '@/backend/middleware/errors';
import { requireAuth } from '@/backend/middleware/auth';

// POST /api/notifications/[id]/mark-as-read
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const notification = await notificationService.markNotificationAsRead(params.id);
    return sendJsonResponse(createSuccessResponse(notification, 'Notification marked as read'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
