// src/routes/RequireWizardStep.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Route guard for wizard step pages.
 * Ensures the user can only access the wizard step matching their current progress.
 *
 * - profileCompletionStep = 0 → can access /step-0
 * - profileCompletionStep = 1 → can access /step-0, /step-1
 * - profileCompletionStep = 2 → can access /step-0 through /step-2
 * - profileCompletionStep = 3 → can access /step-0 through /step-3
 * - profileCompletionStep >= 4 → wizard complete, redirect to /employee
 *
 * Non-JobSeeker users are redirected to /.
 */
export default function RequireWizardStep({ children, allowedStep }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const accountType = (user.accountType || "").toString();
  const isJobSeeker =
    accountType === "JobSeeker" || accountType === "0";

  // Non-JobSeekers should not access wizard pages
  if (!isJobSeeker) {
    return <Navigate to="/" replace />;
  }

  const currentStep = user.profileCompletionStep ?? 0;

  // Wizard is complete — redirect to dashboard
  if (currentStep >= 4) {
    return <Navigate to="/employee" replace />;
  }

  // User can access steps 0 through currentStep
  // They cannot skip ahead to future steps
  if (allowedStep > currentStep) {
    return <Navigate to={`/step-${currentStep}`} replace />;
  }

  return children;
}
