import React from "react";
import { Link } from "react-router-dom";
import LogoIcon from "../Components/LogoIcon.jsx";
import Robot404Icon from "../Components/Robot404Icon.jsx";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b101e] flex flex-col font-display text-dark-charcoal dark:text-white transition-colors duration-300 overflow-hidden relative">

      {/* Background 404 Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <span className="text-[30vw] font-black text-slate-100 dark:text-white/[0.02] select-none leading-none tracking-tighter">
          404
        </span>
      </div>

      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between z-10 relative">
        <Link to="/" className="flex items-center gap-2">
          <LogoIcon className="w-28 md:w-32 h-auto text-primary dark:text-[#3b82f6]" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative mt-[-5vh]">

        {/* Robot Illustration Area */}
        <div className="relative mb-6 w-80 h-80 flex items-center justify-center">
          {/* Glowing Aura - Orange in light, Blue in dark */}
          <div className="absolute inset-0 bg-primary/40 dark:bg-[#3b82f6]/40 blur-[75px] rounded-full z-0"></div>

          <div className="relative z-10 w-72 h-72 flex items-center justify-center transition-transform hover:-translate-y-2 duration-500">
            <Robot404Icon className="w-full h-full" />
          </div>
        </div>

        <h1 className="text-3xl md:text-[40px] font-black leading-tight tracking-tight mb-4 max-w-lg">
          Sorry, this page is <br className="hidden md:block" /> currently unavailable
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-10 max-w-[420px] leading-relaxed">
          The link you're looking for might be broken, or the page has been moved to a new intelligence hub.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-primary dark:bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-[#eb7104] dark:hover:bg-blue-600 transition-colors shadow-lg shadow-primary/30 dark:shadow-[#3b82f6]/20 active:scale-[0.98]"
          >
            Return to Home
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-light-gray-stroke dark:border-slate-700 text-dark-charcoal dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-[0.98]"
          >
            Contact Support
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500 z-10 relative mt-auto">
        <div>
          © 2026 Job Intel
        </div>
        <div className="flex items-center gap-6">
          <Link to="#" className="hover:text-dark-charcoal dark:hover:text-slate-300 transition-colors">Help Center</Link>
          <Link to="#" className="hover:text-dark-charcoal dark:hover:text-slate-300 transition-colors">About Us</Link>
        </div>
      </footer>
    </div>
  );
}
