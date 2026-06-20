import React from "react";
import { Spinner, LoadingMessageCycler, ExpiryCountdown } from "./AssessmentSharedUI";
import { useTranslation, Trans } from "react-i18next";
import { scoreColorClass, statusPillClass } from "../utils/helpers";
import { wizardService } from "../../../../api/wizardService";

export const AssessmentDashboard = ({
  loading,
  eligibility,
  activeAssessment,
  history,
  showReview,
  handleStartAssessment,
  handleResumeAssessment,
}) => {
  const { t, i18n } = useTranslation();
  const [localizedJobTitles, setLocalizedJobTitles] = React.useState({});

  React.useEffect(() => {
    const fetchJobTitles = async () => {
      if (history?.attempts?.length > 0) {
        try {
          // Fetch English titles (what the backend history returns by default)
          // and current language titles to build a mapping dictionary
          const [enRes, currentRes] = await Promise.all([
            wizardService.getJobTitles("en"),
            wizardService.getJobTitles(i18n.language)
          ]);

          const enTitles = enRes.data?.data || enRes.data || [];
          const currentTitles = currentRes.data?.data || currentRes.data || [];

          const map = {};
          enTitles.forEach(enItem => {
            const match = currentTitles.find(c => c.id === enItem.id);
            if (match) {
              map[enItem.title] = match.title;
            }
          });
          setLocalizedJobTitles(map);
        } catch (error) {
          console.error("Failed to map localized job titles", error);
        }
      }
    };
    fetchJobTitles();
  }, [i18n.language, history?.attempts?.length]);

  return (
    <div
      className="space-y-5 max-w-4xl mx-auto text-start select-none"
      dir={i18n.dir()}
    >
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('assessment.dashboard.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('assessment.dashboard.subtitle')}
        </p>
      </div>

      {/* ── Active assessment resumption block ──────────────────────────── */}
      {activeAssessment &&
        !activeAssessment.isExpired &&
        activeAssessment.status === "InProgress" && (
          <div className="border border-amber-200 dark:border-amber-800/50 rounded-xl overflow-hidden bg-white dark:bg-[#0a1020] shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-amber-100 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0">
                  timer
                </span>
                <h3 className="text-sm sm:text-base font-bold text-amber-800 dark:text-amber-400 truncate">
                  {t('assessment.dashboard.inProgress')}
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 bg-amber-100/50 dark:bg-amber-900/30 px-2.5 py-1 rounded-md border border-amber-200/50 dark:border-amber-800/40 whitespace-nowrap shrink-0">{t('assessment.dashboard.resumeBtn')}</span>
            </div>

            {/* Body: two-column */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-amber-100 dark:divide-amber-800/30">
              {/* Left: progress info */}
              <div className="p-5 sm:p-6 flex flex-col gap-6">
                {/* Questions progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t('assessment.dashboard.questionsAnswered')}
                    </p>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums" dir="ltr">
                      {activeAssessment.questionsAnswered ?? 0} /{" "}
                      {activeAssessment.totalQuestions ?? 30}
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{
                        width: `${((activeAssessment.questionsAnswered ?? 0) / (activeAssessment.totalQuestions ?? 30)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                    {t('assessment.dashboard.questionsRemaining', '{{count}} questions remaining', { count: (activeAssessment.totalQuestions ?? 30) - (activeAssessment.questionsAnswered ?? 0) })}
                  </p>
                </div>

                {/* CTA + warning */}
                <div className="flex-1 flex flex-col justify-end items-center sm:items-start gap-3 mt-4 sm:mt-0">
                  <button
                    onClick={handleResumeAssessment}
                    disabled={loading}
                    className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                  >
                    {loading ? (
                      <Spinner size={14} />
                    ) : (
                      <span className="material-symbols-outlined text-[18px] rtl:rotate-180">
                        play_arrow
                      </span>
                    )}
                    {t('assessment.dashboard.resumeAssessmentBtn')}
                  </button>
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-start">
                    {t('assessment.dashboard.resumeAssessmentSub')}
                  </p>
                </div>
              </div>

              {/* Right: stats */}
              <div className="p-5 sm:p-6 flex flex-col gap-6 bg-slate-50/70 dark:bg-slate-800/20">
                {/* Time remaining */}
                {activeAssessment.expiryTime && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 sm:mb-3">
                      {t('assessment.dashboard.timeRemaining')}
                    </p>
                    <ExpiryCountdown expiryTime={activeAssessment.expiryTime} />
                  </div>
                )}

                {/* Warning about tab violations */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 sm:mb-3">
                    {t('assessment.dashboard.reminders')}
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2.5">
                    {[
                      { icon: "tab_close", text: t('assessment.dashboard.remindersList1') },
                      { icon: "timer", text: t('assessment.dashboard.remindersList2') },
                      { icon: "save", text: t('assessment.dashboard.remindersList3') },
                    ].map(({ icon, text }) => (
                      <li
                        key={text}
                        className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400"
                      >
                        <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-amber-500 shrink-0 mt-0.5">
                          {icon}
                        </span>
                        <span className="leading-tight">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ── New assessment / eligibility block ──────────────────────────── */}
      {(!activeAssessment ||
        activeAssessment.isExpired ||
        activeAssessment.status !== "InProgress") && (
          <div className="border border-slate-200 dark:border-slate-400/[.14] rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-400/[.14] bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {t('assessment.dashboard.newAssessment')}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {t('assessment.dashboard.skillsCertification')}
              </span>
            </div>

            <div className="bg-white dark:bg-[#0a1020]">
              {!eligibility ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 p-4 sm:p-6">
                  <Spinner size={14} />
                  {t('assessment.dashboard.checkingEligibility')}
                </div>
              ) : eligibility.isEligible ? (
                /* ── Eligible: two-column layout ── */
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700/60">
                  {/* LEFT: Eligibility status + skills + CTA */}
                  <div className="p-5 sm:p-6 flex flex-col gap-6">
                    {/* Eligibility badge */}
                    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                      <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium leading-snug">
                        <Trans
                          i18nKey="assessment.dashboard.eligibleMessage"
                          count={eligibility.claimedSkillsCount || 0}
                          components={{ 1: <strong /> }}
                        />
                      </p>
                    </div>

                    {/* Skill tags */}
                    {eligibility.claimedSkills?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5">
                          {t('assessment.dashboard.skillsBeingAssessed')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {eligibility.claimedSkills.map((s) => (
                            <span
                              key={s.skillId}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg text-[13px] font-medium text-blue-700 dark:text-blue-300 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[15px] opacity-70">
                                code
                              </span>
                              {s.skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Start button + hint */}
                    <div className="mt-2">
                      <button
                        onClick={handleStartAssessment}
                        disabled={loading}
                        className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                      >
                        {loading ? (
                          <>
                            <Spinner size={14} />
                            {t('assessment.dashboard.generatingAi')}
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px] rtl:rotate-180">
                              play_arrow
                            </span>
                            {t('assessment.dashboard.startAssessmentBtn')}
                          </>
                        )}
                      </button>
                      {loading ? (
                        <div className="mt-3 flex flex-col gap-1">
                          <LoadingMessageCycler />
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            {t('assessment.dashboard.generatingHint')}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                          {t('assessment.dashboard.startHint')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Stats + Rules */}
                  <div className="p-5 sm:p-6 flex flex-col gap-6 bg-slate-50/70 dark:bg-slate-800/20">
                    {/* Assessment stats */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 sm:mb-3">
                        {t('assessment.dashboard.assessmentDetails')}
                      </p>
                      {/* Mobile Minimal Inline View */}
                      <div className="md:hidden flex flex-wrap items-center gap-x-2 gap-y-2">
                        {[
                          { label: t('assessment.dashboard.detailsQuestions'), value: "20", icon: "quiz" },
                          { label: t('assessment.dashboard.detailsTimeLimit'), value: "30 min", icon: "timer" },
                          { label: t('assessment.dashboard.detailsPassScore'), value: "50%", icon: "verified" },
                        ].map(({ label, value, icon }) => (
                          <div key={label} className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-400/[.14] px-2 py-1 rounded-md shadow-sm">
                            <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500">{icon}</span>
                            <span className="font-bold">{value}</span>
                            <span className="text-slate-500">{label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Grid View */}
                      <div className="hidden md:grid grid-cols-3 gap-3 text-center">
                        {[
                          { label: t('assessment.dashboard.detailsQuestions'), value: "20", icon: "quiz" },
                          { label: t('assessment.dashboard.detailsTimeLimit'), value: "30 min", icon: "timer" },
                          {
                            label: t('assessment.dashboard.detailsPassScore'),
                            value: "50 %",
                            icon: "verified",
                          },
                        ].map(({ label, value, icon }) => (
                          <div
                            key={label}
                            className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-400/[.14] shadow-sm flex flex-col items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">
                              {icon}
                            </span>
                            <p className="text-base font-bold text-slate-900 dark:text-white leading-none">
                              {value}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate w-full">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Before you begin rules */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 sm:mb-3">
                        {t('assessment.dashboard.beforeYouBegin')}
                      </p>
                      <ul className="space-y-1.5 sm:space-y-2.5">
                        {[
                          { icon: "timer", text: t('assessment.dashboard.beforeYouBeginList1') },
                          { icon: "tab_close", text: t('assessment.dashboard.beforeYouBeginList2') },
                          { icon: "save", text: t('assessment.dashboard.beforeYouBeginList3') },
                          { icon: "redo", text: t('assessment.dashboard.beforeYouBeginList4') },
                        ].map(({ icon, text }) => (
                          <li
                            key={text}
                            className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400"
                          >
                            <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                              {icon}
                            </span>
                            <span className="leading-tight">{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Not eligible: two-column layout ── */
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700/60">
                  {/* LEFT: Error + cooldown info */}
                  <div className="p-5 sm:p-6 flex flex-col gap-6">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                      <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0 mt-0.5">
                        error
                      </span>
                      <div>
                        <p className="text-sm font-bold text-red-700 dark:text-red-400">{t('assessment.dashboard.notEligible')}</p>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">
                          {eligibility.reason === "Please wait 60 days before taking another assessment" ? t('assessment.dashboard.reasonCooldown', 'Please wait 60 days before taking another assessment') : eligibility.reason}
                        </p>
                      </div>
                    </div>

                    {/* Cooldown details */}
                    {eligibility.isInCooldownPeriod && (
                      <div className="px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-400/[.14] text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
                        {eligibility.daysUntilEligible != null && (
                          <p className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">
                              schedule
                            </span>
                            {t('assessment.dashboard.availableAgainIn')} <strong className="text-slate-800 dark:text-slate-200">{eligibility.daysUntilEligible} {t('assessment.dashboard.days')}</strong>
                          </p>
                        )}
                        {eligibility.currentScore != null && (
                          <p className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[15px] text-slate-400">
                              insights
                            </span>
                            {t('assessment.dashboard.lastScore')} <strong
                              className={scoreColorClass(
                                eligibility.currentScore,
                              )}
                            >
                              {eligibility.currentScore.toFixed(1)} %
                            </strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Requirements checklist */}
                  <div className="p-5 sm:p-6 flex flex-col gap-6 bg-slate-50/70 dark:bg-slate-800/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 sm:mb-3">
                      {t('assessment.dashboard.requirementsChecklist')}
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2.5">
                      {[
                        {
                          label: t('assessment.dashboard.reqProfile'),
                          met: eligibility.hasCompletedProfile,
                        },
                        { label: t('assessment.dashboard.reqJobTitle'), met: eligibility.hasJobTitle },
                        {
                          label: t('assessment.dashboard.reqSkills'),
                          met: eligibility.hasClaimedSkills,
                        },
                        {
                          label: t('assessment.dashboard.reqCooldown'),
                          met: !eligibility.isInCooldownPeriod,
                        },
                        {
                          label: t('assessment.dashboard.reqActive'),
                          met: !eligibility.hasInProgressAssessment,
                        },
                      ].map(({ label, met }) => (
                        <li
                          key={label}
                          className="flex items-start gap-2 sm:gap-2.5 text-[11px] sm:text-sm"
                        >
                          <span
                            className={`material-symbols-outlined text-[14px] sm:text-[16px] shrink-0 mt-0.5 ${met
                                ? "text-emerald-500"
                                : "text-slate-300 dark:text-slate-600"
                              }`}
                          >
                            {met ? "check_circle" : "radio_button_unchecked"}
                          </span>
                          <span
                            className={`leading-tight ${met
                                ? "text-slate-700 dark:text-slate-300"
                                : "text-slate-400 dark:text-slate-500"
                              }`}
                          >
                            {label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* ── Assessment history ────────────────────────────────────────────── */}
      {history?.attempts?.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-400/[.14] rounded-xl overflow-hidden text-left shadow-sm bg-white dark:bg-[#0a1020]">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-400/[.14] bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">{t('assessment.dashboard.historyTitle')}</h3>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              {history.bestScore != null && (
                <span>{t('assessment.dashboard.bestScore')}
                  <span
                    className={`font-bold ${scoreColorClass(history.bestScore)}`} dir="ltr"
                  >
                    {history.bestScore.toFixed(0)} %
                  </span>
                </span>
              )}
              <span>
                {t('assessment.dashboard.attemptsCount', '{{count}} attempt', { count: history.totalAttempts })}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <div className="flex-1 min-w-[120px] text-center">{t('assessment.dashboard.date')}</div>
              <div className="flex-[1.5] text-center">{t('assessment.dashboard.jobTitle')}</div>
              <div className="flex-1 text-center">{t('assessment.dashboard.score')}</div>
              <div className="flex-1 text-center">{t('assessment.dashboard.status')}</div>
              <div className="flex-1 text-center">{t('assessment.dashboard.actions')}</div>
            </div>

            {/* List Body */}
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
              {history.attempts.map((item) => (
                <div
                  key={item.attemptId}
                  className="px-4 sm:px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* MOBILE COMPACT VIEW */}
                  <div className="md:hidden flex justify-between items-stretch">
                    <div className="flex flex-col justify-between items-start gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {localizedJobTitles[item.jobTitle] || item.jobTitle || "—"}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {new Date(item.startedAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <span className={`inline-flex w-fit items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${statusPillClass(item.status)}`}>
                        {t(`assessment.dashboard.status_${item.status.toLowerCase()}`, item.status)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-between py-0.5">
                      {item.overallScore != null ? (
                        <span className={`font-black tabular-nums text-sm ${scoreColorClass(item.overallScore)}`} dir="ltr">
                          {item.overallScore.toFixed(0)} %
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                      <button
                        onClick={() => item.status === "Completed" && showReview(item.attemptId)}
                        disabled={item.status !== "Completed"}
                        className={[
                          "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors mt-auto border",
                          item.status === "Completed"
                            ? "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800/50 dark:hover:bg-blue-900/40"
                            : "text-slate-400 bg-slate-50 border-slate-200 dark:text-slate-500 dark:bg-slate-800/30 dark:border-slate-400/[.14] cursor-not-allowed opacity-60"
                        ].join(" ")}
                      >{t('assessment.dashboard.reviewBtn')}</button>
                    </div>
                  </div>

                  {/* DESKTOP ROW VIEW */}
                  <div className="hidden md:flex md:items-center">
                    {/* Date */}
                    <div className="flex-1 min-w-[120px] text-center">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {new Date(item.startedAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Job Title */}
                    <div className="flex-[1.5] text-center">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {localizedJobTitles[item.jobTitle] || item.jobTitle || "—"}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex-1 text-center">
                      <div className="text-sm">
                        {item.overallScore != null ? (
                          <span className={`font-bold tabular-nums ${scoreColorClass(item.overallScore)}`} dir="ltr">
                            {item.overallScore.toFixed(0)} %
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 text-center">
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${statusPillClass(item.status)}`}>
                        {t(`assessment.dashboard.status_${item.status.toLowerCase()}`, item.status)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex-1 text-center">
                      <button
                        onClick={() => item.status === "Completed" && showReview(item.attemptId)}
                        disabled={item.status !== "Completed"}
                        className={[
                          "px-4 py-2 text-xs font-bold rounded-lg transition-colors border",
                          item.status === "Completed"
                            ? "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800/50 dark:hover:bg-blue-900/40"
                            : "text-slate-400 bg-slate-50 border-slate-200 dark:text-slate-500 dark:bg-slate-800/30 dark:border-slate-400/[.14] cursor-not-allowed opacity-60"
                        ].join(" ")}
                      >{t('assessment.dashboard.reviewBtn')}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
