// Safely extracts a plain string from FastAPI/Axios errors.
// FastAPI 422 returns: { detail: [{type, loc, msg, input}] }
// FastAPI 400/401 returns: { detail: "some string" }
export function getApiError(error: any, fallback = "Something went wrong"): string {
  const detail = error?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => (typeof e === "object" ? e.msg || JSON.stringify(e) : String(e)))
      .join(", ");
  }
  return fallback;
}
