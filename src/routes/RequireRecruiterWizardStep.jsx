// src/routes/RequireRecruiterWizardStep.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Route guard for the recruiter company-info wizard page.
 *
 * - profileCompletionStep >= 1 → wizard complete, redirect to /hr
 * - profileCompletionStep < 1  → allow access to company-info form
 * - Non-Recruiter users → redirect to /
 */
export default function RequireRecruiterWizardStep({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const accountType = (user.accountType || "").toString();
  const isRecruiter =
    accountType === "Recruiter" || accountType === "1";

  // Non-Recruiters should not access this page
  if (!isRecruiter) {
    return <Navigate to="/" replace />;
  }

  const currentStep = user.profileCompletionStep ?? 0;

  // Wizard is complete — redirect to HR dashboard
  if (currentStep >= 1) {
    return <Navigate to="/hr" replace />;
  }

  return children;
}
