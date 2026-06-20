import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { useTranslation } from "react-i18next";
import LogoIcon from "../Components/LogoIcon.jsx";

export default function About() {
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
      <main className="flex-1 py-16 px-4 max-w-5xl mx-auto w-full">
        {/* Intro Section */}
        <section className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-bold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>{t("home.navAbout")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("about.title")}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            {t("about.subtitle")}
          </p>
        </section>

        {/* Features/Services Grid */}
        <section className="grid md:grid-cols-3 gap-8 mb-20 text-start">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t("about.feature1Title")}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t("about.feature1Desc")}</p>
          </div>

          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">quiz</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t("about.feature2Title")}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t("about.feature2Desc")}</p>
          </div>

          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">handshake</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t("about.feature3Title")}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t("about.feature3Desc")}</p>
          </div>
        </section>

        {/* Story & Values */}
        <section className="grid md:grid-cols-2 gap-16 items-start mb-16 text-start">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t("about.ourStory")}</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">
              {t("about.ourStoryDesc")}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-800 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t("about.valuesTitle")}</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 font-bold">check_circle</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{t("about.value1")}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 font-bold">check_circle</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{t("about.value2")}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 font-bold">check_circle</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{t("about.value3")}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500 font-bold">check_circle</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{t("about.value4")}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Action buttons */}
        <section className="flex justify-center gap-4 py-8">
          <Link className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/20 transition active:scale-95" to="/signup">
            {t("about.getStarted")}
          </Link>
          <Link className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-8 py-3.5 rounded-xl transition active:scale-95" to="/">
            {t("about.backToHome")}
          </Link>
        </section>
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
