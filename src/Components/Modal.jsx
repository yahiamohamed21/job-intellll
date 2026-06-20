import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

/**
 * Modal — matches the JobSeeker Wizard design language
 *  - Backdrop blur + dim
 *  - White / surface-dark card
 *  - Header (title + description) / Body (children) / Footer (buttons)
 *  - Closes on ESC, backdrop click, and the X button
 *  - RTL aware (icon arrows flip, body scroll locked)
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = "md",
  hideCloseButton = false,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  }[size] || "max-w-xl";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: "dbModalFade 0.18s ease both" }}
      />

      {/* Card */}
      <div
        className={`relative w-full ${sizeClass} bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden bg-gradient-to-b from-white/[.02] to-transparent`}
        style={{ animation: "dbModalPop 0.22s cubic-bezier(.22,.68,0,1.2) both" }}
      >
        {/* Header */}
        {(title || description || !hideCloseButton) && (
          <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200 dark:border-slate-400/[.14] flex items-start gap-3 shrink-0">
            {icon && (
              <div className="size-10 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[22px]">
                  {icon}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label={t("modal.close")}
                className="size-9 shrink-0 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0c1424] hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 sm:px-8 py-4 border-t border-slate-200 dark:border-slate-400/[.14] flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0 bg-slate-50/40 dark:bg-[#0c1424]/60">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
