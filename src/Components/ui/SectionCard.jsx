import React from 'react';

export const SectionCard = ({ title, onAction, actionLabel, actionIcon, children }) => {
  return (
    <div>
      {title && (
        <div className="flex items-center justify-between gap-3 mb-3 px-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white min-w-0">
            {title}
          </h3>
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shrink-0"
            >
              {actionIcon && (
                <span className="material-symbols-outlined text-[16px] transition-transform group-hover:scale-110">
                  {actionIcon}
                </span>
              )}
              <span className="text-xs font-bold">{actionLabel}</span>
            </button>
          )}
        </div>
      )}
      <div className="bg-slate-50/60 dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-white/[.02] to-transparent overflow-hidden">
        {children}
      </div>
    </div>
  );
};
