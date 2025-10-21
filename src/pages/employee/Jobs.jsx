import React from "react";

export default function Jobs(){
  const inputStyle = { height:40, padding:"0 12px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text)" };

  return (
    <>
      <section className="card" style={{ marginBottom:16 }}>
        <h2 style={{ margin:"0 0 6px" }}>وظائف مقترحة لك</h2>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:8 }}>
          <input style={inputStyle} placeholder="ابحث عن مسمى وظيفي" />
          <select style={inputStyle} defaultValue="القاهرة">
            <option>القاهرة</option>
            <option>الإسكندرية</option>
            <option>عن بُعد</option>
          </select>
          <label className="sub" style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
            <input type="checkbox" defaultChecked /> وظائف عن بُعد
          </label>
          <label className="sub" style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
            <input type="checkbox" /> دوام جزئي
          </label>
        </div>
      </section>

      <section className="card">
        <div className="jobs">
          {[
            { title:"Front-end Developer", company:"Techly • القاهرة • دوام كامل", match:"82%", altColor:false, skills:"React, TypeScript, REST" },
            { title:"Full-stack Engineer", company:"CloudLabs • هجين", match:"79%", altColor:true, skills:"Node.js, React, SQL" },
            { title:"React Developer", company:"NovaWorks • عن بُعد", match:"76%", altColor:false, skills:"React, Next.js, GraphQL" },
          ].map((j, i)=>(
            <div key={i} className="job">
              <div style={{ display:"flex", gap:12 }}>
                <div className="logo" />
                <div>
                  <strong>{j.title}</strong>
                  <div className="sub">{j.company}</div>
                  <div className="sub" style={{ marginTop:6 }}>المهارات: {j.skills}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <div
                  className="match"
                  style={j.altColor ? { background:"rgba(56,189,248,.12)", borderColor:"rgba(56,189,248,.35)", color:"#0891b2" } : undefined}
                >
                  {j.match}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <a className="btn ghost" href="#">حفظ</a>
                  <a className="btn" href="#">تقدّم الآن</a>
                </div>
              </div>
            </div>
          ))}
          <div style={{ textAlign:"center", marginTop:6 }}>
            <a className="btn ghost" href="#">عرض المزيد</a>
          </div>
        </div>
      </section>

      <p className="sub" style={{ marginTop:16, textAlign:"center" }}>© 2025 Talents AI — صفحة "وظائف مقترحة" (React)</p>
    </>
  );
}
