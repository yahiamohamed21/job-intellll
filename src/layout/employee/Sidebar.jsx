import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../theme/ThemeProvider.jsx";
import useConfirmLogout from "../../hooks/useConfirmLogout.js";
import LogoIcon from "../../Components/LogoIcon.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

const NAV_ITEMS = [
  { to: "/employee", key: "dashboard", icon: "dashboard" },
  { to: "/employee/tests", key: "tests", icon: "science" },
  { to: "/employee/notifications", key: "notifications", icon: "notifications" },
  { to: "/employee/settings", key: "settings", icon: "settings" },
];

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 focus-visible:rounded-[inherit]";

const SIDEBAR_SHELL =
  "bg-white dark:bg-[#0a1020] bg-gradient-to-b from-white/[.02] to-transparent border-slate-200 dark:border-slate-400/[.14]";

const ICON_BTN =
  "size-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0c1424] hover:text-slate-800 dark:hover:text-white transition-colors";

const STORAGE_KEY = "jobintel.sidebar.collapsed";

const readStoredCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export default function Sidebar() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const confirmLogout = useConfirmLogout();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [collapsed, setCollapsed] = useState(readStoredCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const isRtl = (i18n.language || "en").toLowerCase().startsWith("ar");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [collapsed]);

  // Open / close the drawer with focus management + scroll lock.
  useEffect(() => {
    if (drawerOpen) {
      lastFocusedRef.current = document.activeElement;
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // Move focus into the drawer so Tab cycles inside it.
      const id = window.setTimeout(() => {
        const first = drawerRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        first?.focus();
      }, 50);
      return () => {
        document.body.style.overflow = original;
        window.clearTimeout(id);
        // Restore focus to whichever element opened the drawer.
        const target = lastFocusedRef.current;
        if (target && typeof target.focus === "function") {
          target.focus();
        }
      };
    }
  }, [drawerOpen]);

  // Focus trap + ESC handler (only while drawer is open).
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const root = drawerRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    const close = () => setDrawerOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  // Auto-close the mobile drawer when the viewport grows past the lg
  // breakpoint (1024px) so it doesn't stay "stuck open" if the user
  // resizes the window or rotates a tablet.
  useEffect(() => {
    if (!drawerOpen) return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => {
      if (e.matches) setDrawerOpen(false);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [drawerOpen]);

  const toggleLanguage = () => {
    const next = isRtl ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  const closeDrawer = () => setDrawerOpen(false);
  const toggleCollapsed = () => setCollapsed((c) => !c);

  const navClass = (isCollapsed) => ({ isActive }) =>
    [
      "group flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200",
      isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3",
      isActive
        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/30 shadow-sm"
        : "text-slate-600 dark:text-slate-300 border border-transparent hover:bg-slate-50 dark:hover:bg-[#0c1424] hover:border-slate-200 dark:hover:border-slate-400/[.14]",
      FOCUS_RING,
    ].join(" ");

  const themeStackedClass = (active) =>
    [
      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 min-w-0",
      active
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#0c1424]/60",
      FOCUS_RING,
    ].join(" ");

  const themeCollapsedClass = (active) =>
    [
      "w-full flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all duration-200 min-w-0",
      active
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#0c1424]/60",
      FOCUS_RING,
    ].join(" ");

  const SidebarBody = ({ inDrawer = false }) => {
    const itemStyle = (delayMs) =>
      inDrawer
        ? {
            animation: `dbItemFadeIn 0.28s cubic-bezier(.22,.68,0,1.2) ${delayMs}ms both`,
          }
        : undefined;

    const toggleIcon = isRtl ? "chevron_right" : "chevron_left";
    const collapseLabel = collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar");

    return (
      <>
        {/* Brand + Toggle row */}
        <div
          className="flex items-center justify-between gap-2 mb-7"
          style={itemStyle(0)}
        >
          <button
            type="button"
            onClick={() => {
              navigate("/employee");
              if (inDrawer) closeDrawer();
            }}
            className={`flex items-center ${
              collapsed ? "justify-center size-9 -ms-1" : "gap-2.5 min-w-0 p-1 -m-1"
            } group rounded-lg ${FOCUS_RING}`}
            aria-label={t("nav.brand")}
          >
            <LogoIcon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 transition-transform duration-200 group-hover:scale-105" />
            {!collapsed && (
              <div className="flex flex-col items-start min-w-0 overflow-hidden">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-800 dark:text-white truncate">
                  {t("nav.brand")}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  JobIntel
                </span>
              </div>
            )}
          </button>
          {inDrawer ? (
            <button
              type="button"
              onClick={closeDrawer}
              aria-label={t("nav.closeMenu")}
              className={`${ICON_BTN} ${FOCUS_RING}`}
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapseLabel}
              aria-expanded={!collapsed}
              title={collapseLabel}
              className={`${ICON_BTN} ${FOCUS_RING}`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform duration-300 ease-out ${
                  collapsed ? "rotate-180" : "rotate-0"
                }`}
                aria-hidden="true"
              >
                {toggleIcon}
              </span>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-2 flex-1" aria-label="Primary">
          {NAV_ITEMS.map(({ to, key, icon }, idx) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/employee"}
              className={navClass(collapsed)}
              onClick={inDrawer ? closeDrawer : undefined}
              title={collapsed ? t(`nav.${key}`) : undefined}
              style={itemStyle(inDrawer ? 80 + idx * 50 : undefined)}
            >
              {!collapsed && <span className="truncate">{t(`nav.${key}`)}</span>}
              <span className={`relative ${collapsed ? "" : "ltr:ml-auto rtl:mr-auto"}`}>
                <span
                  className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {icon}
                </span>
                {key === "notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-400/[.14] space-y-3">
          {/* Theme toggle — vertical stack in both collapsed and expanded states.
              Labels are hidden when collapsed so each button shows only its centered icon. */}
          {collapsed ? (
            <div
              className="flex flex-col gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0c1424]/70 border border-slate-200 dark:border-slate-400/[.14]"
              style={itemStyle(inDrawer ? 320 : undefined)}
            >
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={themeCollapsedClass(theme === "light")}
                aria-label={t("nav.switchLight")}
                aria-pressed={theme === "light"}
                title={t("nav.switchLight")}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">light_mode</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={themeCollapsedClass(theme === "dark")}
                aria-label={t("nav.switchDark")}
                aria-pressed={theme === "dark"}
                title={t("nav.switchDark")}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">dark_mode</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={themeCollapsedClass(theme === "system")}
                aria-label={t("nav.switchSystem")}
                aria-pressed={theme === "system"}
                title={t("nav.switchSystem")}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">desktop_windows</span>
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0c1424]/70 border border-slate-200 dark:border-slate-400/[.14]"
              style={itemStyle(inDrawer ? 320 : undefined)}
            >
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={themeStackedClass(theme === "light")}
                aria-label={t("nav.switchLight")}
                aria-pressed={theme === "light"}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">light_mode</span>
                <span className="truncate">{t("nav.switchLight")}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={themeStackedClass(theme === "dark")}
                aria-label={t("nav.switchDark")}
                aria-pressed={theme === "dark"}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">dark_mode</span>
                <span className="truncate">{t("nav.switchDark")}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={themeStackedClass(theme === "system")}
                aria-label={t("nav.switchSystem")}
                aria-pressed={theme === "system"}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0">desktop_windows</span>
                <span className="truncate">{t("nav.switchSystem")}</span>
              </button>
            </div>
          )}

          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className={`w-full flex items-center gap-2 ${
              collapsed ? "justify-center px-2" : "justify-between px-4"
            } py-2.5 rounded-xl border border-slate-200 dark:border-slate-400/[.14] bg-white dark:bg-[#0c1424]/60 text-slate-700 dark:text-slate-200 text-sm font-bold hover:border-blue-500/60 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-sm ${FOCUS_RING}`}
            style={itemStyle(inDrawer ? 360 : undefined)}
            title={collapsed ? t("layout.language") : undefined}
            aria-label={t("layout.language")}
          >
            {!collapsed && (
              <>
                <span className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] shrink-0">translate</span>
                  <span className="truncate">{isRtl ? "العربية" : "English"}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0">
                  {isRtl ? "AR" : "EN"}
                </span>
              </>
            )}
            {collapsed && (
              <span className="material-symbols-outlined text-[20px] shrink-0">translate</span>
            )}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={(e) => {
              if (inDrawer) closeDrawer();
              confirmLogout(e);
            }}
            className={`w-full flex items-center gap-3 ${
              collapsed ? "justify-center px-2" : "px-4"
            } py-2.5 rounded-xl border border-red-200/80 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/[.08] text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/15 hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 ${FOCUS_RING}`}
            style={itemStyle(inDrawer ? 400 : undefined)}
            title={collapsed ? t("layout.logout") : undefined}
            aria-label={t("layout.logout")}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">logout</span>
            {!collapsed && <span className="truncate">{t("layout.logout")}</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* ── Mobile top bar (visible < lg) ── */}
      <header
        className={`lg:hidden sticky top-0 z-40 w-full shrink-0 ${SIDEBAR_SHELL} border-b shadow-sm`}
      >
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/employee")}
            className={`flex items-center gap-2 min-w-0 rounded-lg p-1 -m-1 ${FOCUS_RING}`}
          >
            <LogoIcon className="w-8 h-8 shrink-0" />
            <span className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white truncate">
              {t("nav.brand")}
            </span>
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t("nav.openMenu")}
            aria-expanded={drawerOpen}
            aria-controls="employee-mobile-drawer"
            className={`size-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0c1424] hover:text-slate-800 dark:hover:text-white transition-colors ${FOCUS_RING}`}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        </div>
      </header>

      {/* ── Mobile drawer + overlay (visible < lg) ── */}
      {drawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-50 bg-slate-900/60"
            onClick={closeDrawer}
            aria-hidden="true"
            style={{ animation: "dbOverlayFade 0.22s ease-out both" }}
          />
          <aside
            id="employee-mobile-drawer"
            ref={drawerRef}
            className={`lg:hidden fixed inset-y-0 z-50 w-[290px] max-w-[86vw] ${SIDEBAR_SHELL} border-e p-5 overflow-y-auto custom-scrollbar flex flex-col`}
            style={{
              insetInlineEnd: 0,
              animation: "dbDrawerIn 0.28s cubic-bezier(.22,.68,0,1.2) both",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.mobileMenuTitle")}
          >
            <SidebarBody inDrawer />
          </aside>
        </>
      )}

      {/* ── Desktop sidebar (visible ≥ lg) ── */}
      <aside
        className={`hidden lg:flex sticky top-0 h-[100dvh] ${
          collapsed ? "w-[76px] px-2 py-4" : "w-[270px] p-5"
        } shrink-0 ${SIDEBAR_SHELL} border-e flex-col sidebar-collapse-transition overflow-hidden`}
        style={{ animation: "dbSidebarIn 0.32s cubic-bezier(.22,.68,0,1.2) both" }}
        data-collapsed={collapsed ? "true" : "false"}
      >
        <SidebarBody />
      </aside>
    </>
  );
}
