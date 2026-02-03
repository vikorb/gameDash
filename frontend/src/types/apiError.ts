export type BackendErrorPayload = {
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
};

export type ApiError = {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
};
