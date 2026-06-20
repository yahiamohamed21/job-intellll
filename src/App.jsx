import React, { useEffect, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import FullScreenLoader from "./Components/FullScreenLoader.jsx";

// Main layouts and static pages (kept static for instant TTI)
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";
import Privacy from "./pages/Privacy.jsx";
import Faqs from "./pages/Faqs.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";

import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import PrivateRoute from "./routes/PrivateRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";
import RequireAuth from "./routes/RequireAuth.jsx";
import RequireWizardStep from "./routes/RequireWizardStep.jsx";
import RequireRecruiterWizardStep from "./routes/RequireRecruiterWizardStep.jsx";

import Step0 from "./pages/step-profile/Step-0.jsx";
import Step1 from "./pages/step-profile/Step-1.jsx";
import Step2 from "./pages/step-profile/Step-2.jsx";
import Step3 from "./pages/step-profile/Step-3.jsx";
import RecruiterSetup from "./pages/recruiter/RecruiterSetup.jsx";

// Lazy Loaded Modules (HR, Employee, Assessments, Interviews)
const EmployeeLayout = React.lazy(() => import("./layout/employee/EmployeeLayout.jsx"));
const HRLayout = React.lazy(() => import("./layout/hr/HRLayout.jsx"));

const Dashboard = React.lazy(() => import("./pages/employee/Dashboard.jsx"));
const Profile = React.lazy(() => import("./pages/employee/Profile.jsx"));
const Assessment = React.lazy(() => import("./pages/employee/Assessment.jsx"));
const VideoInterview = React.lazy(() => import("./pages/employee/VideoInterview.jsx"));
const Jobs = React.lazy(() => import("./pages/employee/Jobs.jsx"));
const Notifications = React.lazy(() => import("./pages/employee/Notifications.jsx"));
const Settings = React.lazy(() => import("./pages/employee/Settings.jsx"));

const HRDashboard = React.lazy(() => import("./pages/hr/HRDashboard.jsx"));
const HRJobs = React.lazy(() => import("./pages/hr/HRJobs.jsx"));
const HRCandidates = React.lazy(() => import("./pages/hr/HRCandidates.jsx"));
const HRCandidateProfile = React.lazy(() => import("./pages/hr/HRCandidateProfile.jsx"));
const HRNotifications = React.lazy(() => import("./pages/hr/HRNotifications.jsx"));
const HRSettings = React.lazy(() => import("./pages/hr/HRSettings.jsx"));

const AssessmentTest = React.lazy(() => import("./pages/AssessmentTest.jsx"));

import { useLoader } from "./loader/LoaderProvider.jsx";

export default function App() {
  const location = useLocation();

  const {
    showLoader,
    hideLoader,
    suppressNext,
    setSuppressNext
  } = useLoader();

  React.useLayoutEffect(() => {
    // لو متعلم إن المرة الجاية ما نظهرش اللودر (مثلاً بعد login redirect)
    if (suppressNext) {
      setSuppressNext(false);
      hideLoader();
      return;
    }

    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname, suppressNext, setSuppressNext, hideLoader]);

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        {/* صفحات عامة */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Profile Steps (require auth + step guard) */}
        <Route path="/step-0" element={<RequireAuth><RequireWizardStep allowedStep={0}><Step0 /></RequireWizardStep></RequireAuth>} />
        <Route path="/step-1" element={<RequireAuth><RequireWizardStep allowedStep={1}><Step1 /></RequireWizardStep></RequireAuth>} />
        <Route path="/step-2" element={<RequireAuth><RequireWizardStep allowedStep={2}><Step2 /></RequireWizardStep></RequireAuth>} />
        <Route path="/step-3" element={<RequireAuth><RequireWizardStep allowedStep={3}><Step3 /></RequireWizardStep></RequireAuth>} />

        {/* Recruiter company-info wizard */}
        <Route path="/recruiter-setup" element={<RequireAuth><RequireRecruiterWizardStep><RecruiterSetup /></RequireRecruiterWizardStep></RequireAuth>} />

        {/* مناطق محمية */}
        <Route element={<PrivateRoute />}>
          {/* الموظف */}
          <Route element={<RoleRoute allow={["employee", "job-seeker"]} />}>
            {/* Test Page for Assessment */}
            <Route path="/assessment-test" element={<AssessmentTest />} />
            
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="tests" element={<Assessment />} />
              <Route path="interview" element={<VideoInterview />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* HR (الشركة) */}
          <Route element={<RoleRoute allow={["hr", "company"]} />}>
            <Route path="/hr" element={<HRLayout />}>
              <Route index element={<HRDashboard />} />
              <Route path="jobs" element={<HRJobs />} />
              <Route path="candidates" element={<HRCandidates />} />
              <Route path="candidates/:candidateId" element={<HRCandidateProfile />} />
              <Route path="notifications" element={<HRNotifications />} />
              <Route path="settings" element={<HRSettings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
