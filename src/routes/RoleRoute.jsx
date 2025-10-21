// src/routes/RoleRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function RoleRoute({ allowed }) {
  const { user, role } = useAuth();

  // لو مفيش يوزر، سيبه لPrivateRoute يتصرف (لازم تكون حاطط PrivateRoute فوقه)
  if (!user) return <Outlet />;

  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (!list.includes(role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
