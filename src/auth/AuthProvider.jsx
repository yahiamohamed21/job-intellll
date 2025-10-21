// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, email, name? }
  const [role, setRole] = useState(null);   // "hr" | "job-seeker" | "employee" ...

  // استرجاع من التخزين
  useEffect(() => {
    try {
      const u = localStorage.getItem("auth_user");
      const r = localStorage.getItem("auth_role");
      if (u) setUser(JSON.parse(u));
      if (r) setRole(r);
    } catch {}
  }, []);

  // حفظ تلقائي
  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  useEffect(() => {
    if (role) localStorage.setItem("auth_role", role);
    else localStorage.removeItem("auth_role");
  }, [role]);

  // login (Mock)
  const login = async ({ email, password, role: incomingRole }) => {
    // هنا تقدر تعمل تحقق حقيقي من API
    if (!email || !password) throw new Error("Email/Password مطلوبان");

    // نطبّع الدور
    const normalizedRole = incomingRole === "hr" ? "hr"
                        : (incomingRole === "employee" ? "employee" : "job-seeker");

    // سجّل اليوزر والدور
    setUser({ id: 1, email });
    setRole(normalizedRole);
    // يتحفظوا تلقائي في useEffect
    return { ok: true };
  };

  const logout = async () => {
    try {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_role");
      localStorage.removeItem("auth_token");
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  const value = useMemo(() => ({ user, role, login, logout }), [user, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
