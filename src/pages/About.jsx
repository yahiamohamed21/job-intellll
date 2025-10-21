import React from "react";
import { Link } from "react-router-dom";

export default function About(){
  return (
    <section className="card" style={{ maxWidth: 860, margin: "40px auto" }}>
      <h2 style={{ marginTop: 0 }}>من نحن — Jobintel</h2>
      <p className="sub">
        Jobintel منصة بتساعد الباحثين عن عمل والـHR من خلال تحليل السيرة الذاتية،
        اختبارات تقنية وسلوكية، ومطابقة ذكية مع الـJob Description.
      </p>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <div className="row" style={{ padding: "10px 0", borderBottom: "1px dashed rgba(148,163,184,.15)" }}>
          <strong>تحليل CV بالذكاء الاصطناعي</strong>
          <div className="sub">استخراج المهارات التقنية والمهارات الشخصية تلقائيًا</div>
        </div>
        <div className="row" style={{ padding: "10px 0", borderBottom: "1px dashed rgba(148,163,184,.15)" }}>
          <strong>اختبارات وتقييم شامل</strong>
          <div className="sub">نتائج تقنية + سوفت سكيلز + مقابلة فيديو مُحللة</div>
        </div>
        <div className="row" style={{ padding: "10px 0" }}>
          <strong>مطابقة مع الـJD</strong>
          <div className="sub">ترشيح أفضل المرشحين للـHR بناءً على 3 تقييمات</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Link className="btn" to="/login">ابدأ الآن</Link>
        <Link className="btn ghost" to="/">العودة للرئيسية</Link>
      </div>

      <p className="sub" style={{ textAlign: "center", marginTop: 16 }}>
        © {new Date().getFullYear()} Jobintel — صفحة تعريفية بسيطة (About)
      </p>
    </section>
  );
}
