import { NextRequest } from 'next/server';
import { conversationService } from '@/backend/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/backend/middleware/response-handler';
import { handleError } from '@/backend/middleware/errors';
import { requireAuth } from '@/backend/middleware/auth';

// GET /api/conversations/[leadId]
export async function GET(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const conversation = await conversationService.getConversationByLead(params.leadId);
    return sendJsonResponse(createSuccessResponse(conversation, 'Conversation retrieved successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
