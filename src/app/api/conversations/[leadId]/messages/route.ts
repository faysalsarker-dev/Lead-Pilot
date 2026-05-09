import { NextRequest } from 'next/server';
import { conversationService } from '@/backend/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/backend/middleware/response-handler';
import { handleError } from '@/backend/middleware/errors';
import { requireAuth } from '@/backend/middleware/auth';
import { validateBody } from '@/backend/middleware/validation';
import { addMessageSchema } from '@/backend/validators/conversation.validators';

// POST /api/conversations/[leadId]/messages
export async function POST(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const body = await request.json();
    const validatedData = await validateBody(body, addMessageSchema);

    const conversation = await conversationService.addMessageToConversation(params.leadId, validatedData);
    return sendJsonResponse(createSuccessResponse(conversation, 'Message added successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode, errorResponse.errors), errorResponse.statusCode);
  }
}
