import React, { useMemo, useState } from "react";

export default function HRCandidates(){
  const input = { height:40, padding:"0 12px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text)" };

  const allCandidates = [
    { id:1, name:"Ahmed Ali",    job:"Front-end Developer", match:92, tech:85, soft:88, status:"قائمة مختصرة" },
    { id:2, name:"Sara Khaled",  job:"Front-end Developer", match:90, tech:82, soft:91, status:"قائمة مختصرة" },
    { id:3, name:"Omar Nabil",   job:"Full-stack Engineer", match:88, tech:80, soft:87, status:"قيد التقييم" },
    { id:4, name:"Laila Mostafa",job:"Product Designer",    match:86, tech:78, soft:86, status:"مرفوض" },
    { id:5, name:"Youssef Hana", job:"Full-stack Engineer", match:85, tech:79, soft:83, status:"مقابلة" },
  ];

  const [q, setQ] = useState("");
  const [job, setJob] = useState("all");
  const [status, setStatus] = useState("all");
  const [minMatch, setMinMatch] = useState(0);

  const filtered = useMemo(()=>{
    return allCandidates.filter(c=>{
      if(q && !(`${c.name} ${c.job}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if(job!=="all" && c.job!==job) return false;
      if(status!=="all" && c.status!==status) return false;
      if(c.match < Number(minMatch)) return false;
      return true;
    });
  }, [q, job, status, minMatch]);

  return (
    <>
      <section className="card" style={{ marginBottom:16 }}>
        <h3>إدارة المتقدمين</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:10 }}>
          <input style={input} placeholder="ابحث بالاسم أو الوظيفة" value={q} onChange={e=>setQ(e.target.value)} />
          <select style={input} value={job} onChange={e=>setJob(e.target.value)}>
            <option value="all">كل الوظائف</option>
            <option>Front-end Developer</option>
            <option>Full-stack Engineer</option>
            <option>Product Designer</option>
          </select>
          <select style={input} value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="all">كل الحالات</option>
            <option>قائمة مختصرة</option>
            <option>قيد التقييم</option>
            <option>مقابلة</option>
            <option>مرفوض</option>
          </select>
          <label className="sub" style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
            حد أدنى للمطابقة: <input type="number" min={0} max={100} value={minMatch} onChange={e=>setMinMatch(e.target.value)} style={{...input, width:100}} />
          </label>
        </div>
      </section>

      <section className="card">
        <h3>قائمة المرشحين</h3>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14, marginTop:8 }}>
          <thead>
            <tr>
              {["#","الاسم","الوظيفة","مطابقة JD","تقني","سوفت","الحالة","إجراءات"].map((h,i)=>(
                <th key={i} className="sub" style={{ textAlign:"right", padding:"10px 8px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c,i)=>(
              <tr key={c.id}>
                <td style={td}>{i+1}</td>
                <td style={td}><strong>{c.name}</strong></td>
                <td style={td}>{c.job}</td>
                <td style={td}>{c.match}%</td>
                <td style={td}>{c.tech}</td>
                <td style={td}>{c.soft}</td>
                <td style={td}>{c.status}</td>
                <td style={td}>
                  <a className="btn ghost" href="#">عرض الملف</a>
                  <a className="btn" href="#">تواصل</a>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={8} style={{ padding:"16px 8px", textAlign:"center" }} className="sub">لا توجد نتائج مطابقة للمرشّحات الحالية</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <p className="sub" style={{ marginTop:16, textAlign:"center" }}>© 2025 Talents AI — HR Candidates (React)</p>
    </>
  );
}

const td = { padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)", textAlign:"right" };
