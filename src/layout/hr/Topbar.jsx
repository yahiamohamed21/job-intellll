// src/layout/hr/Topbar.jsx
import React from "react";
import useConfirmLogout from "../../hooks/useConfirmLogout.js"; // لو الملف مش عندك هتلاقيه تحت

export default function Topbar(){
  const confirmLogout = useConfirmLogout();

  return (
    <section
      className="topbar"
      style={{
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        marginBottom:22
      }}
    >
      <div>
        <div style={{ fontWeight:700, fontSize:18 }}>مرحبًا بفريق التوظيف 👋</div>
        <small className="sub">أدر الوظائف وطابِق المرشحين بناءً على التقييمات</small>
      </div>

      <button type="button" className="btn ghost" onClick={confirmLogout}>
        تسجيل الخروج
      </button>
    </section>
  );
}
