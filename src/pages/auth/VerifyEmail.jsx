import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { authService } from "../../api/authService";
import { extractError } from "../../utils/extractError";
import { toastSuccess, toastInfo } from "../../lib/alerts";
import { useTheme } from "../../theme/ThemeProvider.jsx";
import { useTranslation } from "react-i18next";
import LogoIcon from "../../Components/LogoIcon.jsx";

export default function VerifyEmail() {
    const { theme, setTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const loc = useLocation();
    const nav = useNavigate();

    // Check for email in navigation state or sessionStorage
    const [email, setEmail] = useState(() => {
        return loc.state?.email || sessionStorage.getItem("otp_email") || "";
    });

    const [emailFromState, setEmailFromState] = useState(() => {
        return !!(loc.state?.email || sessionStorage.getItem("otp_email"));
    });

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);

    const inputRefs = useRef([]);

    // Update email state if it is passed in the navigation state
    useEffect(() => {
        if (loc.state?.email) {
            setEmail(loc.state.email);
            setEmailFromState(true);
            sessionStorage.setItem("otp_email", loc.state.email);
        }
    }, [loc.state]);

    // Focus first input box on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Countdown Timer logic
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Helper to mask email
    const maskEmail = (emailStr) => {
        if (!emailStr) return "";
        const [localPart, domain] = emailStr.split("@");
        if (!domain) return emailStr;
        if (localPart.length <= 4) {
            return `${localPart.substring(0, 1)}***@${domain}`;
        }
        return `${localPart.substring(0, 2)}*****@${domain}`;
    };

    // Helper to format countdown timer as M:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    };

    const handleChange = (index, val) => {
        // Allow only digits
        const numericVal = val.replace(/[^0-9]/g, "");
        if (!numericVal) {
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
            return;
        }

        const newOtp = [...otp];
        const digits = numericVal.split("");
        let currIndex = index;

        for (let i = 0; i < digits.length && currIndex < 6; i++) {
            newOtp[currIndex] = digits[i];
            currIndex++;
        }
        setOtp(newOtp);

        // Auto focus the next empty box
        const nextIndex = Math.min(currIndex, 5);
        if (nextIndex !== index && inputRefs.current[nextIndex]) {
            inputRefs.current[nextIndex].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                // If current box is empty, clear the previous box and focus it
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
                if (inputRefs.current[index - 1]) {
                    inputRefs.current[index - 1].focus();
                }
            } else if (otp[index]) {
                // If current box has content, just clear it
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
        if (pastedData.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            // Focus on the last pasted index or the final box
            const focusIndex = Math.min(pastedData.length, 5);
            if (inputRefs.current[focusIndex]) {
                inputRefs.current[focusIndex].focus();
            }
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setMsg("");
        setLoading(true);

        const code = otp.join("");
        if (code.length !== 6) {
            setErr(t("verifyEmail.errInvalidCode", "Please enter a valid 6-digit code."));
            setLoading(false);
            return;
        }

        if (!email) {
            setErr(t("verifyEmail.errSpecifyEmail", "Please specify a valid email address."));
            setLoading(false);
            return;
        }

        try {
            await authService.verifyEmail(email, code);
            toastSuccess(t("verifyEmail.success", "Email verified successfully! Please log in."));
            sessionStorage.removeItem("otp_email");
            setTimeout(() => nav("/login"), 2000);
        } catch (ex) {
            setErr(extractError(ex));
        } finally {
            setLoading(false);
        }
    };

    const onResend = async () => {
        if (!email) {
            setErr(t("verifyEmail.errEnterEmail", "Please enter your email address first to resend code."));
            return;
        }

        setErr("");
        setMsg("");
        setLoading(true);
        try {
            await authService.resendVerification(email);
            setMsg(t("verifyEmail.resendSuccess", "Verification code sent successfully. Please check your email."));
            setTimer(60); // Reset timer
            // Focus on first input
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        } catch (ex) {
            setErr(extractError(ex));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#111623] transition-colors duration-300">
            {/* Header */}
            <header className="flex items-center justify-between px-6 md:px-12 py-5 bg-white dark:bg-[#111623] border-b border-light-gray-stroke dark:border-[#1e293b] sticky top-0 z-50 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <Link to="/">
                        <LogoIcon className="w-24 md:w-32 h-auto text-primary animate-pulse" />
                    </Link>
                </div>
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                    <button 
                        onClick={() => i18n.changeLanguage((i18n.language || "en").toLowerCase().startsWith("ar") ? "en" : "ar")}
                        className="hover:text-dark-charcoal dark:hover:text-white transition-colors flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-[20px]">translate</span>
                    </button>
                    <button
                        className="hover:text-dark-charcoal dark:hover:text-blue-400 transition-colors text-primary dark:text-[#3b82f6] flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        type="button"
                    >
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                            {theme === "dark" ? "light_mode" : "dark_mode"}
                        </span>
                    </button>

                    <Link to="/login" className="hidden sm:block ml-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-[13px] font-bold transition-colors dark:border-none border border-transparent">
                        {t("verifyEmail.loginBtn", "Login")}
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
                <div className="w-full max-w-[460px] bg-white dark:bg-[#1e293b] p-8 md:p-10 rounded-[28px] shadow-xl md:shadow-2xl border border-slate-100 dark:border-slate-800 text-center transition-colors duration-300">
                    
                    {/* Envelope + Shield Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[#f97316]">
                            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                                mail
                            </span>
                            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#f97316] border-2 border-white dark:border-[#1e293b] flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-[12px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    shield
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-3">
                        {t("verifyEmail.title", "Verify Your Email")}
                    </h2>

                    {/* Description Text */}
                    <div className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">
                        {emailFromState ? (
                            <p>
                                {t("verifyEmail.descWithEmail", "We've sent a 6-digit verification code to {{email}}. Enter it below to activate your account.", { email: maskEmail(email) })}
                            </p>
                        ) : (
                            <p>
                                {t("verifyEmail.descWithoutEmail", "Enter your email address below to receive a verification code.")}
                            </p>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="flex flex-col gap-6">
                        {err && (
                            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 p-3.5 rounded-xl border border-red-200 dark:border-red-500/20 text-left">
                                {err}
                            </div>
                        )}
                        {msg && (
                            <div className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-left">
                                {msg}
                            </div>
                        )}

                        {/* Email Input (if not from state / edited) */}
                        {!emailFromState && (
                            <div className="text-left animate-fadeIn">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                                    {t("verifyEmail.emailLabel", "Email Address")}
                                </label>
                                <input
                                    type="email"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950/50 outline-none transition-all font-medium text-left"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("verifyEmail.emailPlaceholder", "name@company.com")}
                                    required
                                />
                            </div>
                        )}

                        {/* OTP 6-Digit Grid */}
                        <div className="flex justify-center gap-2 md:gap-3" dir="ltr">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="tel"
                                    maxLength={1}
                                    className="w-11 h-14 md:w-13 md:h-16 text-center text-xl md:text-2xl font-extrabold border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f172a] rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-950/50 focus:bg-white outline-none text-slate-800 dark:text-white transition-all shadow-sm"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    required
                                />
                            ))}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || otp.join("").length !== 6 || !email}
                            className={`w-full h-12 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                                otp.join("").length === 6 && email && !loading
                                    ? "bg-[#f97316] text-white hover:bg-orange-600 active:scale-[0.98] shadow-lg shadow-orange-500/10 cursor-pointer"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                            }`}
                        >
                            {loading ? t("verifyEmail.verifying", "Verifying...") : (
                                <>
                                    {t("verifyEmail.submitBtn", "Verify Email")}
                                    <span className="material-symbols-outlined text-[18px]">
                                        arrow_forward
                                    </span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Resend Section */}
                    <div className="flex flex-col items-center gap-1.5 mt-8">
                        <span className="text-[13px] text-slate-400 dark:text-slate-500">
                            {t("verifyEmail.noCode", "Didn't receive the code?")}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-md font-mono">
                                {formatTime(timer)}
                            </span>
                            <button
                                type="button"
                                onClick={onResend}
                                disabled={timer > 0 || loading || !email}
                                className={`text-[13px] font-bold transition-colors ${
                                    timer > 0 || !email || loading
                                        ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                        : "text-[#f97316] hover:text-orange-600 cursor-pointer"
                                }`}
                            >
                                {t("verifyEmail.resendBtn", "Resend Code")}
                            </button>
                        </div>
                    </div>

                    {/* Back to Login */}
                    <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-5">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                arrow_back
                            </span>
                            {t("forgotPassword.login")}
                        </Link>
                    </div>
            </div>
        </div>
    </div>
);
}