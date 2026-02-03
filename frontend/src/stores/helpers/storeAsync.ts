import type { ApiError } from '@/types/apiError';
import { toApiError } from '@/utils/apiError';

export type AsyncState = {
  loading: boolean;
  error: ApiError | null;
};

export async function run<T>(
  state: AsyncState,
  fn: () => Promise<T>,
  opts?: { clearError?: boolean }
): Promise<T> {
  const clearError = opts?.clearError ?? true;

  state.loading = true;
  if (clearError) state.error = null;

  try {
    return await fn();
  } catch (err) {
    state.error = toApiError(err);
    throw err;
  } finally {
    state.loading = false;
  }
}
