import React from "react";
import { useTranslation } from "react-i18next";
import { useAssessmentState } from "./assessment/hooks/useAssessmentState";
import { AssessmentAntiCheat } from "./assessment/components/AssessmentAntiCheat";
import { AssessmentDashboard } from "./assessment/components/AssessmentDashboard";
import { AssessmentRunner } from "./assessment/components/AssessmentRunner";
import { ReviewView } from "./assessment/components/ReviewView";
import { Spinner } from "./assessment/components/AssessmentSharedUI";

export default function Assessment() {
  const { t, i18n } = useTranslation();
  const assessmentState = useAssessmentState();

  const {
    loading,
    eligibility,
    activeAssessment,
    history,
    examMode,
    currentQuestion,
    questionStatuses,
    selectedAnswer,
    expiryTimeMs,
    isSaving,
    reviewData,
    tabSwitchWarningsRef,
    setReviewData,
    clearReview,
    showReview,
    handleStartAssessment,
    handleResumeAssessment,
    handleCompleteAssessment,
    handleTimeUp,
    jumpToQuestion,
    handleSelectAnswer,
    executeSubmit,
  } = assessmentState;

  // Render: full-page loading state
  if (loading && !eligibility && !examMode && !reviewData) {
    return (
      <div
        className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500 gap-3"
        dir={i18n.dir()}
      >
        <Spinner size={18} />
        <span className="text-sm font-medium">{t('assessment.loadingData')}</span>
      </div>
    );
  }

  // REVIEW MODE
  if (reviewData) {
    return (
      <div className="py-4 w-full select-none" dir={i18n.dir()}>
        <ReviewView
          reviewData={reviewData}
          onBack={clearReview}
        />
      </div>
    );
  }

  // EXAM MODE
  if (examMode && currentQuestion) {
    return (
      <AssessmentAntiCheat
        examMode={examMode}
        activeAssessment={activeAssessment}
        executeSubmit={executeSubmit}
        tabSwitchWarningsRef={tabSwitchWarningsRef}
      >
        <AssessmentRunner
          loading={loading}
          isSaving={isSaving}
          activeAssessment={activeAssessment}
          currentQuestion={currentQuestion}
          questionStatuses={questionStatuses}
          selectedAnswer={selectedAnswer}
          expiryTimeMs={expiryTimeMs}
          handleTimeUp={handleTimeUp}
          handleCompleteAssessment={handleCompleteAssessment}
          handleSelectAnswer={handleSelectAnswer}
          jumpToQuestion={jumpToQuestion}
        />
      </AssessmentAntiCheat>
    );
  }

  // DASHBOARD
  return (
    <AssessmentDashboard
      loading={loading}
      eligibility={eligibility}
      activeAssessment={activeAssessment}
      history={history}
      showReview={showReview}
      handleStartAssessment={handleStartAssessment}
      handleResumeAssessment={handleResumeAssessment}
    />
  );
}