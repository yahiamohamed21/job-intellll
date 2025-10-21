// src/layout/Sidebar.jsx  (Sidebar الموظّف)
import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn, faIdBadge, faVial, faVideo,
  faBriefcase, faBell, faGear
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar(){
  // يرجّع class للنشط فقط
  const navClass = ({ isActive }) => (isActive ? "is-active" : undefined);

  // ستايل ديناميكي: إطار وshadow للنشط فقط
  const navStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 12,
    textDecoration: "none",
    color: "var(--text)",
    background: isActive
      ? "linear-gradient(180deg,rgba(56,189,248,.10),rgba(56,189,248,.03))"
      : "linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,0))",
    border: isActive ? "1px solid rgba(56,189,248,.35)" : "1px solid transparent",
    boxShadow: isActive ? "0 0 0 2px rgba(56,189,248,.30) inset" : "none",
    transition: "border-color .15s, box-shadow .15s, background .15s",
  });

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo" aria-hidden="true"></div>
        <h1>Job <span style={{color:"var(--accent)"}}>Intel</span></h1>
      </div>

      <nav className="nav" style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <NavLink to="/employee" end className={navClass} style={navStyle}>
          <span>الداشبورد</span>
          <FontAwesomeIcon icon={faChartColumn} />
        </NavLink>

        <NavLink to="/employee/profile" className={navClass} style={navStyle}>
          <span>ملفي</span>
          <FontAwesomeIcon icon={faIdBadge} />
        </NavLink>

        <NavLink to="/employee/tests" className={navClass} style={navStyle}>
          <span>اختباراتي</span>
          <FontAwesomeIcon icon={faVial} />
        </NavLink>

        <NavLink to="/employee/interview" className={navClass} style={navStyle}>
          <span>مقابلة الفيديو</span>
          <FontAwesomeIcon icon={faVideo} />
        </NavLink>

        <NavLink to="/employee/jobs" className={navClass} style={navStyle}>
          <span>وظائف مقترحة</span>
          <FontAwesomeIcon icon={faBriefcase} />
        </NavLink>

        <NavLink to="/employee/notifications" className={navClass} style={navStyle}>
          <span>الإشعارات</span>
          <FontAwesomeIcon icon={faBell} />
        </NavLink>

        <NavLink to="/employee/settings" className={navClass} style={navStyle}>
          <span>الإعدادات</span>
          <FontAwesomeIcon icon={faGear} />
        </NavLink>
      </nav>
    </aside>
  );
}
