// Returns a safe error message for display in the UI.
// In development the raw message is shown to aid debugging.
// In production a generic message is returned to avoid leaking
// internal details (paths, URLs, stack traces) from API responses.
export function sanitizeApiError(error: unknown): string {
  if (import.meta.env.DEV && error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
