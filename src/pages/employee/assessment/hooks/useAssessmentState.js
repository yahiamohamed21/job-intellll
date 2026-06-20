import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { assessmentService } from "../../../../api/assessmentService";
import { extractError } from "../../../../utils/extractError";
import { toastSuccess, alertError, confirmAction } from "../../../../lib/alerts";
import {
  getErrorStatus,
  getExpiryTimeMsFromIso,
  getExpiryTimeMsFromRemaining,
  getRemainingSecondsFromExpiry,
} from "../utils/helpers";

const TAB_WARN_KEY = (attemptId) => `tab_warnings_${attemptId}`;

export const useAssessmentState = () => {
  const isMounted = useRef(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ── State ─────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [history, setHistory] = useState(null);

  // Exam mode
  const [examMode, setExamMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionStatuses, setQuestionStatuses] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [expiryTimeMs, setExpiryTimeMs] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Anti-Cheat Ref
  const tabSwitchWarningsRef = useRef(0);

  // Review mode
  const [reviewData, setReviewData] = useState(null);

  const syncExpiryFromStatus = useCallback((statusData) => {
    const expiryFromIso = getExpiryTimeMsFromIso(statusData?.expiresAt);
    const expiryFromRemaining = getExpiryTimeMsFromRemaining(
      statusData?.timeRemainingSeconds,
    );
    setExpiryTimeMs(expiryFromIso ?? expiryFromRemaining);
  }, []);

  const syncExpiryFromRemaining = useCallback((remainingSeconds) => {
    const nextExpiryTimeMs = getExpiryTimeMsFromRemaining(remainingSeconds);
    if (nextExpiryTimeMs == null) return;
    setExpiryTimeMs(nextExpiryTimeMs);
  }, []);

  const loadReviewData = async (attemptId) => {
    const res = await assessmentService.getResult(attemptId);
    return res.data?.data ?? res.data;
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [eligRes, histRes] = await Promise.allSettled([
        assessmentService.checkEligibility(),
        assessmentService.getHistory(),
      ]);

      if (!isMounted.current) return;

      let nextEligibility = null;
      if (eligRes.status === "fulfilled") {
        nextEligibility = eligRes.value.data?.data ?? eligRes.value.data;
        setEligibility(nextEligibility);
      } else {
        setEligibility(null);
      }

      if (histRes.status === "fulfilled")
        setHistory(histRes.value.data?.data ?? histRes.value.data);

      if (nextEligibility?.hasInProgressAssessment) {
        try {
          const statusRes = await assessmentService.getCurrentStatus();
          if (!isMounted.current) return;
          setActiveAssessment(statusRes.data?.data ?? statusRes.data);
        } catch (ex) {
          if (getErrorStatus(ex) !== 404) {
            console.error("Failed to load current assessment status", ex);
          }
          setActiveAssessment(null);
        }
      } else {
        setActiveAssessment(null);
      }
    } catch (ex) {
      console.error("Dashboard load error", ex);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  const handleExpiredAttempt = useCallback(async () => {
    setLoading(true);
    try {
      const statusRes = await assessmentService.getCurrentStatus();
      if (!isMounted.current) return;
      const statusData = statusRes.data?.data ?? statusRes.data;

      if (statusData?.status === "Completed") {
        setExamMode(false);
        setCurrentQuestion(null);
        setExpiryTimeMs(null);
        const review = await loadReviewData(statusData.attemptId);
        if (!isMounted.current) return;
        setReviewData(review);
        return;
      }

      alertError(
        t("assessment.alerts.expiredTitle", "Assessment expired"),
        t("assessment.alerts.expiredSub", "Please submit your answers to finalize the attempt.")
      );
    } catch (ex) {
      if (!isMounted.current) return;
      if (getErrorStatus(ex) === 404) {
        setExamMode(false);
        setCurrentQuestion(null);
        setExpiryTimeMs(null);
        await loadDashboard();
        return;
      }
      alertError(t("dashboard.alerts.error", "Error"), extractError(ex));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [loadDashboard]);

  const fetchQuestionStatuses = useCallback(async () => {
    try {
      const res = await assessmentService.getQuestionStatuses();
      if (!isMounted.current) return;
      setQuestionStatuses(res.data?.data ?? res.data);
    } catch (ex) {
      if (!isMounted.current) return;
      if (getErrorStatus(ex) === 404) {
        await handleExpiredAttempt();
        return;
      }
      console.error("Failed to load question statuses", ex);
    }
  }, [handleExpiredAttempt]);

  const showReview = async (attemptId) => {
    setLoading(true);
    try {
      const review = await loadReviewData(attemptId);
      if (!isMounted.current) return;
      setReviewData(review);
      setSearchParams({ reviewId: attemptId }, { replace: true });
    } catch (ex) {
      if (!isMounted.current) return;
      alertError(t("assessment.alerts.loadReviewError", "Could not load review"), extractError(ex));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const clearReview = () => {
    setReviewData(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("reviewId");
    setSearchParams(newParams, { replace: true });
  };

  const executeSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await assessmentService.completeAssessment();
      if (!isMounted.current) return;
      toastSuccess(t("assessment.alerts.completed", "Assessment Completed!"));
      // Clear persisted warning count — attempt is permanently closed
      const attemptId = activeAssessment?.attemptId ?? activeAssessment?.id;
      if (attemptId) {
        try {
          localStorage.removeItem(TAB_WARN_KEY(attemptId));
        } catch { /* ignore */ }
      }
      tabSwitchWarningsRef.current = 0;
      setExamMode(false);
      setCurrentQuestion(null);
      setExpiryTimeMs(null);
      await loadDashboard();
    } catch (ex) {
      if (!isMounted.current) return;
      alertError(t("assessment.alerts.completeError", "Error completing"), extractError(ex));
      setLoading(false);
    }
  };

  const handleTimeUp = async () => {
    alertError(
      t("assessment.alerts.timeUpTitle", "Time is up!"),
      t("assessment.alerts.timeUpSub", "Your assessment will be submitted automatically.")
    );
    await handleExpiredAttempt();
  };

  const handleCompleteAssessment = async () => {
    if (loading || isSaving) return;
    if (getRemainingSecondsFromExpiry(expiryTimeMs) <= 0) {
      await executeSubmit();
      return;
    }

    const isConfirmed = await confirmAction(
      t("assessment.alerts.submitConfirmTitle", "Are you sure you want to submit?"),
      t("assessment.alerts.submitConfirmSub", "Once you submit, you will not be able to change your answers."),
      t("assessment.alerts.submitConfirmYes", "Yes, Submit"),
      t("assessment.alerts.submitConfirmNo", "No, Go Back")
    );
    if (!isConfirmed) return;
    await executeSubmit();
  };

  const enterExamMode = async () => {
    setLoading(true);
    try {
      const statusRes = await assessmentService.getCurrentStatus();
      if (!isMounted.current) return;
      const statusData = statusRes.data?.data ?? statusRes.data;
      if (statusData?.status === "Completed") {
        setExamMode(false);
        setCurrentQuestion(null);
        setExpiryTimeMs(null);
        const review = await loadReviewData(statusData.attemptId);
        if (!isMounted.current) return;
        setReviewData(review);
        return;
      }

      setActiveAssessment(statusData);
      syncExpiryFromStatus(statusData);
      const attemptId = statusData?.attemptId ?? statusData?.id;
      if (attemptId) {
        try {
          tabSwitchWarningsRef.current = parseInt(localStorage.getItem(TAB_WARN_KEY(attemptId)) ?? "0", 10) || 0;
        } catch { tabSwitchWarningsRef.current = 0; }
      }

      await fetchQuestionStatuses();
      if (!isMounted.current) return;

      try {
        const qRes = await assessmentService.getNextQuestion();
        if (!isMounted.current) return;
        const qData = qRes.data?.data ?? qRes.data;

        if (!qData) {
          alertError(
            t("assessment.alerts.allAnsweredTitle", "All questions answered"),
            t("assessment.alerts.allAnsweredSub", "Please submit your assessment.")
          );
          return;
        }

        setCurrentQuestion(qData);
        setSelectedAnswer(qData.selectedAnswerIndex ?? null);
        syncExpiryFromRemaining(qData.timeRemainingInAssessmentSeconds);
      } catch (ex) {
        if (!isMounted.current) return;
        if (getErrorStatus(ex) === 404) {
          const isConfirmed = await confirmAction(
            t("assessment.alerts.allAnsweredTitle", "All questions answered"),
            t("assessment.alerts.allAnsweredConfirm", "You have answered every question. Submit now?"),
            t("assessment.alerts.submit", "Submit"),
            t("assessment.alerts.review", "Review")
          );
          if (isConfirmed) {
            await executeSubmit();
          } else {
            const targetQuestion = currentQuestion?.questionNumber || 1;
            await jumpToQuestion(targetQuestion);
            setExamMode(true);
          }
          return;
        }
        throw ex;
      }

      setExamMode(true);
    } catch (ex) {
      if (!isMounted.current) return;
      alertError(t("dashboard.alerts.error", "Error"), extractError(ex));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    setLoading(true);
    try {
      await assessmentService.startAssessment();
      if (!isMounted.current) return;
      toastSuccess(t("assessment.alerts.started", "Assessment started successfully!"));
      tabSwitchWarningsRef.current = 0; 
      setExpiryTimeMs(null);
      await enterExamMode();
    } catch (ex) {
      if (!isMounted.current) return;
      if (getErrorStatus(ex) === 400) {
        try {
          const statusRes = await assessmentService.getCurrentStatus();
          if (!isMounted.current) return;
          const statusData = statusRes.data?.data ?? statusRes.data;
          if (statusData?.status === "InProgress") {
            await enterExamMode();
            return;
          }
        } catch (resumeEx) {
          console.error("Failed to resume assessment", resumeEx);
        }
      }
      alertError(t("assessment.alerts.startError", "Could not start assessment"), extractError(ex));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleResumeAssessment = async () => {
    setLoading(true);
    try {
      const statusRes = await assessmentService.resumeAssessment();
      if (!isMounted.current) return;
      const statusData = statusRes.data?.data ?? statusRes.data;
      if (statusData?.status === "Completed") {
        if (statusData?.isAutoSubmitted) {
          alertError(
            t("assessment.alerts.terminatedTitle", "Assessment Terminated"),
            t("assessment.alerts.terminatedSub", "Maximum tab switches exceeded. Your assessment has been automatically submitted.")
          );
        }
        setExamMode(false);
        setCurrentQuestion(null);
        setExpiryTimeMs(null);
        const review = await loadReviewData(statusData.attemptId);
        if (!isMounted.current) return;
        setReviewData(review);
        return;
      }

      await enterExamMode();
    } catch (ex) {
      if (!isMounted.current) return;
      if (getErrorStatus(ex) === 400) {
        alertError(t("assessment.alerts.terminatedTitle", "Assessment Terminated"), extractError(ex));
        await loadDashboard();
      } else {
        alertError(t("dashboard.alerts.error", "Error"), extractError(ex));
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const jumpToQuestion = async (number) => {
    setLoading(true);
    try {
      const res = await assessmentService.getQuestionByNumber(number);
      if (!isMounted.current) return;
      const qData = res.data?.data ?? res.data;
      setCurrentQuestion(qData);
      setSelectedAnswer(qData.selectedAnswerIndex ?? null);
      syncExpiryFromRemaining(qData.timeRemainingInAssessmentSeconds);
    } catch (ex) {
      if (!isMounted.current) return;
      if (getErrorStatus(ex) === 404) {
        await handleExpiredAttempt();
        return;
      }
      alertError(t("dashboard.alerts.error", "Error"), extractError(ex));
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleSelectAnswer = async (idx) => {
    if (!currentQuestion || isSaving || loading) return;
    setSelectedAnswer(idx);
    setIsSaving(true);
    
    // Optimistic UI Update for Answer Count
    setQuestionStatuses((prev) =>
      prev.map((q) =>
        q.questionNumber === currentQuestion.questionNumber
          ? { ...q, isAnswered: true }
          : q
      )
    );

    try {
      const res = await assessmentService.submitAnswer(
        currentQuestion.questionId,
        idx,
        15,
      );
      if (!isMounted.current) return;
      const submitData = res.data?.data ?? res.data;
      if (submitData?.timeRemainingSeconds != null) {
        syncExpiryFromRemaining(submitData.timeRemainingSeconds);
      }
      // Removed redundant fetchQuestionStatuses() since UI is optimistically updated!
    } catch (ex) {
      if (!isMounted.current) return;
      alertError(t("assessment.alerts.saveError", "Error saving answer"), extractError(ex));
      // Revert optimism if failed
      await fetchQuestionStatuses();
    } finally {
      if (isMounted.current) setIsSaving(false);
    }
  };

  // Run on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialReviewId = params.get("reviewId");
    if (initialReviewId) {
      showReview(initialReviewId).then(() => {
        loadDashboard();
      });
    } else {
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDashboard]);

  return {
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
    
    // Actions
    setReviewData,
    clearReview,
    loadDashboard,
    showReview,
    handleStartAssessment,
    handleResumeAssessment,
    handleCompleteAssessment,
    handleTimeUp,
    jumpToQuestion,
    handleSelectAnswer,
    executeSubmit,
  };
};
