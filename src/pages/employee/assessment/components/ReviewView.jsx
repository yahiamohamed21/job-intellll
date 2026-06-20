import React, { useState } from "react";
import { scoreColorClass, OPTION_LETTERS } from "../utils/helpers";
import { renderRichText, stripMarkdown } from "../utils/textFormatting";

import { ScoreBar } from "./AssessmentSharedUI";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────────────────────

export const ReviewView = ({ reviewData, onBack }) => {
  const { t, i18n } = useTranslation();
  const {
    overallScore,
    technicalScore,
    softSkillsScore,
    performanceLevel,
    technicalCorrect,
    technicalTotal,
    softSkillCorrect,
    softSkillTotal,
    questionResults,
    skillScores,
    stats,
  } = reviewData;

  const skillBreakdown = skillScores || [];
  const assessedSkills = skillBreakdown
    .filter((s) => s.isClaimedSkill)
    .map((s) => s.skillName);

  const resolvedPerformanceLevel = performanceLevel ? t(`assessment.review.perf_${performanceLevel.toLowerCase()}`, performanceLevel) : "—";

  const [showDetailed, setShowDetailed] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const perfColors = {
    bg:
      overallScore >= 75
        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
        : overallScore >= 50
          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400",
  };

  return (
    <div
      className="max-w-4xl mx-auto bg-white dark:bg-[#0a1020] border border-slate-200 dark:border-slate-400/[.14] rounded-xl overflow-hidden shadow-sm text-start"
      dir={i18n.dir()}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-400/[.14] bg-slate-50 dark:bg-slate-800/40 gap-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-white whitespace-nowrap truncate">
          {t('assessment.review.reviewAttempt', 'Assessment Review')}
        </h2>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('assessment.review.scoreReport', 'Score Report')}
          </span>
          <button
            onClick={onBack}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0c1424] border border-slate-300 dark:border-slate-400/[.14] rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <span className="sm:hidden">{t('assessment.review.dashboardShort', 'Dashboard')}</span>
            <span className="hidden sm:inline">{t('assessment.review.backToDashboard', 'Back to Dashboard')}</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex flex-col gap-5 sm:gap-6">
        {/* ══════════════════════════════════════════════
            COMPACT SCORE SUMMARY (REDESIGNED)
        ══════════════════════════════════════════════ */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] shadow-sm overflow-hidden">
          {/* ── Hero Section: {t('assessment.review.overallScore', 'Overall Score')} + Category Breakdown ── */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start p-6 sm:p-8 bg-slate-50/30 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-400/[.14]">

            {/* Left: Overall Score Hero */}
            <div className="flex flex-col items-center md:items-start shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                {t('assessment.review.overallScore', 'Overall Score')}
              </span>
              <div className="flex items-baseline gap-1" dir="ltr">
                <span className={`text-6xl sm:text-7xl font-black tabular-nums tracking-tight leading-none ${scoreColorClass(overallScore)}`}>
                  {overallScore?.toFixed(1)}
                </span>
                <span className="text-2xl font-bold text-slate-400 opacity-60">%</span>
              </div>
              <span className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase border ${perfColors.bg}`}>
                <span className="material-symbols-outlined text-[16px]">
                  {overallScore >= 75
                    ? "workspace_premium"
                    : overallScore >= 50
                      ? "trending_up"
                      : "trending_down"}
                </span>
                {resolvedPerformanceLevel}
              </span>
            </div>

            {/* Right: Clean Progress Bars */}
            <div className="flex-1 w-full flex flex-col justify-center gap-6 mt-2 md:mt-0 md:ps-2">
              {[
                {
                  label: t('assessment.review.technicalSkills', 'Technical Skills'),
                  score: technicalScore,
                  correct: technicalCorrect,
                  total: technicalTotal,
                },
                {
                  label: t('assessment.review.softSkills', 'Soft Skills'),
                  score: softSkillsScore,
                  correct: softSkillCorrect,
                  total: softSkillTotal,
                },
              ].map(({ label, score, correct, total }) => (
                <div key={label}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
                    <div className="text-end flex items-baseline gap-2" dir="ltr">
                      <span className={`text-lg font-black tabular-nums ${scoreColorClass(score)}`}>
                        {score?.toFixed(1)}%
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {correct} / {total}
                      </span>
                    </div>
                  </div>
                  <ScoreBar value={score} size="md" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick Stats Ribbon ── */}
          {stats && (
            <div className="flex flex-wrap items-center px-6 sm:px-8 py-3 sm:py-5 bg-white dark:bg-[#0a1020] border-b border-slate-100 dark:border-slate-400/[.14]">
              {[
                { label: t('assessment.review.answered', 'Answered'), value: `${stats.answeredQuestions}/${stats.totalQuestions}`, color: "text-slate-700 dark:text-slate-300" },
                { label: t('assessment.review.correct', 'Correct'), value: stats.correctAnswers, color: "text-emerald-600 dark:text-emerald-400" },
                { label: t('assessment.review.incorrect', 'Incorrect'), value: stats.wrongAnswers, color: "text-red-600 dark:text-red-400" },
                { label: t('assessment.review.skipped', 'Skipped'), value: stats.skippedQuestions, color: "text-amber-500 dark:text-amber-400" },
              ].map((stat, i) => (
                <div key={i} className={`flex items-baseline gap-1.5 sm:gap-2 w-1/2 md:w-1/4 py-2 md:py-0 ${i % 2 === 0 ? "justify-start pe-2" : "justify-end ps-2"} md:justify-center md:px-0`}>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}:</span>
                  <span className={`text-xs sm:text-sm md:text-base font-black tabular-nums ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Expandable Detailed Breakdown Toggle ── */}
          {skillBreakdown?.length > 0 && (
            <>
              <button
                onClick={() => setShowDetailed(!showDetailed)}
                className="w-full px-6 py-4 flex items-center justify-center sm:justify-between group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${showDetailed ? "rotate-180 text-blue-500" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}>
                    expand_circle_down
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors text-center sm:text-start">
                    <span className="sm:hidden">{showDetailed ? t('assessment.review.hideBreakdown', 'Hide Breakdown') : t('assessment.review.viewBreakdown', 'View Breakdown')}</span>
                    <span className="hidden sm:inline">{showDetailed ? t('assessment.review.hideDetailedBreakdown', 'Hide Detailed Skill Breakdown') : t('assessment.review.viewDetailedBreakdown', 'View Detailed Skill Breakdown')}</span>
                  </span>
                </div>
                {/* Visual hint of skills on the right when closed */}
                {!showDetailed && assessedSkills?.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    {assessedSkills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-400/[.14] rounded px-2 py-0.5">
                        {skill}
                      </span>
                    ))}
                    {assessedSkills.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-400">+{assessedSkills.length - 3}</span>
                    )}
                  </div>
                )}
              </button>

              {/* Expanded Skills Grid */}
              {showDetailed && (
                <div className="px-6 sm:px-8 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50/30 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-400/[.14]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 mt-4">
                    {skillBreakdown.map((sk) => (
                      <div key={sk.skillName} className="group">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {sk.isClaimedSkill && (
                              <span className="material-symbols-outlined text-[14px] text-blue-500 shrink-0" title={t('assessment.review.claimedSkill', 'Claimed Skill')}>
                                verified
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate transition-colors">
                              {sk.skillName}
                            </span>
                          </div>
                          <span className={`text-xs font-black tabular-nums ${scoreColorClass(sk.score)}`}>
                            {sk.score?.toFixed(1)}%
                          </span>
                        </div>
                        <ScoreBar value={sk.score} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── All Questions List (Cleaned & Minimal, Forced LTR/English per user request) ── */}
        <div className="space-y-6 pt-4" dir="ltr">
          {questionResults?.map((q, index) => {
            const isUnanswered = q.selectedAnswerIndex === null;
            const isCorrect = q.isCorrect;

            return (
              <div
                key={q.questionId}
                className="rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0a1020] shadow-sm overflow-hidden"
              >
                {/* ── Question Header (Toggleable) ── */}
                <button
                  onClick={() => toggleQuestion(q.questionId)}
                  className="w-full px-5 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 w-full sm:w-auto pr-0 sm:pr-4 text-left">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{t('assessment.review.questionShort', 'Q')}{index + 1}</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                      {stripMarkdown(q.questionText)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/60 dark:border-slate-400/[.14]">
                    <span
                      className={`inline-block min-w-[6rem] px-2 py-1.5 text-center text-[10px] sm:text-xs font-bold uppercase ${i18n.language === 'ar' ? 'tracking-normal' : 'tracking-widest'} rounded-lg border shadow-sm ${isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                        : isUnanswered
                          ? "bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-400/[.14]"
                          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50"
                        }`}
                    >
                      {isCorrect ? t('assessment.review.correct', 'Correct') : isUnanswered ? t('assessment.review.skipped', 'Skipped') : t('assessment.review.incorrect', 'Incorrect')}
                    </span>

                    <span className={`material-symbols-outlined text-slate-400 dark:text-slate-500 transition-transform duration-200 ${expandedQuestions[q.questionId] ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </div>
                </button>

                {/* ── Question Content ── */}
                {expandedQuestions[q.questionId] && (
                  <div className="p-5 sm:p-6 animate-in slide-in-from-top-1 fade-in duration-200 text-left">
                    {/* Full Question Text */}
                    <div className="text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-6 whitespace-pre-wrap">
                      {renderRichText(q.questionText)}
                    </div>

                    {/* Answer options (Minimalist) */}
                    <div className="space-y-3 mb-6 sm:mb-8">
                      {q.options.map((opt, optIdx) => {
                        const isUserChoice = q.selectedAnswerIndex === optIdx;
                        const isActualAnswer = q.correctAnswerIndex === optIdx;

                        const optionStyles = isActualAnswer
                          ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/60 shadow-sm"
                          : isUserChoice && !isActualAnswer
                            ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/60 shadow-sm"
                            : "bg-white dark:bg-[#0a1020]/50 border-slate-200 dark:border-slate-400/[.14]";

                        const radioIconColor = isActualAnswer
                          ? "text-emerald-500 dark:text-emerald-400"
                          : isUserChoice && !isActualAnswer
                            ? "text-red-500 dark:text-red-400"
                            : "text-slate-400 dark:text-slate-500";

                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-xl text-sm border transition-colors ${optionStyles}`}
                          >
                            <div className={`flex items-center gap-2 shrink-0 ${radioIconColor} mt-0.5`}>
                              <span className="material-symbols-outlined text-[18px]">
                                {isActualAnswer
                                  ? "check_circle"
                                  : isUserChoice
                                    ? "cancel"
                                    : "radio_button_unchecked"}
                              </span>
                              <span className="text-sm font-bold">
                                {OPTION_LETTERS[optIdx]}.
                              </span>
                            </div>

                            <div className={`flex-1 leading-relaxed ${isActualAnswer || isUserChoice ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-700 dark:text-slate-300"}`}>
                              {renderRichText(opt)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation (Neutral Theme) */}
                    {q.explanation && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-400/[.14]">
                        <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                          lightbulb
                        </span>
                        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap flex-1">
                          {renderRichText(q.explanation)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
