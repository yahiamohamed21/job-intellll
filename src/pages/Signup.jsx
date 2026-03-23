import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { authService } from "../api/authService";
import { extractError } from "../utils/extractError";
import { useAuth } from "../context/AuthContext";
import LogoIcon from "../Components/LogoIcon.jsx";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { useGoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const { user, login: authContextLogin } = useAuth();
  const { theme, setTheme } = useTheme();
  const nav = useNavigate();

  const [accountType, setAccountType] = useState("JobSeeker");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await authService.googleAuth(tokenResponse.access_token, accountType);
        authContextLogin(data.token, data.user);
        const to = data.user.accountType === "Recruiter" ? "/hr" : "/employee";
        nav(to, { replace: true });
      } catch (ex) {
        setErr(extractError(ex));
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Signup Failed", error);
      setErr("Failed to sign up with Google.");
    },
  });

  // If already logged in, redirect
  if (user) {
    const go = user.accountType === "Recruiter" ? "/hr" : "/employee";
    return <Navigate to={go} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!agreeTerms) {
      setErr("You must agree to the Terms of Service.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType
      });
      nav("/verify-email", { state: { email } });
    } catch (ex) {
      setErr(extractError(ex));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfbfa] dark:bg-[#111623] min-h-screen flex flex-col font-display selection:bg-primary/20 transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5 bg-white dark:bg-[#111623] border-b border-light-gray-stroke dark:border-[#1e293b] sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-24 md:w-32 h-auto text-primary" />
          {/* Logo Text hidden in dark mode, visible in light mode */}
        </div>
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <button className="hover:text-dark-charcoal dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">translate</span>
          </button>
          <button
            className="hover:text-dark-charcoal dark:hover:text-blue-400 transition-colors text-primary dark:text-[#3b82f6]"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <Link to="/login" className="hidden sm:block ml-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-[13px] font-bold transition-colors dark:border-none border border-transparent">
            Get Started
          </Link>

        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left visually engaging side (Gradient) */}
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-center px-16 relative overflow-hidden bg-gradient-to-br from-[#3b55a0] via-[#856b7c] to-[#dc7432] dark:from-[#0f172a] dark:via-[#1e3a8a] dark:to-[#0f172a] transition-all duration-300">
          <div className="relative z-10 max-w-md w-full mx-auto">
            {/* Light Mode Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-8 dark:hidden">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              THE FUTURE OF RECRUITMENT
            </div>

            {/* Dark Mode Tag */}
            <div className="hidden dark:inline-flex items-center px-4 py-1 rounded-full border border-blue-500/30 text-blue-400 text-[11px] font-bold uppercase tracking-widest mb-8">
              SMART ANALYTICS
            </div>

            {/* Light Mode Title */}
            <h2 className="dark:hidden text-white text-[44px] font-extrabold leading-[1.1] mb-6">
              Redefining the <br /><span className="text-primary">Talent Economy</span>
            </h2>

            {/* Dark Mode Title */}
            <h2 className="hidden dark:block text-white text-[44px] font-extrabold leading-[1.15] mb-6">
              Master the <span className="text-[#3b82f6]">Job <br />Market</span> with Data <br />Intel.
            </h2>

            <p className="text-white/80 dark:text-slate-300 text-[15px] font-medium leading-relaxed mb-14 max-w-[340px]">
              {/* Light Mode Text */}
              <span className="dark:hidden">Gain unprecedented insights into market trends, competitive salary benchmarks, and AI-driven candidate matching.</span>
              {/* Dark Mode Text */}
              <span className="hidden dark:inline">Join thousands of employers and job seekers using our real-time analysis tools to gain an unfair advantage in today's competitive landscape.</span>
            </p>

            <div className="space-y-4 max-w-[380px] dark:space-y-0 dark:flex dark:gap-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md dark:flex-col dark:bg-transparent dark:border-l-2 dark:border-blue-500/50 dark:border-t-0 dark:border-r-0 dark:border-b-0 dark:rounded-none dark:p-0 dark:pl-4">
                <div className="bg-primary/20 p-2 rounded-xl text-primary dark:bg-transparent dark:p-0 dark:mb-2 dark:text-blue-400">
                  <span className="material-symbols-outlined dark:hidden">monitoring</span>
                  <span className="material-symbols-outlined hidden dark:block text-[22px]">trending_up</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-[14px] dark:text-white dark:text-[15px] dark:mb-1">
                    <span className="dark:hidden">Real-time Analytics</span>
                    <span className="hidden dark:block">Trend Analysis</span>
                  </h4>
                  <p className="text-white/70 text-[13px] mt-1 pr-4 dark:text-slate-400 dark:pr-0 dark:mt-0 dark:leading-relaxed">
                    <span className="dark:hidden">Track industry-wide movements as they happen.</span>
                    <span className="hidden dark:block">Visualize salary benchmarks and industry growth.</span>
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md dark:flex-col dark:bg-transparent dark:border-l-2 dark:border-blue-500/50 dark:border-t-0 dark:border-r-0 dark:border-b-0 dark:rounded-none dark:p-0 dark:pl-4">
                <div className="bg-white/10 p-2 rounded-xl text-white/90 dark:bg-transparent dark:p-0 dark:mb-2 dark:text-blue-400">
                  <span className="material-symbols-outlined dark:hidden">psychology</span>
                  <span className="material-symbols-outlined hidden dark:block text-[22px]">hub</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-[14px] dark:text-white dark:text-[15px] dark:mb-1">
                    <span className="dark:hidden">Predictive Intelligence</span>
                    <span className="hidden dark:block">Smart Matching</span>
                  </h4>
                  <p className="text-white/70 text-[13px] mt-1 pr-4 dark:text-slate-400 dark:pr-0 dark:mt-0 dark:leading-relaxed">
                    <span className="dark:hidden">Anticipate hiring surges before they hit the market.</span>
                    <span className="hidden dark:block">AI-driven connections between talent and needs.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side form */}
        <div className="w-full lg:w-7/12 flex flex-col items-center justify-center overflow-y-auto bg-white dark:bg-[#111623] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent py-10 transition-colors duration-300">
          <div className="w-full max-w-[480px] px-6 py-6 md:py-8 mx-auto xl:max-w-[440px]">

            <div className="mb-10 text-center">
              <h1 className="text-dark-charcoal dark:text-white text-[28px] md:text-[32px] font-extrabold tracking-tight mb-2">
                <span className="dark:hidden">Get started for free</span>
                <span className="hidden dark:block">Create your account</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-[14px] md:text-[15px]">
                <span className="dark:hidden">No credit card required. Join 5,000+ top companies.</span>
                <span className="hidden dark:block">Start your 14-day free trial today.</span>
              </p>
            </div>

            {err && (
              <div className="mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
                {err}
              </div>
            )}

            {/* Progress Bar Area */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-dark-charcoal dark:text-slate-300 text-[12px] md:text-[13px] font-bold">
                  <span className="dark:hidden">Account Setup</span>
                  <span className="hidden dark:inline">Step 1: Account Setup</span>
                </span>
                <span className="text-primary dark:text-[#3b82f6] text-[12px] md:text-[13px] font-bold">33% <span className="dark:hidden">Complete</span></span>
              </div>
              <div className="h-[4px] md:h-[6px] w-full bg-slate-100 dark:bg-[#1e293b] rounded-full overflow-hidden">
                <div className="h-full bg-primary dark:bg-[#3b82f6] rounded-full transition-all duration-500 ease-out" style={{ width: "33%" }}></div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>

              <div className="space-y-3">
                <label className="text-[13px] font-bold text-dark-charcoal dark:text-slate-200">
                  <span className="dark:hidden">I want to use Job Intel as a...</span>
                  <span className="hidden dark:block">Who are you?</span>
                </label>

                {/* Unified Radios (Light & Dark) */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative flex cursor-pointer items-center justify-center rounded-xl md:rounded-lg border-2 p-4 md:py-5 transition-all hover:bg-slate-50 border-light-gray-stroke has-[:checked]:border-primary dark:has-[:checked]:border-[#3b82f6] bg-white dark:bg-[#111623] dark:border-[#1e293b] dark:hover:bg-[#1a2333]">
                    <input
                      checked={accountType === "Recruiter"}
                      className="sr-only"
                      name="user-type"
                      type="radio"
                      value="Recruiter"
                      onChange={() => setAccountType("Recruiter")}
                    />
                    <div className="flex flex-col items-center gap-2 group">
                      <span className={`material-symbols-outlined transition-colors ${accountType === "Recruiter" ? 'text-primary dark:text-[#3b82f6]' : 'text-slate-400 dark:text-[#64748b]'}`}>business_center</span>
                      <span className={`text-[13px] font-bold transition-colors ${accountType === "Recruiter" ? 'text-dark-charcoal dark:text-white' : 'text-slate-500 dark:text-[#94a3b8]'}`}>Recruiter</span>
                    </div>
                  </label>
                  <label className="relative flex cursor-pointer items-center justify-center rounded-xl md:rounded-lg border-2 p-4 md:py-5 transition-all hover:bg-slate-50 border-light-gray-stroke has-[:checked]:border-primary dark:has-[:checked]:border-[#3b82f6] bg-white dark:bg-[#111623] dark:border-[#1e293b] dark:hover:bg-[#1a2333]">
                    <input
                      checked={accountType === "JobSeeker"}
                      className="sr-only"
                      name="user-type"
                      type="radio"
                      value="JobSeeker"
                      onChange={() => setAccountType("JobSeeker")}
                    />
                    <div className="flex flex-col items-center gap-2 group">
                      <span className={`material-symbols-outlined transition-colors ${accountType === "JobSeeker" ? 'text-primary dark:text-[#3b82f6]' : 'text-slate-400 dark:text-[#64748b]'}`}>person</span>
                      <span className={`text-[13px] font-bold transition-colors ${accountType === "JobSeeker" ? 'text-dark-charcoal dark:text-white' : 'text-slate-500 dark:text-[#94a3b8]'}`}>Job Seeker</span>
                    </div>
                  </label>
                </div>

              </div>

              <div className="space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-dark-charcoal dark:text-slate-300" htmlFor="first-name">First Name</label>
                    <input
                      className="w-full h-11 px-4 rounded-xl md:rounded-lg bg-white dark:bg-[#0f172a] border border-light-gray-stroke dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#3b82f6]/30 focus:border-primary dark:focus:border-[#3b82f6] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                      id="first-name"
                      placeholder="John Doe"
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-dark-charcoal dark:text-slate-300" htmlFor="last-name">Last Name</label>
                    <input
                      className="w-full h-11 px-4 rounded-xl md:rounded-lg bg-white dark:bg-[#0f172a] border border-light-gray-stroke dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#3b82f6]/30 focus:border-primary dark:focus:border-[#3b82f6] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                      id="last-name"
                      placeholder="John Doe"
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-dark-charcoal dark:text-slate-300" htmlFor="email">Email Address</label>
                  <input
                    className="w-full h-11 px-4 rounded-xl md:rounded-lg bg-white dark:bg-[#0f172a] border border-light-gray-stroke dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#3b82f6]/30 focus:border-primary dark:focus:border-[#3b82f6] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                    id="email"
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-bold text-dark-charcoal dark:text-slate-300" htmlFor="password">Password</label>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider dark:capitalize dark:font-normal">Min. 8 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full h-11 px-4 pr-12 rounded-xl md:rounded-lg bg-white dark:bg-[#0f172a] border border-light-gray-stroke dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#3b82f6]/30 focus:border-primary dark:focus:border-[#3b82f6] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium tracking-[0.2em] font-sans"
                      id="password"
                      placeholder={showPassword ? "Create a password" : "••••••••"}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-dark-charcoal dark:hover:text-white transition-colors focus:outline-none"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-bold text-dark-charcoal dark:text-slate-300" htmlFor="confirm-password">Confirm Password</label>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full h-11 px-4 pr-12 rounded-xl md:rounded-lg bg-white dark:bg-[#0f172a] border border-light-gray-stroke dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#3b82f6]/30 focus:border-primary dark:focus:border-[#3b82f6] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium tracking-[0.2em] font-sans"
                      id="confirm-password"
                      placeholder={showConfirmPassword ? "Confirm your password" : "••••••••"}
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-dark-charcoal dark:hover:text-white transition-colors focus:outline-none"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>


              </div>

              <div className="flex items-start gap-3 py-1">
                <input
                  className="mt-1 w-[14px] h-[14px] rounded border-light-gray-stroke dark:border-[#334155] dark:bg-transparent text-primary dark:text-[#3b82f6] focus:ring-primary dark:focus:ring-[#3b82f6] focus:ring-offset-0 cursor-pointer"
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label className="text-[12px] md:text-[13px] text-slate-500 dark:text-slate-400 leading-snug" htmlFor="terms">
                  <span className="dark:hidden">I agree to the <Link to="#" className="text-primary font-bold hover:underline">Terms of Service</Link> and acknowledge the <Link to="#" className="text-primary font-bold hover:underline">Privacy Policy</Link>.</span>
                  <span className="hidden dark:inline">By creating an account, you agree to Job Intel's <Link to="#" className="text-[#3b82f6] hover:underline">Terms of Service</Link> and <Link to="#" className="text-[#3b82f6] hover:underline">Privacy Policy</Link>.</span>
                </label>
              </div>

              <button
                className="w-full h-[46px] bg-primary dark:bg-[#3b82f6] hover:bg-[#eb7104] dark:hover:bg-blue-600 text-dark-charcoal dark:text-white font-bold text-[15px] rounded-xl md:rounded-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 group"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && (
                  <>
                    <span className="material-symbols-outlined font-bold text-[18px] dark:hidden">arrow_forward</span>
                    <span className="hidden dark:inline-flex material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-light-gray-stroke dark:border-[#334155]"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase text-slate-400 dark:text-slate-500"><span className="bg-white dark:bg-[#111623] px-3">OR CONTINUE WITH</span></div>
            </div>

            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={() => googleLogin()}
                className="flex items-center justify-center gap-3 h-11 w-full max-w-[280px] rounded-xl md:rounded-lg border border-light-gray-stroke dark:border-[#334155] bg-white dark:bg-[#1a2333] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all text-[13px] font-bold text-dark-charcoal dark:text-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
            </div>

            <div className="text-center pb-4">
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                Already have an account?
                <Link to="/login" className="text-primary dark:text-[#3b82f6] font-bold hover:underline ml-1">
                  <span className="dark:hidden">Sign in to your account</span>
                  <span className="hidden dark:inline">Log in</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 px-6 md:px-12 border-t border-light-gray-stroke dark:border-[#1e293b] bg-[#fcfbfa] dark:bg-[#111623] transition-colors duration-300">
        <div className="mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-8 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-blue-500 dark:text-green-500">lock</span> <span className="dark:hidden">ISO 27001 Certified</span><span className="hidden dark:inline">Enterprise-grade security</span></span>
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-blue-500 dark:text-green-500">verified_user</span> <span className="dark:hidden">AES-256 Encrypted</span><span className="hidden dark:inline">GDPR & CCPA Compliant</span></span>
          </div>
          <div className="flex gap-6 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <Link to="#" className="hover:text-primary dark:hover:text-white transition-colors"><span className="dark:hidden uppercase tracking-wider font-bold">Help Center</span><span className="hidden dark:inline">Help Center</span></Link>
            <Link to="#" className="hover:text-primary dark:hover:text-white transition-colors"><span className="dark:hidden uppercase tracking-wider font-bold">Contact</span><span className="hidden dark:inline">Contact Support</span></Link>
            <span className="hidden dark:inline ml-2 border-l border-slate-600 pl-4">© 2026 Job Intel Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
