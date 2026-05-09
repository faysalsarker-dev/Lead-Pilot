import { NextRequest } from 'next/server';
import { replyService } from '@/backend/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/backend/middleware/response-handler';
import { handleError } from '@/backend/middleware/errors';
import { requireAuth } from '@/backend/middleware/auth';
import { validateBody } from '@/backend/middleware/validation';
import { updateReplySchema } from '@/backend/validators/reply.validators';

// GET /api/replies/[id]
// PUT /api/replies/[id]
// DELETE /api/replies/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const reply = await replyService.getReplyById(params.id);
    return sendJsonResponse(createSuccessResponse(reply, 'Reply retrieved successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    const body = await request.json();
    const validatedData = await validateBody(body, updateReplySchema);

    const reply = await replyService.updateReply(params.id, validatedData);
    return sendJsonResponse(createSuccessResponse(reply, 'Reply updated successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode, errorResponse.errors), errorResponse.statusCode);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return sendJsonResponse(createErrorResponse(auth.error, auth.statusCode), auth.statusCode);
    }

    await replyService.deleteReply(params.id);
    return sendJsonResponse(createSuccessResponse(null, 'Reply deleted successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
