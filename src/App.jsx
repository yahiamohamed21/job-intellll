// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NotFound from "./pages/NotFound.jsx";

import PrivateRoute from "./routes/PrivateRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";

import EmployeeLayout from "./layout/employee/EmployeeLayout.jsx";
import HRLayout from "./layout/hr/HRLayout.jsx";

// صفحات الموظف
import Dashboard from "./pages/employee/Dashboard.jsx";
import Profile from "./pages/employee/Profile.jsx";
import Tests from "./pages/employee/Tests.jsx";
import VideoInterview from "./pages/employee/VideoInterview.jsx";
import Jobs from "./pages/employee/Jobs.jsx";
import Notifications from "./pages/employee/Notifications.jsx";
import Settings from "./pages/employee/Settings.jsx";

// صفحات الـHR
import HRDashboard from "./pages/hr/HRDashboard.jsx";
import HRJobs from "./pages/hr/HRJobs.jsx";
import HRCandidates from "./pages/hr/HRCandidates.jsx";
import HRNotifications from "./pages/hr/HRNotifications.jsx";
import HRSettings from "./pages/hr/HRSettings.jsx";

export default function App() {
  return (
    <Routes>
      {/* صفحات عامة */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
  

      {/* مناطق محمية */}
      <Route element={<PrivateRoute />}>
        {/* الموظف */}
          <Route element={<RoleRoute allowed={["employee", "job-seeker"]} />}>
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
          <Route element={<RoleRoute allowed="hr" />}>
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
