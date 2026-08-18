export type FieldErrors = Record<string, string[] | undefined>;

export type ApiErrorResponse = {
  message?: string;
  errors?: FieldErrors;
  code?: string;
};

export type HttpError = {
  message?: string;
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
};

export function getValidationMessages(error: unknown): string[] {
  const err = error as HttpError;
  const errors = err?.response?.data?.errors;
  if (!errors) return [];
  return Object.values(errors)
    .flatMap((messages) => messages ?? [])
    .filter((message): message is string => typeof message === 'string' && message.trim().length > 0);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as HttpError;
  const firstValidation = getValidationMessages(error)[0];
  return err?.response?.data?.message || firstValidation || err?.message || fallback;
}

export function getHttpStatus(error: unknown): number | undefined {
  return (error as HttpError)?.response?.status;
}

export function getApiErrorCode(error: unknown): string | null {
  const code = (error as HttpError)?.response?.data?.code;
  return typeof code === 'string' && code.trim() ? code : null;
}
