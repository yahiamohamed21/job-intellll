// src/layout/employee/Topbar.jsx
import React from "react";
import useConfirmLogout from "../../hooks/useConfirmLogout.js";

export default function Topbar(){
  const confirmLogout = useConfirmLogout();

  return (
    <section
      className="topbar"
      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}
    >
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <div>
          <div style={{fontWeight:700}}>مرحبًا يحيى 👋</div>
          <small className="sub">هذا ملخص تقدّمك</small>
        </div>
        <div
          aria-hidden
          style={{
            width:36, height:36, borderRadius:12,
            background:"linear-gradient(135deg,#22c55e,#38bdf8)",
            boxShadow:"var(--shadow)"
          }}
        />
      </div>

      {/* زر خروج يفتح Alert أولاً */}
      <button type="button" className="btn ghost" onClick={confirmLogout}>
        تسجيل الخروج
      </button>
    </section>
  );
}
