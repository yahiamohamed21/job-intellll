import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { useTranslation } from "react-i18next";

export default function Privacy() {
    const { theme, setTheme } = useTheme();
    const { t, i18n } = useTranslation();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased transition-colors duration-300 min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-[100] w-full bg-white/90 dark:bg-[#111623]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1e293b] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-24">
                        {/* Logo Section */}
                        <Link to="/" className="flex items-center">
                            <img src="/logo/logo_light.png" alt="Job Intel Logo" className="h-13 dark:hidden" />
                            <img src="/logo/logo_dark.png" alt="Job Intel Logo" className="h-13 hidden dark:block" />
                        </Link>

                        {/* Navigation and Actions */}
                        <div className="flex items-center gap-8">
                            {/* Center Links */}
                            <nav className="hidden md:flex items-center space-x-6">
                                <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium text-[15px] transition-colors px-4 py-2" to="/about">
                                    {t("home.navAbout")}
                                </Link>
                                <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium text-[15px] transition-colors px-4 py-2" to="/contact">
                                    {t("home.navContact")}
                                </Link>
                            </nav>

                            {/* Right Side Actions */}
                            <div className="flex items-center gap-6">
                                {/* Language Icon */}
                                <button
                                    onClick={() => i18n.changeLanguage((i18n.language || "en").toLowerCase().startsWith("ar") ? "en" : "ar")}
                                    className="text-slate-500 hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b]"
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-[22px]">translate</span>
                                </button>

                                {/* Dark Mode Toggle */}
                                <button
                                    className="text-slate-500 hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#1e293b]"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                                        {theme === "dark" ? "light_mode" : "dark_mode"}
                                    </span>
                                </button>

                                {/* Divider */}
                                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

                                {/* Login & CTA */}
                                <div className="flex items-center gap-5">
                                    <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary font-medium text-[15px] hidden sm:block transition-colors">
                                        {t("home.navLogin")}
                                    </Link>
                                    <Link to="/signup" className="flex items-center justify-center bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg text-[15px] font-medium transition-colors shadow-sm">
                                        {t("home.navGetStarted")}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 py-16 px-4 max-w-4xl mx-auto w-full">
                {/* Intro */}
                <section className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-bold">
                        <span className="material-symbols-outlined text-sm">security</span>
                        <span>{t("privacy.title")}</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        {t("privacy.title")}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-light leading-relaxed">
                        {t("privacy.subtitle")}
                    </p>
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {t("privacy.lastUpdated")}
                    </div>
                </section>

                {/* Security Shield Card */}
                <section className="mb-12 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 text-start">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-3xl">verified_user</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 dark:text-emerald-400">
                            {t("privacy.encryptionTitle")}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                            {t("privacy.encryptionDesc")}
                        </p>
                    </div>
                </section>

                {/* Structured Policy Card */}
                <section className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-3xl p-8 md:p-10 shadow-sm space-y-10 text-start">

                    {/* Section 1 */}
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                            {t("privacy.sec1Title")}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                            {t("privacy.sec1Desc")}
                        </p>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* Section 2 */}
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                            {t("privacy.sec2Title")}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                            {t("privacy.sec2Desc")}
                        </p>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* Section 3 */}
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                            {t("privacy.sec3Title")}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                            {t("privacy.sec3Desc")}
                        </p>
                    </div>

                </section>

                {/* Back to Home Link */}
                <div className="mt-12 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        {t("about.backToHome")}
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Job Intel Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
