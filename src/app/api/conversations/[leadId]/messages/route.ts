import { NextRequest } from 'next/server';
import { conversationService } from '@/lib/api/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/lib/api/middleware/response-handler';
import { handleError } from '@/lib/api/middleware/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { validateBody } from '@/lib/api/middleware/validation';
import { addMessageSchema } from '@/lib/api/validators/conversation.validators';

// POST /api/conversations/[leadId]/messages
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const body = await request.json();
    const validatedData = await validateBody(body, addMessageSchema);

    const { leadId } = await params;
    const conversation = await conversationService.addMessageToConversation(leadId, validatedData);
    return sendJsonResponse(createSuccessResponse(conversation, 'Message added successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode, errorResponse.errors), errorResponse.statusCode);
  }
}
