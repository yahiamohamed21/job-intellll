import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export default function NotFound(){
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="card" style={{ width: "min(960px,96vw)", textAlign: "center", padding: "38px 28px", borderRadius: 20 }}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 14 }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 88, color: "#f59e0b" }} />
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: "clamp(32px,4.8vw,44px)", fontWeight: 900 }}>
          الصفحة غير موجودة (404)
        </h1>
        <p className="sub" style={{ fontSize: "clamp(16px,2.2vw,20px)", margin: "0 0 22px" }}>
          يبدو أنك اتبعت رابطًا غير صحيح أو الصفحة تم نقلها.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn" style={{ height: 48, padding: "0 18px", fontSize: 16 }} to="/">العودة للرئيسية</Link>
          <Link className="btn ghost" style={{ height: 48, padding: "0 18px", fontSize: 16 }} to="/login">تسجيل الدخول</Link>
        </div>
      </section>
    </div>
  );
}
