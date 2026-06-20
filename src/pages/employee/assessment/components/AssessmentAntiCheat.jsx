import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { alertError } from "../../../../lib/alerts";

const TAB_WARN_KEY = (attemptId) => `tab_warnings_${attemptId}`;

const saveTabWarnings = (attemptId, count) => {
  try {
    localStorage.setItem(TAB_WARN_KEY(attemptId), String(count));
  } catch { /* ignore */ }
};

export const AssessmentAntiCheat = ({
  children,
  examMode,
  activeAssessment,
  executeSubmit,
  tabSwitchWarningsRef,
}) => {
  const { t } = useTranslation();
  // ── Security: Disable right-click and copy across ALL Tests pages ──────
  // Applied globally to the entire module to prevent unauthorized copying
  // of assessment materials, review answers, or instructions.
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ── Anti-Cheating: Visibility Switch ──────
  useEffect(() => {
    if (!examMode) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        tabSwitchWarningsRef.current += 1;
        const currentWarnings = tabSwitchWarningsRef.current;

        // Persist immediately — so Save & Exit → Resume cannot reset the counter
        const attemptId = activeAssessment?.attemptId ?? activeAssessment?.id;
        if (attemptId) saveTabWarnings(attemptId, currentWarnings);

        if (currentWarnings >= 3) {
          alertError(
            t('assessment.antiCheat.violationTitle', 'Assessment Terminated'),
            t('assessment.antiCheat.violationSub', 'You have left the tab too many times. Your assessment will be submitted automatically.'),
          );
          executeSubmit();
        } else {
          alertError(
            t('assessment.antiCheat.warningTitle', 'Warning'),
            t('assessment.antiCheat.warningAlertSub', 'Please stay on this tab to avoid assessment termination. Warning {{current}} of 3.', { current: currentWarnings }),
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examMode, activeAssessment, executeSubmit, tabSwitchWarningsRef, t]);

  return <>{children}</>;
};
