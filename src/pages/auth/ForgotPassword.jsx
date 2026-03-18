import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../api/authService";
import { toastSuccess, toastInfo } from "../../lib/alerts";
import LogoIcon from "../../Components/LogoIcon.jsx";
import ElectricBorder from "../../Components/ElectricBorder.jsx";
import { useTheme } from "../../theme/ThemeProvider.jsx";

export default function ForgotPassword() {
    const { theme, setTheme } = useTheme();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            toastInfo("If an account exists for this email, a reset link has been sent.");
            setEmail("");
        } catch (ex) {
            toastInfo("If an account exists for this email, a reset link has been sent.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#0f172a] flex flex-col transition-colors duration-300 relative">
            <header className="flex items-center justify-between z-10 sticky top-0 md:bg-transparent w-full md:px-8 md:py-6 px-4 py-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <LogoIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </Link>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                    <button className="flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-[#1e293b] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">language</span>
                    </button>
                    <button
                        className="flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-[#1e293b] transition-colors"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-12 h-12 bg-primary/10 dark:bg-[#7c3aed]/10 text-primary dark:text-[#7c3aed] rounded-full flex items-center justify-center mb-5 transition-colors">
                                <span className="material-symbols-outlined text-[24px]">lock_reset</span>
                            </div>
                            <h2 className="text-2xl font-bold text-dark-charcoal dark:text-white mb-3">Forgot Password</h2>
                            <p className="text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Enter the email address associated with your account and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[12px] md:text-[13px] font-bold text-dark-charcoal dark:text-slate-200 block text-left">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="w-full h-11 md:h-12 px-4 rounded-xl md:rounded-lg bg-white dark:bg-[#0f172a] border border-light-gray-stroke dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#7c3aed]/30 focus:border-primary dark:focus:border-[#7c3aed] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="e.g. name@company.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 md:h-12 rounded-xl md:rounded-lg bg-primary hover:bg-primary-hover dark:bg-[#7c3aed] dark:hover:bg-[#6d28d9] text-white font-bold text-[14px] transition-all flex items-center justify-center disabled:opacity-70"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>

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
