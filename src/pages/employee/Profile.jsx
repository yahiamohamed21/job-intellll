import React from "react";

export default function Profile(){
  return (
    <>
      {/* بطاقة رأسية */}
      <section className="card" style={{ display:"flex", gap:16, alignItems:"center", marginBottom:16 }}>
        <div className="avatar" style={{width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg,#22c55e,#38bdf8)"}} />
        <div>
          <h2 style={{ margin:"0 0 6px" }}> يحي محمد </h2>
          <div className="sub">Front-end Developer • القاهرة • متاح للعمل</div>
          <div style={{ marginTop:10, display:"flex", gap:8 }}>
            <a className="btn" href="#">تحديث السيرة</a>
            <a className="btn ghost" href="#">تنزيل السيرة</a>
          </div>
        </div>
      </section>

      <section className="grid">
        {/* نبذة + KPIs */}
        <article className="card">
          <h3>نبذة عني</h3>
          <p className="sub">
            مطور واجهات أمامية بخبرة 3+ سنوات في React/TypeScript وبناء أنظمة تصميم.
            مهتم بالأداء وتجربة المستخدم وإمكانية الوصول.
          </p>
          <div className="kpis" style={{ marginTop:10 }}>
            <div className="kpi">
              <div className="value">92%</div>
              <div className="sub">اكتمال الملف</div>
              <div className="progress" style={{ marginTop:8 }}>
                <span style={{ "--val": 92 }} />
              </div>
            </div>
            <div className="kpi">
              <div className="value">18</div>
              <div className="sub">مهارة مُوثّقة</div>
            </div>
            <div className="kpi">
              <div className="value">4</div>
              <div className="sub">شهادات</div>
            </div>
          </div>
        </article>

        {/* بيانات أساسية */}
        <article className="card">
          <h3>بيانات أساسية</h3>
          {[
            ["البريد", "ahmed@example.com"],
            ["الهاتف", "+20 100 000 0000"],
            ["الموقع", "القاهرة، مصر"],
            ["اللغة", "العربية • الإنجليزية"],
          ].map(([k,v],i)=>(
            <div key={i} style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"10px 0", borderBottom:"1px dashed rgba(148,163,184,.15)"}}>
              <span className="sub">{k}</span><strong>{v}</strong>
            </div>
          ))}
          <div style={{ marginTop:8 }}>
            <a className="btn ghost" href="#">تعديل البيانات</a>
          </div>
        </article>

        {/* مهارات */}
        <article className="card" style={{ gridColumn:"1 / -1" }}>
          <h3>المهارات</h3>
          <div className="skills">
            {["JavaScript","TypeScript","React","Next.js","Node.js","REST APIs","SQL","Problem Solving","Teamwork","Communication"].map((s)=>(
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
          <div style={{ marginTop:12, display:"flex", gap:8 }}>
            <a className="btn ghost" href="#">+ إضافة مهارة</a>
            <a className="btn ghost" href="#">+ إضافة شهادة</a>
          </div>
        </article>

        {/* السيرة الذاتية */}
        <article className="card">
          <h3>السيرة الذاتية</h3>
          <p className="sub">CV_Ahmed_2025.pdf • آخر تحديث قبل 3 أيام</p>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <a className="btn" href="#">رفع نسخة جديدة</a>
            <a className="btn ghost" href="#">معاينة</a>
          </div>
        </article>

        {/* روابط */}
        <article className="card">
          <h3>روابط</h3>
          <div className="skills">
            <a className="chip" href="#">GitHub</a>
            <a className="chip" href="#">LinkedIn</a>
            <a className="chip" href="#">Portfolio</a>
            <a className="chip" href="#">Behance</a>
          </div>
        </article>
      </section>

      <p className="sub" style={{ marginTop:16, textAlign:"center" }}>© 2025 Talents AI — صفحة "ملفي" (React)</p>
    </>
  );
}
