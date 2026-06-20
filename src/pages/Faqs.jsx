import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { useTranslation } from "react-i18next";
import LogoIcon from "../Components/LogoIcon.jsx";

export default function Faqs() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  // State to track which FAQ accordion is expanded
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const faqItems = [
    { q: t("faqs.q1"), a: t("faqs.a1") },
    { q: t("faqs.q2"), a: t("faqs.a2") },
    { q: t("faqs.q3"), a: t("faqs.a3") },
    { q: t("faqs.q4"), a: t("faqs.a4") },
  ];

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
        <section className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>{t("faqs.title")}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("faqs.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-light leading-relaxed">
            {t("faqs.subtitle")}
          </p>
        </section>

        {/* FAQs Accordion */}
        <section className="space-y-4 text-start">
          {faqItems.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full p-6 flex justify-between items-center text-start hover:bg-slate-50 dark:hover:bg-[#253246] transition-colors"
                  type="button"
                >
                  <span className="font-bold text-slate-800 dark:text-white pr-4">
                    {item.q}
                  </span>
                  <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 shrink-0 ${isExpanded ? "rotate-180 text-primary" : ""}`}>
                    expand_more
                  </span>
                </button>

                {/* Accordion Body */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-48 border-t border-slate-100 dark:border-[#334155]" : "max-h-0"}`}
                >
                  <div className="p-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-light">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Support Link CTA */}
        <section className="mt-16 text-center bg-slate-50 dark:bg-[#1e293b]/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {t("helpCenter.contactPrompt")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {t("helpCenter.contactDesc")}
          </p>
          <Link
            to="/contact"
            className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2.5 rounded-xl transition shadow active:scale-95 inline-block text-sm"
          >
            {t("helpCenter.contactBtn")}
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Job Intel Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
