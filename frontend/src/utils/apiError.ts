import type { ApiError, BackendErrorPayload } from '@/types/apiError';
import type { AxiosError } from 'axios';

export function toApiError(err: unknown, fallbackMessage = 'Erreur réseau'): ApiError {
  const e = err as AxiosError<BackendErrorPayload>;

  const status = e.response?.status;
  const data = e.response?.data;

  const message =
    data?.error?.message ??
    e.message ??
    fallbackMessage;

  const code = data?.error?.code;
  const details = data?.error?.details;

  return { status, code, message, details };
}
