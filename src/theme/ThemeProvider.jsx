import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const THEME_KEY = "theme"; // 'light' | 'dark' | 'system'

function getStoredTheme(){
  try{
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" || t === "system" ? t : "system";
  }catch{ return "system"; }
}

function applyTheme(theme){
  const html = document.documentElement;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);

  // Tailwind
  html.classList.toggle("dark", isDark);
  // CSS variables
  html.classList.toggle("theme-dark", isDark);
  html.classList.toggle("theme-light", !isDark);

  html.setAttribute("data-theme", theme);
  html.setAttribute("dir", "rtl");
  html.setAttribute("lang", "ar");
}

export function ThemeProvider({ children }){
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(()=>{
    applyTheme(theme);
    try{ localStorage.setItem(THEME_KEY, theme); }catch{}

    let mql;
    if(theme === "system" && window.matchMedia){
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mql.addEventListener?.("change", handler);
      return () => mql.removeEventListener?.("change", handler);
    }
  }, [theme]);

  const value = useMemo(()=>({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(){
  const ctx = useContext(ThemeContext);
  if(!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
