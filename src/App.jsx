import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";

import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import PrivateRoute from "./routes/PrivateRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";

import EmployeeLayout from "./layout/employee/EmployeeLayout.jsx";
import HRLayout from "./layout/hr/HRLayout.jsx";

import Dashboard from "./pages/employee/Dashboard.jsx";
import Profile from "./pages/employee/Profile.jsx";
import Tests from "./pages/employee/Tests.jsx";
import VideoInterview from "./pages/employee/VideoInterview.jsx";
import Jobs from "./pages/employee/Jobs.jsx";
import Notifications from "./pages/employee/Notifications.jsx";
import Settings from "./pages/employee/Settings.jsx";

import HRDashboard from "./pages/hr/HRDashboard.jsx";
import HRJobs from "./pages/hr/HRJobs.jsx";
import HRCandidates from "./pages/hr/HRCandidates.jsx";
import HRNotifications from "./pages/hr/HRNotifications.jsx";
import HRSettings from "./pages/hr/HRSettings.jsx";

import Step1 from "./pages/step-profile/Step-1.jsx";
import Step2 from "./pages/step-profile/Step-2.jsx";
import Step3 from "./pages/step-profile/Step-3.jsx";

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
      // رجّع الفلاج لـfalse عشان المرات اللي جاية ترجع طبيعية
      setSuppressNext(false);
      // ومتعملش showLoader؛ وبرضه اتأكد مفيش لودر ظاهر
      hideLoader();
      return;
    }

    // السيناريو العادي: بين أي صفحتين جوه الابليكيشن
    showLoader();

    const id = setTimeout(() => {
      hideLoader();
    }, 1000); // Reduced delay slightly to make the app feel snappier

    return () => clearTimeout(id);
  }, [location.pathname, suppressNext, setSuppressNext, showLoader, hideLoader]);

  return (
    <Routes>
      {/* صفحات عامة */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Profile Steps */}
      <Route path="/step-1" element={<Step1 />} />
      <Route path="/step-2" element={<Step2 />} />
      <Route path="/step-3" element={<Step3 />} />

      {/* مناطق محمية */}
      <Route element={<PrivateRoute />}>
        {/* الموظف */}
        <Route element={<RoleRoute allow={["employee", "job-seeker"]} />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="tests" element={<Tests />} />
            <Route path="interview" element={<VideoInterview />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* HR */}
        <Route element={<RoleRoute allow="hr" />}>
          <Route path="/hr" element={<HRLayout />}>
            <Route index element={<HRDashboard />} />
            <Route path="jobs" element={<HRJobs />} />
            <Route path="candidates" element={<HRCandidates />} />
            <Route path="notifications" element={<HRNotifications />} />
            <Route path="settings" element={<HRSettings />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
