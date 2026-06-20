import React from 'react';

export const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-2xl shadow-[0_8px_24px_-12px_rgba(2,6,23,0.18)] dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] ${className}`}
  >
    {children}
  </div>
);
