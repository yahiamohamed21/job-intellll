import React from "react";

export default function Notifications(){
  const switchRow = (label, def=true) => (
    <label key={label} style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:12, border:"1px solid var(--border)", borderRadius:12}}>
      <span>{label}</span>
      <input type="checkbox" defaultChecked={def} />
    </label>
  );

  return (
    <>
      <section className="card" style={{ marginBottom:16 }}>
        <h2 style={{ margin:"0 0 6px" }}>الإشعارات</h2>
        <p className="sub">تابع نشاطك واحصل على تنبيهات مهمة</p>
      </section>

      <section className="card" style={{ marginBottom:16 }}>
        <h3>تفضيلات الإشعارات</h3>
        <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr 1fr", marginTop:10 }}>
          {[
            ["وظائف جديدة متطابقة", true],
            ["تذكير باختبارات قادمة", true],
            ["تحديثات حالة التقديم", true],
            ["ملخص أسبوعي عبر البريد", false],
          ].map(([l,d])=> switchRow(l,d))}
        </div>
      </section>

      <section className="card">
        <h3>الوارد</h3>
        <div style={{ display:"grid", gap:10, marginTop:10 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, padding:12, border:"1px solid var(--border)", borderRadius:14, background:"rgba(56,189,248,.06)" }}>
            <div>
              <strong>نتيجة مطابقة جديدة: Front-end Developer</strong>
              <div className="sub">نسبة التطابق وصلت إلى 82% بعد تحديث سيرتك</div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <a className="btn" href="#">فتح الوظيفة</a>
              <a className="btn ghost" href="#">تمييز كمقروء</a>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, padding:12, border:"1px solid var(--border)", borderRadius:14 }}>
            <div>
              <strong>تذكير: مقابلة الفيديو غير مكتملة</strong>
              <div className="sub">أكمل الأسئلة الأربعة لتحسين تقييمك</div>
            </div>
            <div><a className="btn" href="#">بدء الآن</a></div>
          </div>

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, padding:12, border:"1px solid var(--border)", borderRadius:14 }}>
            <div>
              <strong>تم تحديث السيرة</strong>
              <div className="sub">تم التعرف على مهارة جديدة: TypeScript</div>
            </div>
            <div><a className="btn ghost" href="#">عرض التفاصيل</a></div>
          </div>
        </div>
      </section>

      <p className="sub" style={{ marginTop:16, textAlign:"center" }}>© 2025 Talents AI — صفحة "الإشعارات" (React)</p>
    </>
  );
}
