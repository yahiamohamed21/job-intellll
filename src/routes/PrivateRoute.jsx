// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function PrivateRoute() {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  // لسه بحمّل اليوزر من localStorage؟ استنى لحظة
  if (loading) {
    return (
      <div style={{
        minHeight:"100dvh",
        display:"grid",
        placeItems:"center",
        background:"var(--bg)",
        color:"var(--text)"
      }}>
        جاري التحميل...
      </div>
    );
  }

  // خلاص عرفنا: مفيش يوزر
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // فيه يوزر؟ دخل جوه العناصر اللي جواه
  return <Outlet />;
}
