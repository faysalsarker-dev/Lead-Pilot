import { NextRequest } from 'next/server';
import { replyService } from '@/lib/api/services';
import { createSuccessResponse, sendJsonResponse, sendPaginatedResponse, createErrorResponse } from '@/lib/api/middleware/response-handler';
import { handleError } from '@/lib/api/middleware/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { validateBody } from '@/lib/api/middleware/validation';
import { createReplySchema } from '@/lib/api/validators/reply.validators';

// GET /api/replies
// POST /api/replies
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const mailboxId = searchParams.get('mailboxId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let result;
    if (leadId) {
      result = await replyService.getRepliesByLead(leadId, page, limit);
    } else if (mailboxId) {
      result = await replyService.getRepliesByMailbox(mailboxId, page, limit);
    } else {
      throw new Error('Either leadId or mailboxId is required');
    }

    return sendJsonResponse(
      sendPaginatedResponse(result.data, result.total, result.page, result.limit, 'Replies retrieved successfully')
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
    const validatedData = await validateBody(body, createReplySchema);

    const reply = await replyService.createReply(validatedData);
    return sendJsonResponse(createSuccessResponse(reply, 'Reply created successfully'), 201);
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode, errorResponse.errors), errorResponse.statusCode);
  }
}
