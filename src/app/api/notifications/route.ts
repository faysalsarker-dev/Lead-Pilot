import { NextRequest } from 'next/server';
import { notificationService } from '@/backend/services';
import { createSuccessResponse, sendJsonResponse, sendPaginatedResponse, createErrorResponse } from '@/backend/middleware/response-handler';
import { handleError } from '@/backend/middleware/errors';
import { requireAuth } from '@/backend/middleware/auth';
import { validateBody } from '@/backend/middleware/validation';
import { createNotificationSchema } from '@/backend/validators/notification.validators';

// GET /api/notifications
// POST /api/notifications
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let result;
    if (unreadOnly) {
      const notifications = await notificationService.getUnreadNotifications(auth.userId);
      result = {
        data: notifications,
        total: notifications.length,
        page: 1,
        limit: notifications.length,
        totalPages: 1,
      };
    } else {
      result = await notificationService.getNotificationsByUser(auth.userId, page, limit);
    }

    return sendJsonResponse(
      sendPaginatedResponse(result.data, result.total, result.page, result.limit, 'Notifications retrieved successfully')
    );
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const body = await request.json();
    const validatedData = await validateBody(body, createNotificationSchema);

    const notification = await notificationService.createNotification(auth.userId, validatedData);
    return sendJsonResponse(createSuccessResponse(notification, 'Notification created successfully'), 201);
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode, errorResponse.errors), errorResponse.statusCode);
  }
}
