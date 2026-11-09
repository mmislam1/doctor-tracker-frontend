export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null || !("data" in error)) return fallback;
  const data = error.data;
  if (typeof data === "object" && data !== null && "error" in data) {
    const apiError = data.error;
    if (typeof apiError === "object" && apiError !== null && "message" in apiError && typeof apiError.message === "string") {
      return apiError.message;
    }
  }
  if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") return data.message;
  return fallback;
}
