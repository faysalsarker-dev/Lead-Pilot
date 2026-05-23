export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public errors?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, errors?: unknown) {
    super(message, 400, errors);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      errors: error.errors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || "Internal Server Error",
      statusCode: 500,
    };
  }

  return {
    message: "Internal Server Error",
    statusCode: 500,
  };
}
