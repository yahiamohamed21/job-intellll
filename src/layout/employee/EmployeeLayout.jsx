import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

export default function EmployeeLayout() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
