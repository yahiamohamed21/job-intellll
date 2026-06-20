import React, { useState, useEffect, useRef } from "react";
import { formatTime, renderRichText } from "../utils/textFormatting";
import { useTranslation } from "react-i18next";
import { OPTION_LETTERS, getRemainingSecondsFromExpiry } from "../utils/helpers";



export const LoadingMessageCycler = () => {
  const { t } = useTranslation();
  const FUNNY_MESSAGES = [
    t('assessment.shared.loadingMsg1', "Waking up the AI from its nap..."),
    t('assessment.shared.loadingMsg2', "Brewing some really tough questions (just kidding!)..."),
    t('assessment.shared.loadingMsg3', "Reading your resume and nodding approvingly..."),
    t('assessment.shared.loadingMsg4', "Teaching the AI about your skills..."),
    t('assessment.shared.loadingMsg5', "Finding the perfect questions for you..."),
    t('assessment.shared.loadingMsg6', "Almost there! The AI is just double-checking its math..."),
    t('assessment.shared.loadingMsg7', "Bribing the servers with digital coffee..."),
    t('assessment.shared.loadingMsg8', "Spinning up the assessment hamsters...")
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % FUNNY_MESSAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [FUNNY_MESSAGES.length]);

  return (
    <p className="text-xs text-blue-500 dark:text-blue-400 font-medium animate-pulse transition-opacity duration-500">
      {FUNNY_MESSAGES[msgIdx]}
    </p>
  );
};

export const Spinner = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeDasharray="32"
      strokeLinecap="round"
      className="opacity-25"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const ScoreBar = ({ value, size = "md" }) => {
  const h = size === "sm" ? "h-1" : "h-1.5";
  const color =
    value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div
      className={`${h} w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden`}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(value ?? 0, 100)}%` }}
      />
    </div>
  );
};

// Drift-proof Countdown for Dashboard
export const ExpiryCountdown = ({ expiryTime }) => {
  const { t } = useTranslation();
  const [secs, setSecs] = useState(() => {
    const ms = new Date(expiryTime).getTime() - Date.now();
    return Math.max(0, Math.floor(ms / 1000));
  });

  useEffect(() => {
    // Initial sync point
    const targetTime = new Date(expiryTime).getTime();
    const startRealTime = performance.now();
    const startSecs = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));

    const id = setInterval(() => {
      // Calculate elapsed using high-res performance timer (immune to OS clock changes)
      const elapsedMs = performance.now() - startRealTime;
      const currentSecs = Math.max(0, startSecs - Math.floor(elapsedMs / 1000));
      setSecs(currentSecs);
    }, 1000);

    return () => clearInterval(id);
  }, [expiryTime]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const fmt = (n) => String(n).padStart(2, "0");
  const isCritical = secs <= 300;
  return (
    <div
      className={`flex items-center gap-2 font-mono text-2xl font-bold tabular-nums ${
        isCritical ? "text-red-500 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[20px] ${
          isCritical ? "animate-pulse" : ""
        }`}
      >
        timer
      </span>
      {h > 0 ? `${fmt(h)}:` : ""}
      {fmt(m)}:{fmt(s)}
      {isCritical && (
        <span className="text-xs font-sans font-semibold ms-1 opacity-75">
          {t('assessment.shared.runningOut', 'Running out!')}
        </span>
      )}
    </div>
  );
};

// Drift-proof Timer for Active Assessment
export const AssessmentTimerDisplay = ({ expiryTimeMs, onTimeUp }) => {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getRemainingSecondsFromExpiry(expiryTimeMs),
  );
  const handledRef = useRef(false);
  const tickRef = useRef(null);

  useEffect(() => {
    if (expiryTimeMs == null) return;
    handledRef.current = false;

    const startSecs = getRemainingSecondsFromExpiry(expiryTimeMs);
    const startRealTime = performance.now();
    setTimeRemaining(startSecs);

    const tick = () => {
      const elapsedMs = performance.now() - startRealTime;
      const remaining = Math.max(0, startSecs - Math.floor(elapsedMs / 1000));
      
      setTimeRemaining(remaining);
      if (remaining <= 0 && !handledRef.current) {
        handledRef.current = true;
        clearInterval(tickRef.current);
        onTimeUp();
      }
    };

    tickRef.current = setInterval(tick, 1000);
    return () => clearInterval(tickRef.current);
  }, [expiryTimeMs, onTimeUp]);

  const timerIsWarning = timeRemaining > 0 && timeRemaining <= 300;
  const timerIsCritical = timeRemaining > 0 && timeRemaining <= 60;

  return (
    <div
      className={[
        "flex items-center gap-1.5 text-sm font-mono font-bold tabular-nums px-3 py-1.5 rounded-lg border",
        timerIsCritical
          ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 animate-pulse"
          : timerIsWarning
          ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50"
          : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-400/[.14]",
      ].join(" ")}
      aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
    >
      <span className="material-symbols-outlined text-[15px]">timer</span>
      {formatTime(timeRemaining)}
    </div>
  );
};

export const AnswerOption = ({ index, text, isSelected, onSelect, disabled }) => (
  <button
    onClick={() => !disabled && onSelect(index)}
    disabled={disabled}
    className={[
      "group w-full flex items-start gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 rounded-xl border-2 text-start",
      "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      isSelected
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500"
        : "border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60",
      disabled && "opacity-60 cursor-not-allowed",
    ]
      .filter(Boolean)
      .join(" ")}
    aria-pressed={isSelected}
    dir="ltr"
  >
    <span
      className={[
        "flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors mt-0.5",
        isSelected
          ? "border-blue-600 dark:border-blue-400"
          : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400",
      ].join(" ")}
      aria-hidden="true"
    >
      {isSelected && (
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 block" />
      )}
    </span>
    <span
      className={[
        "text-sm sm:text-base font-bold w-5 sm:w-6 shrink-0 transition-colors mt-0.5",
        isSelected
          ? "text-blue-700 dark:text-blue-300"
          : "text-slate-400 dark:text-slate-500",
      ].join(" ")}
    >
      {OPTION_LETTERS[index]}.
    </span>
    <span
      className={[
        "flex-1 text-sm sm:text-base leading-snug transition-colors",
        isSelected
          ? "text-slate-900 dark:text-white font-medium"
          : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white",
      ].join(" ")}
    >
      {renderRichText(text)}
    </span>
  </button>
);

export const QuestionGridModal = ({

  questionStatuses,
  currentQuestionNumber,
  onNavigate,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  return (
  <div
    className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label="All Questions"
    dir={i18n.dir()}
  >
    <div
      className="relative bg-white dark:bg-[#0a1020] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-400/[.14] w-full max-w-[400px] max-h-[90vh] flex flex-col overflow-hidden text-start"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-400/[.14] shrink-0">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('assessment.shared.allQuestions', 'All Questions')}</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t('assessment.shared.clickToJump', 'Click any question to jump to it')}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <div className="px-5 sm:px-6 py-6 overflow-y-auto">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {questionStatuses.map((qs) => {
            const isCurrent = qs.questionNumber === currentQuestionNumber;
            return (
              <button
                key={qs.questionNumber}
                onClick={() => {
                  onNavigate(qs.questionNumber);
                  onClose();
                }}
                className={[
                  "aspect-square rounded-lg text-sm sm:text-base font-semibold transition-all duration-100 flex items-center justify-center shrink-0",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isCurrent
                    ? "border-2 border-blue-600 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40"
                    : qs.isAnswered
                    ? "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm"
                    : "border-2 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700",
                ].join(" ")}
                style={{ width: "calc(20% - 10px)" }}
                aria-label={`Question ${qs.questionNumber}${
                  qs.isAnswered ? ", answered" : ", unanswered"
                }${isCurrent ? ", current" : ""}`}
              >
                {qs.questionNumber}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-400/[.14] text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 bg-slate-50/70 dark:bg-slate-800/20">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-600 dark:bg-blue-500" />{t('assessment.shared.answered', 'Answered')}</div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-slate-300 dark:border-slate-600" />{t('assessment.shared.unanswered', 'Unanswered')}</div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/40" />{t('assessment.shared.current', 'Current')}</div>
      </div>
    </div>
  </div>
);
};
