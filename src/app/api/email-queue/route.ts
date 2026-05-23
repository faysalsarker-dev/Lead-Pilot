import { NextRequest } from 'next/server';
import { emailQueueService } from '@/lib/api/services';
import { sendJsonResponse, sendPaginatedResponse, createErrorResponse } from '@/lib/api/middleware/response-handler';
import { handleError } from '@/lib/api/middleware/errors';
import { requireAuth } from '@/lib/api/middleware/auth';

// GET /api/email-queue
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const { searchParams } = new URL(request.url);
    const pendingOnly = searchParams.get('pendingOnly') === 'true';
    const campaignId = searchParams.get('campaignId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let result;
    if (pendingOnly) {
      const emails = await emailQueueService.getPendingEmails(limit);
      result = {
        data: emails,
        total: emails.length,
        page: 1,
        limit: emails.length,
        totalPages: 1,
      };
    } else if (campaignId) {
      result = await emailQueueService.getEmailsByCampaign(campaignId, page, limit);
    } else {
      throw new Error('Campaign ID is required');
    }

    return sendJsonResponse(
      sendPaginatedResponse(result.data, result.total, result.page, result.limit, 'Email queue items retrieved successfully')
    );
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
