import React from "react";

export default function HRJobs(){
  const input = { height:40, padding:"0 12px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text)" };

  const jobs = [
    { id:"JD-2025-01", title:"Front-end Developer", dept:"Engineering", openings:1, candidates:42, top25:25, status:"مفتوحة", created:"2025-10-01" },
    { id:"JD-2025-02", title:"Full-stack Engineer",  dept:"Engineering", openings:2, candidates:61, top25:25, status:"مفتوحة", created:"2025-09-20" },
    { id:"JD-2025-03", title:"Product Designer",    dept:"Design",      openings:1, candidates:30, top25:18, status:"مغلقة", created:"2025-08-12" },
  ];

  return (
    <>
      <section className="card" style={{ marginBottom:16 }}>
        <h3>إدارة الوظائف</h3>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
          <a className="btn" href="#">+ إنشاء وظيفة</a>
          <a className="btn ghost" href="#">رفع Job Description</a>
          <input style={input} placeholder="ابحث بالعنوان أو الكود (مثال: JD-2025-01)" />
          <select style={input} defaultValue="all">
            <option value="all">كل الأقسام</option>
            <option>Engineering</option>
            <option>Design</option>
            <option>Data</option>
          </select>
          <select style={input} defaultValue="all">
            <option value="all">كل الحالات</option>
            <option>مفتوحة</option>
            <option>مغلقة</option>
          </select>
        </div>
      </section>

      <section className="card">
        <h3>قائمة الوظائف</h3>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14, marginTop:8 }}>
          <thead>
            <tr>
              {["الكود","العنوان","القسم","الشواغر","المتقدمون","Top 25","الحالة","أُنشئت","إجراءات"].map((h,i)=>(
                <th key={i} className="sub" style={{ textAlign:"right", padding:"10px 8px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((j)=>(
              <tr key={j.id}>
                <td style={td}>{j.id}</td>
                <td style={td}><strong>{j.title}</strong></td>
                <td style={td}>{j.dept}</td>
                <td style={td}>{j.openings}</td>
                <td style={td}>{j.candidates}</td>
                <td style={td}>{j.top25}</td>
                <td style={td}>{j.status}</td>
                <td style={td}>{j.created}</td>
                <td style={td}>
                  <a className="btn ghost" href="#">عرض المرشحين</a>
                  <a className="btn" href="#">تحرير</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="sub" style={{ marginTop:16, textAlign:"center" }}>© 2025 Talents AI — HR Jobs (React)</p>
    </>
  );
}

const td = { padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)", textAlign:"right" };
