import React from "react";

export default function HRSettings(){
  const input = { height:40, padding:"0 12px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text)", width:"100%" };

  const Switch = ({ label, def=false }) => (
    <label style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:12, border:"1px solid var(--border)", borderRadius:12}}>
      <span>{label}</span>
      <input type="checkbox" defaultChecked={def} />
    </label>
  );

  const team = [
    { name:"Mona HR Lead", role:"Admin" },
    { name:"Hassan Recruiter", role:"Recruiter" },
    { name:"Nour Sourcer", role:"Sourcer" },
  ];

  return (
    <>
      <section className="card" style={{ marginBottom:16 }}>
        <h3>إعدادات المؤسسة • HR</h3>
        <p className="sub">معلومات المؤسسة، الأذونات، والتفضيلات</p>
      </section>

      <section style={{ display:"grid", gap:16, gridTemplateColumns:"1fr 1fr" }}>
        <article className="card">
          <h3>معلومات عامة</h3>
          <div style={{ display:"grid", gap:12 }}>
            <div><label className="sub">اسم المؤسسة</label><input style={input} defaultValue="Talentia LLC" /></div>
            <div><label className="sub">البريد</label><input style={input} defaultValue="hr@talentia.com" /></div>
            <div><label className="sub">المنطقة الزمنية</label>
              <select style={input} defaultValue="Africa/Cairo">
                <option>Africa/Cairo</option>
                <option>Asia/Riyadh</option>
                <option>Europe/Athens</option>
              </select>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <a className="btn" href="#">حفظ</a>
            <a className="btn ghost" href="#">إلغاء</a>
          </div>
        </article>

        <article className="card">
          <h3>الأمان والتراخيص</h3>
          <div style={{ display:"grid", gap:12 }}>
            <Switch label="فرض 2FA على جميع الأعضاء" />
            <Switch label="السماح بتصدير البيانات" />
            <Switch label="تنبيهات نشاط مريب" def />
          </div>
        </article>

        <article className="card">
          <h3>الفريق</h3>
          <div className="skills" style={{ marginTop:6 }}>
            {team.map((m)=>(
              <span key={m.name} className="chip">{m.name} — {m.role}</span>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <a className="btn" href="#">+ دعوة عضو</a>
            <a className="btn ghost" href="#">إدارة الأدوار</a>
          </div>
        </article>

        <article className="card">
          <h3>التفضيلات</h3>
          <div style={{ display:"grid", gap:12 }}>
            <Switch label="استقبال ملخص أسبوعي" def />
            <Switch label="دمج إشعارات البريد" />
            <Switch label="تفعيل وضع القراءة فقط" />
          </div>
        </article>
      </section>

      <p className="sub" style={{ marginTop:16, textAlign:"center" }}>© 2025 Talents AI — HR Settings (React)</p>
    </>
  );
}
