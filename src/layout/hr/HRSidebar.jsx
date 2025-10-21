// src/layout/hr/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
// (اختياري) أيقونات
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGaugeHigh, faBriefcase, faUsers, faBell, faGear } from "@fortawesome/free-solid-svg-icons";

export default function Sidebar(){
  const linkClass = ({ isActive }) => (isActive ? "is-active" : undefined);
  const linkStyle = ({ isActive }) => ({
    display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
    padding:"12px 14px", borderRadius:12, textDecoration:"none", color:"var(--text)",
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
        <div className="logo" aria-hidden="true" />
        <h1>Job <span style={{color:"var(--accent)"}}>Intel</span> <span style={{opacity:.8}}>HR</span></h1>
      </div>

      <nav className="nav" style={{display:"flex", flexDirection:"column", gap:8}}>
        <NavLink to="/hr" end className={linkClass} style={linkStyle}>
          <span>لوحة التحكم</span>
          <FontAwesomeIcon icon={faGaugeHigh} />
        </NavLink>

        <NavLink to="/hr/jobs" className={linkClass} style={linkStyle}>
          <span>الوظائف</span>
          <FontAwesomeIcon icon={faBriefcase} />
        </NavLink>

        <NavLink to="/hr/candidates" className={linkClass} style={linkStyle}>
          <span>المتقدمون</span>
          <FontAwesomeIcon icon={faUsers} />
        </NavLink>

        <NavLink to="/hr/notifications" className={linkClass} style={linkStyle}>
          <span>الإشعارات</span>
          <FontAwesomeIcon icon={faBell} />
        </NavLink>

        <NavLink to="/hr/settings" className={linkClass} style={linkStyle}>
          <span>الإعدادات</span>
          <FontAwesomeIcon icon={faGear} />
        </NavLink>
      </nav>
    </aside>
  );
}
