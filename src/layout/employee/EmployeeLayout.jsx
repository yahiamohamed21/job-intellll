import React from "react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import ThemeToggleDropdown from "../../Components/ThemeToggleDropdown.jsx"; // انتبه للمسار
import useConfirmLogout from "../../hooks/useConfirmLogout.js";

export default function EmployeeLayout(){
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ minWidth: 0, padding: 22 }}>
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}
