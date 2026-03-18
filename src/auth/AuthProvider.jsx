// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  // user = { email, role }
  const [user, setUser] = useState(null);

  // ده عشان ما نرندرش PrivateRoute قبل ما نعرف في حد لوجين ولا لأ
  const [loading, setLoading] = useState(true);

  // لما الابليكيشن يفتح أول مرة، نحاول نقرا اليوزر من localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }
    } catch (err) {
      console.warn("failed to parse auth_user", err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function login({ email, password, role }) {
    // مفيش backend لسة، فهنفترض أي بيانات تمشي
    // مفيش تحقق بجد، ده مجرد mock

    const fakeUser = {
      email,
      role: role === "hr" ? "hr" : "employee", // بنسمي job-seeker => employee
      name: "Demo User"
    };

    setUser(fakeUser);
    localStorage.setItem("auth_user", JSON.stringify(fakeUser));
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("auth_user");
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthed: !!user,
    role: user?.role || null,
  };

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
