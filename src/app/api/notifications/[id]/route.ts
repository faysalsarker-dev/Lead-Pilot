import { NextRequest } from 'next/server';
import { notificationService } from '@/lib/api/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/lib/api/middleware/response-handler';
import { handleError } from '@/lib/api/middleware/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { validateBody } from '@/lib/api/middleware/validation';
import { updateNotificationSchema } from '@/lib/api/validators/notification.validators';

// GET /api/notifications/[id]
// PUT /api/notifications/[id]
// DELETE /api/notifications/[id]
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
    const notification = await notificationService.getNotificationById(id, auth.userId);
    return sendJsonResponse(createSuccessResponse(notification, 'Notification retrieved successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const body = await request.json();
    const validatedData = await validateBody(body, updateNotificationSchema);

    const { id } = await params;
    const notification = await notificationService.updateNotification(id, auth.userId, validatedData);
    return sendJsonResponse(createSuccessResponse(notification, 'Notification updated successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode, errorResponse.errors), errorResponse.statusCode);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const { id } = await params;
    await notificationService.deleteNotification(id, auth.userId);
    return sendJsonResponse(createSuccessResponse(null, 'Notification deleted successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
