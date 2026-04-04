export type FieldErrors = Record<string, string[] | undefined>;

export type ApiErrorResponse = {
  message?: string;
  errors?: FieldErrors;
};

export type HttpError = {
  message?: string;
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
};

export function getErrorMessage(error: unknown, fallback: string): string {
  const err = error as HttpError;
  return (
    err?.response?.data?.message ||
    err?.response?.data?.errors?.email?.[0] ||
    err?.message ||
    fallback
  );
}
