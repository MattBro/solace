export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, error?: any) {
    super(500, message, error);
    this.name = 'DatabaseError';
  }
}

export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return Response.json(
      {
        error: {
          message: error.message,
          statusCode: error.statusCode,
          details: error.details
        }
      },
      { status: error.statusCode }
    );
  }

  // Default error response
  return Response.json(
    {
      error: {
        message: 'An unexpected error occurred',
        statusCode: 500
      }
    },
    { status: 500 }
  );
}