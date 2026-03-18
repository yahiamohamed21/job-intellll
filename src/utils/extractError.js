/**
 * Universal error extractor for ASP.NET backend responses.
 * Handles:
 * 1. Business logic error (AuthResponseDto or ApiErrorResponse)
 * 2. Validation error (ASP.NET ModelState)
 */
export function extractError(err) {
    console.error("API Error full object:", err);

    if (!err.response) {
        // This happens if the backend is down, or there is a CORS error
        return "Network error: Make sure the backend is running and CORS is enabled.";
    }

    const data = err.response?.data;

    // Shape 1: Business logic error (AuthResponseDto or ApiErrorResponse)
    if (data?.message) {
        return data.message;
    }

    // Shape 3: Validation error (ASP.NET ModelState)
    if (data?.errors) {
        return Object.values(data.errors).flat().join(" ");
    }

    return "Something went wrong. Please try again.";
}
