import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '@/utils/httpError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const isHttp = err instanceof HttpError;
  const statusCode = isHttp ? err.statusCode : 500;

  if (statusCode >= 500) console.error('[API ERROR]', err);

  res.status(statusCode).json({
    error: {
      message: isHttp ? err.message : 'Erreur interne du serveur',
      code: isHttp ? err.code ?? 'UNKNOWN_ERROR' : 'INTERNAL_ERROR',
      details: isHttp ? err.details : undefined,
    },
  });
}
