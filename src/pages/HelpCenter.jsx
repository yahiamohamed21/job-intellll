import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { useTranslation } from "react-i18next";

export default function HelpCenter() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: "account_circle",
      title: t("helpCenter.categories.accountTitle"),
      desc: t("helpCenter.categories.accountDesc"),
      color: "blue"
    },
    {
      icon: "description",
      title: t("helpCenter.categories.resumeTitle"),
      desc: t("helpCenter.categories.resumeDesc"),
      color: "emerald"
    },
    {
      icon: "assignment",
      title: t("helpCenter.categories.skillsTitle"),
      desc: t("helpCenter.categories.skillsDesc"),
      color: "purple"
    },
    {
      icon: "security",
      title: t("helpCenter.categories.securityTitle"),
      desc: t("helpCenter.categories.securityDesc"),
      color: "orange"
    }
  ];

  const guides = [
    { id: 1, text: t("helpCenter.guide1"), icon: "auto_stories" },
    { id: 2, text: t("helpCenter.guide2"), icon: "verified" },
    { id: 3, text: t("helpCenter.guide3"), icon: "insights" }
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
      <main className="flex-1 py-16 px-4 max-w-5xl mx-auto w-full">
        {/* Hero search block */}
        <section className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>{t("helpCenter.title")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("helpCenter.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-light leading-relaxed">
            {t("helpCenter.subtitle")}
          </p>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto relative mt-8">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[22px]">
              search
            </span>
            <input
              type="text"
              placeholder={t("helpCenter.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-start shadow-sm"
            />
          </div>
        </section>

        {/* Categories Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 text-start">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="p-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300
                ${cat.color === "blue" ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white" : ""}
                ${cat.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white" : ""}
                ${cat.color === "purple" ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white" : ""}
                ${cat.color === "orange" ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white" : ""}
              `}>
                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">{cat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">{cat.desc}</p>
            </div>
          ))}
        </section>

        {/* Popular guides list */}
        <section className="mb-16 max-w-3xl mx-auto text-start">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">menu_book</span>
            {t("helpCenter.guidesTitle")}
          </h2>

          <div className="space-y-3">
            {guides
              .filter((g) => g.text.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((guide) => (
                <div
                  key={guide.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl hover:border-primary/20 dark:hover:border-primary/20 hover:bg-slate-50/50 dark:hover:bg-[#253246]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px] group-hover:text-primary transition-colors">
                      {guide.icon}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                      {guide.text}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[20px] group-hover:text-primary group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all duration-300">
                    chevron_right
                  </span>
                </div>
              ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="text-center bg-slate-50 dark:bg-[#1e293b]/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
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
      <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Job Intel Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
