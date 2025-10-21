// src/components/Navbar.jsx (أو حسب مسارك)
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import ThemeToggleDropdown from "./ThemeToggleDropdown.jsx";

export default function Navbar(){
  const [open, setOpen] = useState(false);
  const navClass = ({ isActive }) => "nav-link" + (isActive ? " is-active" : "");

  return (
    <header className="navbar">
      <nav className="inner">
        {/* اليمين (RTL): اللوجو + اسم البراند */}
        <Link to="/" className="brand" aria-label="Jobintel Home">
          <span aria-hidden="true" className="logo" />
          <strong>Jobintel</strong>
        </Link>

        {/* زر موبايل */}
        <button
          className="menu-btn"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          ☰
        </button>

        {/* روابط ديسكتوب */}
        <div className="nav-links" aria-label="التنقل الرئيسي">
          <NavLink to="/" end className={navClass}>الرئيسية</NavLink>
          <NavLink to="/about" className={navClass}>من نحن</NavLink>

          {/* ✅ Dropdown للمظهر بدل الأزرار الثلاثة */}
          <div style={{ marginInline: 8 }}>
            <ThemeToggleDropdown />
          </div>

          <Link className="btn ghost" to="/login">Login</Link>
          <Link className="btn" to="/signup">Sign up</Link>
        </div>
      </nav>

      {/* قائمة الموبايل */}
      {open && (
        <div className="mobile-menu" role="dialog" aria-label="قائمة الموبايل">
          <div className="panel">
            <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}>الرئيسية</NavLink>
            <NavLink to="/about" className={navClass} onClick={() => setOpen(false)}>من نحن</NavLink>

            <div className="card" style={{ padding: 10, marginTop: 8 }}>
              <div className="sub" style={{ marginBottom: 6 }}>المظهر</div>
              {/* ✅ نفس الدروبداون في الموبايل */}
              <ThemeToggleDropdown />
            </div>

            <div className="mobile-row">
              <Link className="btn ghost" to="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link className="btn" to="/signup" onClick={() => setOpen(false)}>Sign up</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
