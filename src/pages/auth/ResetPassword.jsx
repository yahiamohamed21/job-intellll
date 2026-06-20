// src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../api/authService";
import { extractError } from "../../utils/extractError";
import { toastSuccess } from "../../lib/alerts";
import LogoIcon from "../../Components/LogoIcon.jsx";
import ElectricBorder from "../../Components/ElectricBorder.jsx";
import { useTheme } from "../../theme/ThemeProvider.jsx";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
    const { theme, setTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const nav = useNavigate();

    const [isTokenValid, setIsTokenValid] = useState(false);
    const [validating, setValidating] = useState(true);

    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setErr(t("resetPassword.validationFailed"));
            setValidating(false);
            return;
        }

        authService.validateResetToken(token)
            .then(() => setIsTokenValid(true))
            .catch(() => setErr(t("resetPassword.validationFailed")))
            .finally(() => setValidating(false));
    }, [token, t]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        if (newPassword !== confirmNewPassword) {
            setErr(t("resetPassword.passwordsMismatch"));
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, newPassword, confirmNewPassword);
            toastSuccess(t("resetPassword.success"));
            setTimeout(() => nav("/login"), 2000);
        } catch (ex) {
            setErr(extractError(ex));
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-[#0f172a] flex flex-col justify-center items-center px-4 transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 dark:border-[#7c3aed]/20 border-t-primary dark:border-t-[#7c3aed] rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{t("resetPassword.validating")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#0f172a] flex flex-col transition-colors duration-300 relative">
            <header className="flex items-center justify-between z-10 sticky top-0 md:bg-transparent w-full md:px-8 md:py-6 px-4 py-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <LogoIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </Link>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => i18n.changeLanguage((i18n.language || "en").toLowerCase().startsWith("ar") ? "en" : "ar")}
                        className="flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-[#1e293b] transition-colors"
                        type="button"
                    >
                        <span className="material-symbols-outlined text-[20px]">language</span>
                    </button>
                    <button
                        className="flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-[#1e293b] transition-colors"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        type="button"
                    >
                        <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                    <Link
                        to="/login"
                        className="px-5 py-2 md:py-2.5 rounded-full border-2 border-primary text-primary hover:bg-primary/10 dark:hover:bg-[#7c3aed]/10 dark:border-[#7c3aed] dark:text-[#7c3aed] transition-colors font-bold text-[13px] md:text-[14px]"
                    >
                        Login
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center pt-[10vh] px-4">
                <ElectricBorder
                    color={theme === 'dark' ? '#7c3aed' : '#fb923c'} // Dynamic glow color matching theme accents
                    speed={1}
                    chaos={0.12}
                    thickness={2}
                    style={{ borderRadius: 20 }}
                    className="w-full max-w-[440px] shadow-lg"
                >
                    <div className="w-full p-8 md:p-10 relative z-10 flex flex-col bg-white dark:bg-[#1e293b] rounded-2xl md:rounded-[20px] dark:border dark:border-[#334155] transition-colors duration-300">
                        {err ? (
                            <div className="flex flex-col items-center text-center py-4">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-5">
                                    <span className="material-symbols-outlined text-[24px]">error</span>
                                </div>
                                <h2 className="text-2xl font-bold text-dark-charcoal dark:text-white mb-3">{t("resetPassword.validationFailed")}</h2>
                                <p className="text-[13px] md:text-[14px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-200 dark:border-red-500/20 font-medium leading-relaxed mb-6 w-full text-center">
                                    {err}
                                </p>
                                <Link
                                    to="/forgot-password"
                                    className="w-full h-11 md:h-12 rounded-xl md:rounded-lg bg-primary hover:bg-primary-hover dark:bg-[#7c3aed] dark:hover:bg-[#6d28d9] text-white font-bold text-[14px] transition-all flex items-center justify-center shadow-lg"
                                >
                                    {t("resetPassword.requestNewLink")}
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-center text-center mb-8">
                                    <div className="w-12 h-12 bg-primary/10 dark:bg-[#7c3aed]/10 text-primary dark:text-[#7c3aed] rounded-full flex items-center justify-center mb-5 transition-colors">
                                        <span className="material-symbols-outlined text-[24px]">lock_reset</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-dark-charcoal dark:text-white mb-3">{t("resetPassword.title")}</h2>
                                    <p className="text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        {t("resetPassword.subtitle")}
                                    </p>
                                </div>

                                <form onSubmit={onSubmit} className="space-y-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[12px] md:text-[13px] font-bold text-dark-charcoal dark:text-slate-200 block text-left">
                                            {t("resetPassword.newPasswordLabel")}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="w-full h-11 md:h-12 pl-4 pr-12 rounded-xl md:rounded-lg bg-white dark:bg-[#0f172a] border border-light-gray-stroke dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#7c3aed]/30 focus:border-primary dark:focus:border-[#7c3aed] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {showPassword ? "visibility_off" : "visibility"}
                                                </span>
                                            </button>
                                        </div>
                                        <p className="text-[11px] md:text-[12px] text-slate-400 dark:text-slate-500 leading-tight">
                                            {t("resetPassword.hint")}
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-left">
                                        <label className="text-[12px] md:text-[13px] font-bold text-dark-charcoal dark:text-slate-200 block text-left">
                                            {t("resetPassword.confirmPasswordLabel")}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="w-full h-11 md:h-12 pl-4 pr-12 rounded-xl md:rounded-lg bg-white dark:bg-[#0f172a] border border-light-gray-stroke dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#7c3aed]/30 focus:border-primary dark:focus:border-[#7c3aed] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {showConfirmPassword ? "visibility_off" : "visibility"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-11 md:h-12 rounded-xl md:rounded-lg bg-primary hover:bg-primary-hover dark:bg-[#7c3aed] dark:hover:bg-[#6d28d9] text-white font-bold text-[14px] transition-all flex items-center justify-center disabled:opacity-70 cursor-pointer"
                                    >
                                        {loading ? t("resetPassword.resettingBtn") : t("resetPassword.resetBtn")}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </ElectricBorder>

                <div className="mt-auto py-6 text-center w-full">
                    <p className="text-[11px] md:text-[12px] text-slate-400 dark:text-slate-500 font-medium">
                        © 2024 Job Intel Platform. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
