// src/layout/hr/HRLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import HRSidebar from "./HRSidebar.jsx";

export default function HRLayout() {
  return (
    <div className="app">
      <HRSidebar />
      <main className="main" style={{ minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
