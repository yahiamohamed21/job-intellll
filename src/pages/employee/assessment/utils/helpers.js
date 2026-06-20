export const OPTION_LETTERS = ["A", "B", "C", "D"];

export const getErrorStatus = (error) => error?.response?.status;

export const getExpiryTimeMsFromIso = (expiresAt) => {
  if (!expiresAt) return null;
  const parsed = Date.parse(expiresAt);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getExpiryTimeMsFromRemaining = (remainingSeconds) => {
  if (remainingSeconds == null) return null;
  return Date.now() + remainingSeconds * 1000;
};

export const getRemainingSecondsFromExpiry = (expiryTimeMs) => {
  if (expiryTimeMs == null) return 0;
  return Math.max(0, Math.floor((expiryTimeMs - Date.now()) / 1000));
};

/** Returns Tailwind classes for a difficulty badge. */
export const difficultyBadgeClass = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/60";
    case "hard":
      return "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/60";
    default: // medium
      return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/60";
  }
};

/** Returns Tailwind text-color classes for a score value. */
export const scoreColorClass = (score) => {
  if (score == null) return "text-slate-400";
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

/** Returns Tailwind classes for a status pill. */
export const statusPillClass = (status) => {
  switch (status) {
    case "Completed":
      return "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/50";
    case "InProgress":
      return "text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/50";
    default:
      return "text-slate-600 bg-slate-50 border border-slate-200 dark:text-slate-400 dark:bg-slate-800/30 dark:border-slate-400/[.14]/50";
  }
};
