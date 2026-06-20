import React from 'react';

export const TabBar = ({ active, onChange, counts = {}, tabs = [] }) => {
  return (
    <div
      className="flex w-full gap-1 sm:gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
    >
      {tabs.map((tab) => {
        const on = active === tab.id;
        const count = counts?.[tab.id] ?? 0;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-4 py-2.5 sm:py-3 rounded-2xl whitespace-nowrap transition-all duration-300 font-bold text-[13px] min-w-0
              ${on
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"
              }
            `}
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${on ? "scale-110" : ""}`}
              style={{ fontVariationSettings: on ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
            {count > 0 && (
              <span className={`
                hidden sm:flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-black tracking-wide border
                ${on
                  ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
