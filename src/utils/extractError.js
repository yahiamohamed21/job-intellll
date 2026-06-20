import i18n from "../lib/i18n.js";

/**
 * Universal error extractor for ASP.NET backend responses.
 * Handles:
 * 1. Business logic error (AuthResponseDto or ApiErrorResponse) → { success: false, message: "..." }
 * 2. ApiResponse<T> wrapper → { success: false, message: "..." }
 * 3. Validation error (ASP.NET ModelState) → { errors: { field: ["msg"] } }
 * 4. Network/CORS errors (no response object)
 */
const tr = (key, fallback) => {
  try {
    const v = i18n?.t ? i18n.t(key) : key;
    return v && v !== key ? v : fallback;
  } catch {
    return fallback;
  }
};

export function extractError(err) {
    if (!err.response) {
        return tr("errors.network", "Network error: Make sure the backend is running and CORS is enabled.");
    }

    const data = err.response?.data;

    if (data?.errorCode && data?.message) {
        return tr(`errors.${data.message}`, data.message);
    }

    if (data?.message) {
        const msg = data.message;

        // Handle backend cooldown messages (dynamic with days count)
        const cooldownMatch = msg.match(/^(Company name|Job title) can only be changed once every 30 days\. You can change it again in (\d+) days?\.$/);
        if (cooldownMatch) {
            const prefix = cooldownMatch[1];
            const days = parseInt(cooldownMatch[2], 10);
            const key = `errors.${prefix} can only be changed once every 30 days. You can change it again in`;
            return tr(key, msg) + ` ${days} ${days === 1 ? "day" : "days"}.`;
        }

        return tr(`errors.${msg}`, msg);
    }

    if (typeof data === 'string' && data.length > 0) {
        return tr(`errors.${data}`, data);
    }

    if (data?.errors) {
        return Object.values(data.errors)
            .flat()
            .map(msg => tr(`errors.${msg}`, msg))
            .join(" ");
    }

    if (data?.title) {
        return data.detail || data.title;
    }

    return tr("errors.generic", "Something went wrong. Please try again.");
}
