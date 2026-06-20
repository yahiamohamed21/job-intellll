import React from 'react';

export const EmptyState = ({ icon, message, title, subtitle, variant = "section" }) => {
  if (variant === "page") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">{icon}</span>
        <p className="text-base font-semibold text-slate-600 dark:text-slate-300">{title || message}</p>
        {subtitle && <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{subtitle}</p>}
      </div>
    );
  }
  
  return (
    <div className="py-8 px-4 flex flex-col items-center text-center">
      <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800/40 flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[22px]">
          {icon}
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{title || message}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
};
