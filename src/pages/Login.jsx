// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { authService } from "../api/authService.js";
import { extractError } from "../utils/extractError.js";
import { toastSuccess, alertError, toastInfo } from "../lib/alerts";
import LogoIcon from "../Components/LogoIcon.jsx";

// مهم جداً: هنجيب hook بتاع اللودر
import { useLoader } from "../loader/LoaderProvider.jsx";
import { GoogleLogin } from '@react-oauth/google';
import { useTheme } from "../theme/ThemeProvider.jsx";

// Determine the correct post-login route based on profile completion
export function getPostLoginRoute(user, fallback) {
  // Map accountType enum to route role
  const accountType = (user.accountType || '').toString();
  const isRecruiter = accountType === 'Recruiter' || accountType === '1';
  const isJobSeeker = accountType === 'JobSeeker' || accountType === '0';

  // JobSeekers with incomplete profiles go to wizard
  // Backend steps 0-3 map directly to frontend routes /step-0 through /step-3
  if (isJobSeeker && (user.profileCompletionStep ?? 0) < 4) {
    const currentStep = user.profileCompletionStep ?? 0;
    return `/step-${currentStep}`;
  }

  // Incomplete recruiters go to company-info wizard
  if (isRecruiter && (user.profileCompletionStep ?? 0) < 1) {
    return '/recruiter-setup';
  }
  if (isRecruiter) return '/hr';
  return fallback || '/employee';
}

// Validate that a `from` path is appropriate for the user's role
function getSafeRedirect(from, user) {
  if (!from || typeof from !== "string") return null;
  // Only allow internal paths
  if (!from.startsWith("/")) return null;
  const accountType = (user.accountType || '').toString();
  const isRecruiter = accountType === 'Recruiter' || accountType === '1';
  const isJobSeeker = accountType === 'JobSeeker' || accountType === '0';
  // Recruiter paths
  if (from.startsWith("/hr") || from === "/recruiter-setup") {
    return isRecruiter ? from : null;
  }
  // JobSeeker paths
  if (from.startsWith("/employee") || from.startsWith("/step-")) {
    return isJobSeeker ? from : null;
  }
  // Public paths are always safe
  if (from === "/" || from === "/about" || from === "/login" || from === "/signup") {
    return null; // don't redirect back to public pages
  }
  return null;
}

export default function Login() {
  const { user, login: authContextLogin } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const { suppressNextLoader } = useLoader();
  const { theme } = useTheme();

  const [accountType, setAccountType] = useState("JobSeeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [err, setErr] = useState("");
  const [lockout, setLockout] = useState(null); // { end: string, minutes: number }
  const [loading, setLoading] = useState(false);

  // Already-logged-in guard: redirect to appropriate dashboard
  if (user) {
    const target = getPostLoginRoute(user, "/employee");
    return <Navigate to={target} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLockout(null);
    setLoading(true);

    try {
      const { data } = await authService.login(email, password);

      authContextLogin(data.token, data.user);
      suppressNextLoader();
      toastSuccess("تم تسجيل الدخول بنجاح");

      const safeFrom = getSafeRedirect(loc.state?.from, data.user);
      const to = safeFrom || getPostLoginRoute(data.user);
      nav(to, { replace: true });

    } catch (ex) {
      const responseData = ex.response?.data;
      if (!responseData) {
        setErr("Login failed.");
        alertError("فشل تسجيل الدخول", "Login failed.");
        setLoading(false);
        return;
      }

      const extractedError = extractError(ex);
      setErr(extractedError);

      // Account locked — show timer
      if (responseData.lockoutEnd) {
        setLockout({ end: responseData.lockoutEnd, minutes: responseData.remainingMinutes });
      }

      // Email not verified — redirect
      if (extractedError.toLowerCase().includes("not verified")) {
        toastInfo("Please verify your email to continue.");
        setTimeout(() => nav("/verify-email", { state: { email } }), 2000);
      }

      // Google-only account
      if (extractedError.toLowerCase().includes("google sign-in")) {
        toastInfo("Use the Google SignIn button instead.");
      }

      alertError("فشل", extractedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row-reverse min-h-screen w-full bg-background-light dark:bg-background-dark text-white font-display overflow-hidden">
      {/* Left Section: Brand Immersion */}
      <div className="relative hidden lg:flex lg:w-5/12 xl:w-[45%] flex-col justify-between p-12 overflow-hidden bg-[#121212]">
        {/* Decorative Background */}
        <div
          className="absolute inset-0 z-0 opacity-100 bg-cover bg-center"
          title="Login Image"
          style={{ backgroundImage: "url('/login/login_img_1.jpg')" }}
        ></div>
        <div className="absolute inset-0 z-10 bg-black/50 md:bg-black/60 lg:bg-gradient-to-br lg:from-background-dark/95 lg:via-background-dark/80 lg:to-black/60"></div>
        {/* Logo */}
        <div className="relative z-20 flex items-center gap-4">
          <LogoIcon className="w-32 h-auto text-primary" />
        </div>
        {/* Hero Text */}
        <div className="relative z-20 mt-auto max-w-xl">
          <h2 className="text-5xl xl:text-6xl font-black leading-tight tracking-tight text-white mb-6">
            Decode the Market.<br />
            <span className="text-primary">Secure the Talent.</span>
          </h2>
          <p className="text-lg text-white/70 leading-relaxed font-light">
            Harness the power of AI-driven market analysis and predictive recruitment tools to stay ahead of the competition.
          </p>
        </div>
        {/* Footer Quote/Info */}
        <div className="relative z-20 mt-12 flex items-center gap-4 text-sm text-white/50">
          <div className="h-[1px] w-12 bg-white/20"></div>
          <span>Trusted by 500+ Fortune companies worldwide</span>
        </div>
      </div>

      {/* Right Section: Login Form */}
      <div className="w-full lg:w-7/12 xl:w-[55%] flex flex-col items-center justify-center p-8 md:p-16 bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-[440px]">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-500 dark:text-[#bbba9b]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-semibold hover:underline decoration-2">Sign up for free</Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={onSubmit}>
            {err && (
              <div className="text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg">
                {err}
              </div>
            )}

            {lockout && (
              <div className="text-sm text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 p-3 rounded-lg">
                Account is locked. Try again in {lockout.minutes} minutes.
              </div>
            )}

            {/* Account Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-white/80">
                I want to log in as a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-surface-dark/50 border-gray-200 dark:border-input-border has-[:checked]:border-primary dark:has-[:checked]:border-primary bg-white dark:bg-surface-dark">
                  <input
                    checked={accountType === "Recruiter"}
                    className="sr-only"
                    name="user-type"
                    type="radio"
                    value="Recruiter"
                    onChange={() => setAccountType("Recruiter")}
                  />
                  <div className="flex flex-col items-center gap-2 group">
                    <span className={`material-symbols-outlined transition-colors ${accountType === "Recruiter" ? 'text-primary' : 'text-gray-400 dark:text-white/50'}`}>business_center</span>
                    <span className={`text-sm font-bold transition-colors ${accountType === "Recruiter" ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50'}`}>Recruiter</span>
                  </div>
                </label>
                <label className="relative flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-surface-dark/50 border-gray-200 dark:border-input-border has-[:checked]:border-primary dark:has-[:checked]:border-primary bg-white dark:bg-surface-dark">
                  <input
                    checked={accountType === "JobSeeker"}
                    className="sr-only"
                    name="user-type"
                    type="radio"
                    value="JobSeeker"
                    onChange={() => setAccountType("JobSeeker")}
                  />
                  <div className="flex flex-col items-center gap-2 group">
                    <span className={`material-symbols-outlined transition-colors ${accountType === "JobSeeker" ? 'text-primary' : 'text-gray-400 dark:text-white/50'}`}>person</span>
                    <span className={`text-sm font-bold transition-colors ${accountType === "JobSeeker" ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50'}`}>Job Seeker</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-white/80">Email Address</label>
              <input
                className="w-full px-4 py-4 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-input-border text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#bbba9b] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-white/80">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-input-border text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#bbba9b] focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#bbba9b] hover:text-gray-600 dark:hover:text-white transition-colors flex items-center justify-center p-1"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center gap-3">
              <input
                className="w-4 h-4 rounded border-gray-300 dark:border-input-border text-primary focus:ring-primary bg-transparent"
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <label className="text-sm text-gray-600 dark:text-[#bbba9b] cursor-pointer" htmlFor="remember">Stay logged in for 30 days</label>
            </div>

            {/* Login Button */}
            <button
              className="w-full py-4 bg-primary text-background-dark font-black text-base rounded-lg hover:shadow-[0_8px_20px_rgba(249,123,5,0.4)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOG IN"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10 flex items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-border-dark"></div>
            <span className="px-4 text-xs font-bold text-gray-400 dark:text-[#bbba9b] uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-gray-200 dark:border-border-dark"></div>
          </div>

          {/* Social Logins */}
          <div className="flex justify-center mb-6 w-full items-center">
            <div className="w-full max-w-[280px]">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setLoading(true);
                  setErr("");
                  try {
                    const { data } = await authService.googleAuth(credentialResponse.credential, accountType);
                    authContextLogin(data.token, data.user);
                    suppressNextLoader();
                    toastSuccess("تم تسجيل الدخول بنجاح");
                    const safeFrom = getSafeRedirect(loc.state?.from, data.user);
                    const to = safeFrom || getPostLoginRoute(data.user);
                    nav(to, { replace: true });
                  } catch (ex) {
                    setErr(extractError(ex));
                    alertError("فشل تسجيل الدخول بجوجل", extractError(ex));
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  console.error("Google Login Failed");
                  setErr("فشل تسجيل الدخول باستخدام جوجل.");
                }}
                shape="rectangular"
                theme={theme === "dark" ? "filled_black" : "outline"}
                size="large"
                width="280"
                text="continue_with"
                locale="en"
              />
            </div>
          </div>

          {/* Simple Footer Link */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-400 dark:text-[#bbba9b]/50">
              © 2026 Job Intel Platform. All rights reserved. <br />
              <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link> • <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
