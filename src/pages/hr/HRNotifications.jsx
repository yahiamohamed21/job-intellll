import React from "react";

export default function HRNotifications(){
  const Switch = ({ label, def=true }) => (
    <label style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:12, border:"1px solid var(--border)", borderRadius:12}}>
      <span>{label}</span>
      <input type="checkbox" defaultChecked={def} />
    </label>
  );

  return (
    <>
      <section className="card" style={{ marginBottom:16 }}>
        <h3>الإشعارات • HR</h3>
        <p className="sub">تابع نشاط الوظائف والمرشحين والتنبيهات المهمة</p>
      </section>

      <section className="card" style={{ marginBottom:16 }}>
        <h3>تفضيلات</h3>
        <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr 1fr", marginTop:10 }}>
          <Switch label="مرشح جديد لوظيفة مفتوحة" />
          <Switch label="مرشح وصل إلى القائمة المختصرة" />
          <Switch label="مذكّرات مقابلة قادمة" />
          <Switch label="طلب تحديث حالة من المدير" />
          <Switch label="ملخص أسبوعي" def={false} />
          <Switch label="إشعارات بريدية فقط" def={false} />
        </div>
      </section>

      <section className="card">
        <h3>الوارد</h3>
        <div style={{ display:"grid", gap:10, marginTop:10 }}>
          {[
            ["Ahmed Ali تقدّم لوظيفة Front-end Developer","منذ 10 دقائق"],
            ["Sara Khaled وصلت إلى القائمة المختصرة","قبل ساعة"],
            ["تذكير: مقابلة مرشح Full-stack غدًا 11:00","قبل 3 ساعات"],
          ].map(([t, time], i)=>(
            <div key={i} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, padding:12, border:"1px solid var(--border)", borderRadius:14 }}>
              <div>
                <strong>{t}</strong>
                <div className="sub">{time}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <a className="btn ghost" href="#">تمييز كمقروء</a>
                <a className="btn" href="#">فتح</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="sub" style={{ marginTop:16, textAlign:"center" }}>© 2025 Talents AI — HR Notifications (React)</p>
    </>
  );
}
