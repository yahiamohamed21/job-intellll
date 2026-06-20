import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider.jsx";
import { useTranslation } from "react-i18next";
import ElectricBorder from "../Components/ElectricBorder.jsx";
import { toastSuccess } from "../lib/alerts";

export default function ContactUs() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message API
    setTimeout(() => {
      setLoading(false);
      toastSuccess(t("contact.successMsg"));
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1200);
  };

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
      <main className="flex-1 py-16 px-4 max-w-6xl mx-auto w-full flex flex-col justify-center">
        {/* Intro */}
        <section className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>{t("home.navContact")}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("contact.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-light leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </section>

        {/* Form & Info Section */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card (using ElectricBorder glow container) */}
          <div className="lg:col-span-5 w-full">
            <ElectricBorder
              color={theme === "dark" ? "#7c3aed" : "#fb923c"}
              speed={1}
              chaos={0.15}
              thickness={2}
              style={{ borderRadius: 20 }}
              className="w-full shadow-lg"
            >
              <div className="w-full p-8 md:p-10 relative z-10 flex flex-col bg-white dark:bg-[#1e293b] rounded-2xl md:rounded-[20px] dark:border dark:border-[#334155] transition-colors duration-300 text-start">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {t("contact.infoTitle")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                  {t("contact.infoDesc")}
                </p>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary dark:bg-[#7c3aed]/10 dark:text-[#7c3aed] rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">pin_drop</span>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500">{t("contact.addressHeading")}</h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium text-[14px]">{t("contact.address")}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary dark:bg-[#7c3aed]/10 dark:text-[#7c3aed] rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">call</span>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500">{t("contact.phoneHeading")}</h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium text-[14px]">{t("contact.phone")}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary dark:bg-[#7c3aed]/10 dark:text-[#7c3aed] rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500">{t("contact.emailHeading")}</h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium text-[14px]">{t("contact.email")}</p>
                    </div>
                  </div>
                </div>

                {/* Micro-map Visual Placeholder */}
                <div className="mt-8 h-32 rounded-xl bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] flex flex-col justify-center items-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-100 group-hover:scale-110 transition-transform duration-700"></div>
                  <span className="material-symbols-outlined text-primary/40 dark:text-[#7c3aed]/40 text-4xl mb-1 group-hover:scale-110 transition-transform duration-300">map</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Cairo Headquarters</span>
                </div>
              </div>
            </ElectricBorder>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1e293b] rounded-2xl md:rounded-[20px] dark:border dark:border-[#334155] p-8 md:p-10 shadow-lg border border-slate-200 text-start transition-colors duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[12px] md:text-[13px] font-bold text-slate-600 dark:text-slate-200 block">
                  {t("contact.nameLabel")}
                </label>
                <input
                  type="text"
                  className="w-full h-11 md:h-12 px-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#7c3aed]/30 focus:border-primary dark:focus:border-[#7c3aed] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t("contact.namePlaceholder")}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[12px] md:text-[13px] font-bold text-slate-600 dark:text-slate-200 block">
                  {t("contact.emailLabel")}
                </label>
                <input
                  type="email"
                  className="w-full h-11 md:h-12 px-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#7c3aed]/30 focus:border-primary dark:focus:border-[#7c3aed] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t("contact.emailPlaceholder")}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-[12px] md:text-[13px] font-bold text-slate-600 dark:text-slate-200 block">
                  {t("contact.subjectLabel")}
                </label>
                <input
                  type="text"
                  className="w-full h-11 md:h-12 px-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#7c3aed]/30 focus:border-primary dark:focus:border-[#7c3aed] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder={t("contact.subjectPlaceholder")}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-[12px] md:text-[13px] font-bold text-slate-600 dark:text-slate-200 block">
                  {t("contact.messageLabel")}
                </label>
                <textarea
                  className="w-full h-32 px-4 py-3 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#7c3aed]/30 focus:border-primary dark:focus:border-[#7c3aed] outline-none text-[14px] text-dark-charcoal dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder={t("contact.messagePlaceholder")}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 md:h-12 rounded-xl bg-primary hover:bg-primary-hover dark:bg-[#7c3aed] dark:hover:bg-[#6d28d9] text-white font-bold text-[14px] transition-all flex items-center justify-center disabled:opacity-70 cursor-pointer shadow-lg shadow-primary/10 dark:shadow-none"
              >
                {loading ? t("contact.sendingBtn") : t("contact.submitBtn")}
              </button>
            </form>
          </div>
        </div>
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
