import React from 'react';

export const Pill = ({ children, tone = "blue", className = "", sizeClass = "text-[11px]" }) => {
  const tones = {
    blue: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/30 text-blue-600 dark:text-blue-400",
    slate: "bg-slate-100 dark:bg-[#0c1424] border-slate-200 dark:border-slate-400/[.14] text-slate-600 dark:text-slate-300",
    green: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
    red: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClass} font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border whitespace-nowrap ${tones[tone] || tones.blue} ${className}`}
    >
      {children}
    </span>
  );
};
