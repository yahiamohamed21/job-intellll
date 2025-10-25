// src/routes/RoleRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function RoleRoute({ allow }) {
  const { role, loading } = useAuth();

  // allow ممكن تكون string وحدة أو array
  const allowedRoles = Array.isArray(allow) ? allow : [allow];

  if (loading) {
    return (
      <div style={{
        minHeight:"100dvh",
        display:"grid",
        placeItems:"center",
        background:"var(--bg)",
        color:"var(--text)"
      }}>
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    // مش مسموح له يشوف الصفحة دي
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
