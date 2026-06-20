import React from 'react';
import { useTranslation } from 'react-i18next';

export const Timeline = ({ children }) => {
  return (
    <ol className="relative ps-5">
      {children}
    </ol>
  );
};

export const TimelineItem = ({ color, title, subtitle, date, isCurrent, children, onEdit, onDelete, isLast }) => {
  const { t } = useTranslation();
  return (
    <li className={`relative ${isLast ? "" : "pb-5"}`}>
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute top-4 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-400/[.14] -start-[1.3rem]"
        />
      )}
      <span
        className={`absolute top-1.5 size-3 rounded-full ${color} ring-2 ring-white dark:ring-slate-900 -start-[1.45rem]`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {date && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider font-bold flex items-center gap-1.5 flex-wrap">
              <span>{date}</span>
              {isCurrent && (
                <span
                  className="inline-flex items-center justify-center size-4 rounded-full bg-emerald-100 dark:bg-emerald-500/15"
                  title={t("dashboard.common.present", "Present")}
                  aria-label={t("dashboard.common.present", "Present")}
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              )}
            </p>
          )}
          <p className="text-sm font-bold text-slate-800 dark:text-white break-words">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">{subtitle}</p>
          )}
          {children}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                aria-label={t("dashboard.common.edit", "Edit")}
                title={t("dashboard.common.edit", "Edit")}
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                aria-label={t("dashboard.common.delete", "Delete")}
                title={t("dashboard.common.delete", "Delete")}
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
};
