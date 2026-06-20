import React, { useState, useEffect } from "react";
import { renderRichText } from "../utils/textFormatting";
import { alertError } from "../../../../lib/alerts";
import { useTranslation } from "react-i18next";
import {
  AnswerOption,
  QuestionGridModal,
  AssessmentTimerDisplay,
  Spinner,
} from "./AssessmentSharedUI";

export const AssessmentRunner = ({
  loading,
  isSaving,
  activeAssessment,
  currentQuestion,
  questionStatuses,
  selectedAnswer,
  expiryTimeMs,
  handleTimeUp,
  handleCompleteAssessment,
  handleSelectAnswer,
  jumpToQuestion,
}) => {
  const { t, i18n } = useTranslation();
  const [gridModalOpen, setGridModalOpen] = useState(false);

  const isFirstQuestion = currentQuestion?.questionNumber === 1;
  const isLastQuestion =
    currentQuestion?.questionNumber === activeAssessment?.totalQuestions;
  const answeredCount = questionStatuses.filter((q) => q.isAnswered).length;

  // ── Keyboard Shortcuts ──────────────────────────────────
  useEffect(() => {
    if (!currentQuestion) return;

    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (gridModalOpen) {
        if (e.key === "Escape") setGridModalOpen(false);
        return;
      }
      // Ignore any combination that holds Ctrl / Meta / Alt so that browser
      // shortcuts (Ctrl+C, Cmd+R, etc.) are never intercepted here.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case "a":
        case "A":
        case "1":
          handleSelectAnswer(0);
          break;
        case "b":
        case "B":
        case "2":
          handleSelectAnswer(1);
          break;
        case "c":
        case "C":
        case "3":
          handleSelectAnswer(2);
          break;
        case "d":
        case "D":
        case "4":
          handleSelectAnswer(3);
          break;
        case "ArrowLeft":
          if (!isFirstQuestion && !loading)
            jumpToQuestion(currentQuestion.questionNumber - 1);
          break;
        case "ArrowRight":
          if (!isLastQuestion && !loading)
            jumpToQuestion(currentQuestion.questionNumber + 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentQuestion,
    gridModalOpen,
    loading,
    isSaving,
    isFirstQuestion,
    isLastQuestion,
    handleSelectAnswer,
    jumpToQuestion,
  ]);

  if (!currentQuestion) return null;

  return (
    <div
      className="relative flex flex-col h-[calc(100vh-120px)] bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-xl overflow-hidden shadow-sm text-start select-none"
      dir={i18n.dir()}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => {
        e.preventDefault();
        alertError(
          t('assessment.runner.copyDisabledTitle', "Copying is disabled"),
          t('assessment.runner.copyDisabledSub', "Please do not copy assessment materials.")
        );
      }}
    >
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] shrink-0 z-10 gap-2">
        {/* Left: breadcrumb & save status grouped */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate hidden sm:block">
              {t('assessment.dashboard.skillsCertification', 'Skill Assessment')}
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate sm:hidden">{t('assessment.dashboard.skillsCertification', 'Assessment')}</span>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:block">
              ·
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              {currentQuestion.category}
            </span>
          </div>

          {/* save status */}
          <div className="flex items-center shrink-0">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                <Spinner size={12} />
                <span className="hidden sm:inline">{t('assessment.runner.saving')}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">{t('assessment.runner.saved')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: timer + actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <AssessmentTimerDisplay expiryTimeMs={expiryTimeMs} onTimeUp={handleTimeUp} />

          {/* Submit */}
          <button
            onClick={handleCompleteAssessment}
            disabled={loading || isSaving}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px] sm:hidden">
              check
            </span>
            <span className="hidden sm:inline">{t('assessment.runner.submit')}</span>
          </button>
        </div>
      </header>

      {/* ── Global {t('assessment.runner.progress', 'Progress')} Bar ── */}
      <div className="w-full h-1 sm:h-1.5 bg-slate-100 dark:bg-slate-800/80 shrink-0 z-10">
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-700 ease-out"
          style={{
            width: `${(answeredCount / currentQuestion.totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* ── Content row ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left info panel ──────────────────────────────────────────── */}
        <aside className="hidden sm:flex w-52 lg:w-60 shrink-0 flex-col border-r border-slate-100 dark:border-slate-400/[.14] bg-slate-50 dark:bg-slate-800/40 overflow-y-auto">
          <div className="p-6 pt-8 flex flex-col gap-6">
            {/* Large question number */}
            <div>
              <span
                className="block text-[72px] leading-none font-light text-slate-200 dark:text-slate-700 select-none tabular-nums"
                aria-hidden="true"
              >
                {currentQuestion.questionNumber}
              </span>
              <span className="mt-1 block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                {t('assessment.runner.ofQuestions', 'of {{total}} Questions', { total: currentQuestion.totalQuestions })}
              </span>
            </div>

            {/* Progress bar + count */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {t('assessment.runner.progress', 'Progress')}
                </p>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                  {answeredCount}/{currentQuestion.totalQuestions}
                </span>
              </div>
              <div
                className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
              >
                <div
                  className="h-full rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                  style={{
                    width: `${(answeredCount / currentQuestion.totalQuestions) * 100}%`,
                  }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuenow={answeredCount}
                  aria-valuemax={currentQuestion.totalQuestions}
                />
              </div>
            </div>

            {/* {t('assessment.runner.category', 'Category')} */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                {t('assessment.runner.category', 'Category')}
              </p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {currentQuestion.category}
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0a1020]" dir="ltr">
          <div className="max-w-3xl mx-auto px-4 sm:px-12 py-6 sm:py-10">
            {/* Question text — supports inline code + fenced code blocks */}
            <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-8 sm:mb-10 text-left" role="heading" aria-level="2">
              {renderRichText(currentQuestion.questionText)}
            </div>

            {/* Answer options */}
            <div
              className="flex flex-col gap-3"
              role="radiogroup"
              aria-label="Answer options"
            >
              {currentQuestion.options.map((opt, idx) => (
                <AnswerOption
                  key={idx}
                  index={idx}
                  text={opt}
                  isSelected={selectedAnswer === idx}
                  onSelect={handleSelectAnswer}
                  disabled={loading || isSaving}
                />
              ))}
            </div>

            {/* Saving feedback */}
            {isSaving && (
              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Spinner size={11} />
                {t("assessment.runner.savingAnswer", "Saving your answer...")}
              </p>
            )}

            {/* Mobile hint */}
            <p className="mt-8 text-[11px] text-center text-slate-300 dark:text-slate-700 select-none sm:hidden">
              {t('assessment.runner.mobileHint', 'Tap an option to select · Use arrows below to navigate')}
            </p>
          </div>
        </main>
      </div>

      {/* ── Bottom navigation bar ─────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-slate-100 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] z-10">
        <div className="flex items-center justify-between sm:justify-center sm:gap-10 h-14 px-6">
          {/* Previous */}
          <button
            onClick={() => jumpToQuestion(currentQuestion.questionNumber - 1)}
            disabled={isFirstQuestion || loading}
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-30 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous question"
          >
            <span className="material-symbols-outlined text-[16px] rtl:rotate-180">
              arrow_back_ios
            </span>
            {t('assessment.runner.previous')}
          </button>

          {/* Counter + answered pill + grid toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {t('assessment.runner.questionOf', 'Question {{current}} of {{total}}', { current: currentQuestion.questionNumber, total: currentQuestion.totalQuestions })}
            </span>
            {answeredCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 tabular-nums">
                <span className="material-symbols-outlined text-[11px]">
                  check_circle
                </span>
                {answeredCount}
              </span>
            )}
            <button
              onClick={() => setGridModalOpen(true)}
              className={[
                "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                gridModalOpen
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white",
              ].join(" ")}
              title={t('assessment.runner.viewAll', 'View all questions')}
              aria-label="Open all questions overview"
              aria-expanded={gridModalOpen}
            >
              <span className="material-symbols-outlined text-[20px]">
                grid_view
              </span>
            </button>
          </div>

          {/* Next */}
          <button
            onClick={() => jumpToQuestion(currentQuestion.questionNumber + 1)}
            disabled={isLastQuestion || loading}
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-30 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Next question"
          >
            {t('assessment.runner.next')}
            <span className="material-symbols-outlined text-[16px] rtl:rotate-180">
              arrow_forward_ios
            </span>
          </button>
        </div>
      </footer>

      {gridModalOpen && (
        <QuestionGridModal
          questionStatuses={questionStatuses}
          currentQuestionNumber={currentQuestion.questionNumber}
          onNavigate={jumpToQuestion}
          onClose={() => setGridModalOpen(false)}
        />
      )}
    </div>
  );
};
