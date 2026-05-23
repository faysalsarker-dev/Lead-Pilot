import { NextRequest } from 'next/server';
import { conversationService } from '@/lib/api/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/lib/api/middleware/response-handler';
import { handleError } from '@/lib/api/middleware/errors';
import { requireAuth } from '@/lib/api/middleware/auth';

// GET /api/conversations/[leadId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const { leadId } = await params;
    const conversation = await conversationService.getConversationByLead(leadId);
    return sendJsonResponse(createSuccessResponse(conversation, 'Conversation retrieved successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
