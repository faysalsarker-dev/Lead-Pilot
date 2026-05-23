import { NextRequest } from 'next/server';
import { replyService } from '@/lib/api/services';
import { createSuccessResponse, sendJsonResponse, createErrorResponse } from '@/lib/api/middleware/response-handler';
import { handleError } from '@/lib/api/middleware/errors';
import { requireAuth } from '@/lib/api/middleware/auth';
import { validateBody } from '@/lib/api/middleware/validation';
import { updateReplySchema } from '@/lib/api/validators/reply.validators';

// GET /api/replies/[id]
// PUT /api/replies/[id]
// DELETE /api/replies/[id]
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
    const reply = await replyService.getReplyById(id);
    return sendJsonResponse(createSuccessResponse(reply, 'Reply retrieved successfully'));
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
    const validatedData = await validateBody(body, updateReplySchema);

    const { id } = await params;
    const reply = await replyService.updateReply(id, validatedData);
    return sendJsonResponse(createSuccessResponse(reply, 'Reply updated successfully'));
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
    await replyService.deleteReply(id);
    return sendJsonResponse(createSuccessResponse(null, 'Reply deleted successfully'));
  } catch (error) {
    const errorResponse = handleError(error);
    return sendJsonResponse(createErrorResponse(errorResponse.message, errorResponse.statusCode), errorResponse.statusCode);
  }
}
