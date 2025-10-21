// src/pages/hr/HRDashboard.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "../../Components/ui/chart.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines, faWandMagicSparkles, faBriefcase, faLocationDot } from "@fortawesome/free-solid-svg-icons";

// ===== بيانات نموذجية =====
const jobs = [
  { id: "frontend", title: "Front-end Developer" },
  { id: "backend",  title: "Back-end Engineer"  },
  { id: "pm",       title: "Product Manager"    },
];

const cities = [
  { id: "all",   title: "كل المدن"   },
  { id: "cairo", title: "القاهرة"    },
  { id: "alex",  title: "الإسكندرية" },
  { id: "giza",  title: "الجيزة"     },
  { id: "remote",title: "عن بُعد"    },
];

// مرشحين لكل وظيفة + مدينة
const topMatchesByJob = {
  frontend: [
    { name: "Ahmed A.",   match: 92, tech: 85, soft: 88, city: "cairo"  },
    { name: "Sara K.",    match: 90, tech: 82, soft: 91, city: "alex"   },
    { name: "Omar N.",    match: 88, tech: 80, soft: 87, city: "giza"   },
    { name: "Laila M.",   match: 86, tech: 78, soft: 86, city: "cairo"  },
    { name: "Youssef H.", match: 85, tech: 79, soft: 83, city: "remote" },
  ],
  backend: [
    { name: "Ali S.",     match: 89, tech: 86, soft: 80, city: "cairo"  },
    { name: "Mona R.",    match: 87, tech: 82, soft: 84, city: "alex"   },
    { name: "Hadi Z.",    match: 84, tech: 79, soft: 82, city: "remote" },
    { name: "Nada E.",    match: 82, tech: 77, soft: 81, city: "giza"   },
    { name: "Samir T.",   match: 80, tech: 76, soft: 79, city: "cairo"  },
  ],
  pm: [
    { name: "Rana F.",    match: 91, tech: 78, soft: 92, city: "alex"   },
    { name: "Ola Q.",     match: 88, tech: 75, soft: 90, city: "remote" },
    { name: "Hana K.",    match: 85, tech: 73, soft: 88, city: "cairo"  },
    { name: "Khaled B.",  match: 82, tech: 72, soft: 86, city: "giza"   },
    { name: "Dina W.",    match: 80, tech: 70, soft: 84, city: "cairo"  },
  ],
};

export default function HRDashboard(){
  const [selectedJob, setSelectedJob] = useState(jobs[0].id); // "frontend"
  const [selectedCity, setSelectedCity] = useState("all");

  // إعدادات الألوان للـChartContainer (يوّلّد --color-match / --color-trend)
  const chartConfig = {
    match: { label: "مطابقة JD",      color: "hsl(142.1 70.6% 45.3%)" }, // أخضر (الأعمدة)
    trend: { label: "اتجاه المطابقة", color: "hsl(199 89% 48%)" },       // أزرق (الخط)
  };

  // Top 5 دائمًا حسب الفلاتر
  const chartData = useMemo(() => {
    const source = selectedJob === "all"
      ? Object.values(topMatchesByJob).flat()
      : (topMatchesByJob[selectedJob] || []);
    return source
      .filter(c => selectedCity === "all" ? true : c.city === selectedCity)
      .sort((a,b)=> b.match - a.match)
      .slice(0,5);
  }, [selectedJob, selectedCity]);

  // Top 10 للجدول
  const tableRows = useMemo(() => {
    const source = selectedJob === "all"
      ? Object.values(topMatchesByJob).flat()
      : (topMatchesByJob[selectedJob] || []);
    return source
      .filter(c => selectedCity === "all" ? true : c.city === selectedCity)
      .sort((a,b)=> b.match - a.match)
      .slice(0, 10);
  }, [selectedJob, selectedCity]);

  return (
    <>
      {/* الصف العلوي */}
      <section className="grid" style={{ marginBottom: 16 }}>
        <article className="card">
          <h3 style={{ display:"flex", alignItems:"center", gap:8, marginTop:0 }}>
            <FontAwesomeIcon icon={faFileLines} />
            رفع وصف وظيفي (JD)
          </h3>
          <p className="sub">حمّل الـJob Description ليتم تحليل المهارات المطلوبة</p>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <a className="btn" href="#"><FontAwesomeIcon icon={faFileLines} /> رفع JD</a>
            <a className="btn ghost" href="#"><FontAwesomeIcon icon={faWandMagicSparkles} /> إنشاء JD جديد</a>
          </div>
        </article>

        <article className="card">
          <h3 style={{ display:"flex", alignItems:"center", gap:8, marginTop:0 }}>
            <FontAwesomeIcon icon={faBriefcase} />
            ملخص سريع
          </h3>

          {/* فلاتر: الوظيفة + المدينة */}
          <div className="filters" style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", marginTop: 8 }}>
            <label className="sub" htmlFor="job-filter">الوظيفة:</label>
            <select
              id="job-filter"
              className="input"
              value={selectedJob}
              onChange={(e)=>setSelectedJob(e.target.value)}
              style={{ padding:"8px 10px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text)" }}
            >
              <option value="all">الكل</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>

            <label className="sub" htmlFor="city-filter" style={{ marginInlineStart: 6 }}>
              <FontAwesomeIcon icon={faLocationDot} /> المدينة:
            </label>
            <select
              id="city-filter"
              className="input"
              value={selectedCity}
              onChange={(e)=>setSelectedCity(e.target.value)}
              style={{ padding:"8px 10px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text)" }}
            >
              {cities.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          {/* KPIs ثابتة كعينة */}
          <div className="kpis" style={{ marginTop: 10 }}>
            <div className="kpi"><div className="value">128</div><div className="sub">مرشح في القاعدة</div></div>
            <div className="kpi"><div className="value">25</div><div className="sub">أقرب تطابق للـJD</div></div>
            <div className="kpi"><div className="value">10</div><div className="sub">أفضل مرشحين مُوصى بهم</div></div>
          </div>
        </article>
      </section>

      {/* الشارت — (Bar + Line) مع ترتيب إغلاق التاقات الصحيح */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop:0 }}>أفضل 5 مرشحين (مطابقة)</h3>

        <ChartContainer config={chartConfig} className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis domain={[0,100]} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              {/* الأعمدة */}
              <Bar dataKey="match" name="مطابقة JD" fill="var(--color-match)" radius={[6,6,0,0]} />
              {/* الخط */}
              <Line
                type="monotone"
                dataKey="match"
                name="اتجاه المطابقة"
                stroke="var(--color-trend)"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </section>

      {/* الجدول */}
      <section className="card">
        <h3 style={{ marginTop:0 }}>
          {selectedJob === "all" ? "أفضل 10 مرشحين (إجمالي)" : "Top 10 للوظيفة المختارة"}
        </h3>

        <div className="table-scroll">
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14, minWidth: 640 }}>
            <thead>
              <tr>
                {["#","المرشح","مطابقة JD","تقني","سوفت","المدينة","إجراء"].map((h,i)=>(
                  <th key={i} className="sub" style={{ textAlign:"right", padding:"10px 8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((c,i)=>(
                <tr key={i}>
                  <td style={{ padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)" }}>{i+1}</td>
                  <td style={{ padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)" }}><strong>{c.name}</strong></td>
                  <td style={{ padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)" }}>{c.match}%</td>
                  <td style={{ padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)" }}>{c.tech}</td>
                  <td style={{ padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)" }}>{c.soft}</td>
                  <td style={{ padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)" }}>
                    {cities.find(x=>x.id===c.city)?.title || "—"}
                  </td>
                  <td style={{ padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)" }}>
                    <a className="btn ghost" href="#">عرض الملف</a>
                    <a className="btn " href="#">تواصل</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="sub" style={{ marginTop:16, textAlign:"center" }}>
        © 2025 Job Intel AI — HR Dashboard (React)
      </p>
    </>
  );
}
