import { NextResponse } from "next/server";

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function createSuccessResponse<T>(
  data: T,
  message = "Success",
  pagination?: Pagination
) {
  return {
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  };
}

export function createErrorResponse(
  message = "Internal Server Error",
  statusCode = 500,
  errors?: unknown
) {
  return {
    success: false,
    message,
    error: message,
    statusCode,
    ...(errors ? { errors } : {}),
  };
}

export function sendPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = "Success"
) {
  return createSuccessResponse(data, message, {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

export function sendJsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}
