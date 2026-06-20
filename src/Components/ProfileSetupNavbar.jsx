import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import { confirmAction } from "../lib/alerts.js";

export default function ProfileSetupNavbar() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const initials = user ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() : '?';
    const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User';

    const cycleTheme = () => {
        const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
        setTheme(next);
    };

    const themeIcon = theme === "dark" ? "dark_mode" : theme === "system" ? "desktop_windows" : "light_mode";

    const handleLogout = async () => {
        const ok = await confirmAction(
            t("alerts.confirmTitle"),
            t("layout.logoutConfirmText"),
            t("alerts.confirm"),
            t("alerts.cancel")
        );
        if (!ok) return;
        logout();
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-surface-dark border-b border-slate-200/80 dark:border-border-dark shadow-sm dark:shadow-none transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">

                {/* Left Side: Logo (first child = start in both LTR/RTL) */}
                <Link to="/employee" className="flex items-center gap-2 group">
                    <img src="/logo/logo_light.png" alt="Job Intel Logo" className="h-8 sm:h-10 dark:hidden group-hover:scale-105 transition-transform" />
                    <img src="/logo/logo_dark.png" alt="Job Intel Logo" className="h-8 sm:h-10 hidden dark:block group-hover:scale-105 transition-transform" />
                </Link>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-4 sm:gap-6">

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2.5 sm:gap-3 group hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 pe-2 rounded-lg transition-colors"
                        >
                            <div className="size-8 sm:size-9 rounded-full bg-[#E2E8F0] dark:bg-slate-700 flex items-center justify-center text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                                {initials}
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {displayName}
                            </span>
                            <span className={`material-symbols-outlined text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 text-xl hidden sm:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                keyboard_arrow_down
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute ltr:right-0 rtl:left-0 top-full mt-2 w-48 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-lg dark:shadow-none overflow-hidden z-[60] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Link
                                    to="/employee"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                    {t("nav.dashboard")}
                                </Link>
                                <div className="h-px bg-slate-200 dark:bg-border-dark mx-3 my-1" />
                                <button
                                    onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                    {t('layout.logout')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Translate Icon */}
                    <button
                        className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center rounded-full size-10 hover:bg-slate-50 dark:hover:bg-slate-800"
                        title={t('layout.language')}
                        onClick={() => i18n.changeLanguage((i18n.language || "en").toLowerCase().startsWith("ar") ? "en" : "ar")}
                        type="button"
                    >
                        <span className="material-symbols-outlined text-[22px]">translate</span>
                    </button>

                    {/* Dark Mode Toggle — cycles light → dark → system → light */}
                    <button
                        className="text-slate-500 hover:text-primary transition-colors flex items-center justify-center rounded-full size-10 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={cycleTheme}
                        type="button"
                        title={theme === "light" ? t("nav.switchLight") : theme === "dark" ? t("nav.switchDark") : t("nav.switchSystem")}
                    >
                        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                            {themeIcon}
                        </span>
                    </button>

                    {/* Dashboard link (replaces misleading "Save as Draft") */}
                    <Link
                        to="/employee"
                        className="hidden sm:block text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
                    >
                        {t('nav.dashboard')}
                    </Link>

                    {/* Vertical Divider */}
                    <div className="h-6 w-px bg-slate-200 dark:bg-border-dark hidden sm:block"></div>

                </div>

            </div>
        </header>
    );
}
