export class HttpError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, code = 'VALIDATION_ERROR', details?: unknown) =>
  new HttpError(400, message, code, details);

export const notFound = (message: string, code = 'NOT_FOUND', details?: unknown) =>
  new HttpError(404, message, code, details);

export const forbidden = (message: string, code = 'FORBIDDEN', details?: unknown) =>
  new HttpError(403, message, code, details);

export const unauthorized = (message: string, code = 'UNAUTHORIZED', details?: unknown) =>
  new HttpError(401, message, code, details);
