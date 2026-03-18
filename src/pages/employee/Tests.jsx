import React from "react";

export default function Tests(){
  return (
    <>
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 6px" }}>اختباراتك</h2>
        <p className="sub">راجع نتائجك وحسّن مستواك عبر إعادة المحاولة بعد المذاكرة</p>
      </section>

      <section className="grid">
        {/* الاختبار التقني */}
        <article className="card">
          <h3>الاختبار التقني</h3>
          <p className="sub">اختيار من متعدد + سيناريوهات • 20 سؤالاً • 25 دقيقة</p>
          <div
            style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              gap:12, padding:"10px 0", borderBottom:"1px dashed rgba(148,163,184,.15)"
            }}
          >
            <span>آخر نتيجة</span><strong>80/100</strong>
          </div>
          <div className="progress" style={{ marginTop: 6 }}>
            {/* CSS variable */}
            <span style={{ "--val": 80 }} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <a className="btn" href="#">بدء محاولة جديدة</a>
            <a className="btn ghost" href="#">مراجعة بنك الأسئلة</a>
          </div>
        </article>

        {/* اختبار المهارات الشخصية */}
        <article className="card">
          <h3>اختبار المهارات الشخصية</h3>
          <p className="sub">مواقف سلوكية (STAR) • إجابة قصيرة</p>
          <div
            style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              gap:12, padding:"10px 0", borderBottom:"1px dashed rgba(148,163,184,.15)"
            }}
          >
            <span>آخر نتيجة</span><strong>74/100</strong>
          </div>
          <div className="progress" style={{ marginTop: 6 }}>
            <span style={{ "--val": 74 }} />
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <a className="btn secondary" href="#">تدريب على الإجابات</a>
            <a className="btn ghost" href="#">عرض ملاحظات المقيم</a>
          </div>
        </article>

        {/* سجلّ المحاولات */}
        <article className="card" style={{ gridColumn: "1 / -1" }}>
          <h3>سجلّ المحاولات</h3>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
            <thead>
              <tr>
                <th className="sub" style={{ textAlign:"right", padding:"10px 8px" }}>التاريخ</th>
                <th className="sub" style={{ textAlign:"right", padding:"10px 8px" }}>نوع الاختبار</th>
                <th className="sub" style={{ textAlign:"right", padding:"10px 8px" }}>الأسئلة</th>
                <th className="sub" style={{ textAlign:"right", padding:"10px 8px" }}>النتيجة</th>
                <th className="sub" style={{ textAlign:"right", padding:"10px 8px" }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["2025-06-24","تقني",20,80,"مكتمل"],
                ["2025-06-10","سوفت",12,74,"مكتمل"],
                ["2025-05-29","تقني",20,76,"مكتمل"],
                ["2025-05-07","سوفت",10,71,"مكتمل"],
              ].map((r, i)=>(
                <tr key={i}>
                  {r.map((c, j)=>(
                    <td key={j} style={{ padding:"10px 8px", borderBottom:"1px dashed rgba(148,163,184,.15)", textAlign:"right" }}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        {/* نصائح */}
        <article className="card">
          <h3>نصائح لتحسين الأداء</h3>
          <ul className="sub" style={{ margin: "8px 0 0 18px" }}>
            <li>راجع نقاط الضعف من تقرير المحاولة السابقة.</li>
            <li>ركّز على مهارات الـJD المستهدفة في السوق.</li>
            <li>جرّب محاكاة زمنية بنفس وقت الاختبار.</li>
          </ul>
        </article>

        {/* تذكيرات */}
        <article className="card">
          <h3>التذكيرات</h3>
          <p className="sub">خصص مواعيد أسبوعية للمراجعة.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <a className="btn ghost" href="#">إنشاء تذكير</a>
            <a className="btn ghost" href="#">استيراد مواد مذاكرة</a>
          </div>
        </article>
      </section>

      <p className="sub" style={{ marginTop: 16, textAlign: "center" }}>
        © 2025 Talents AI — صفحة "اختباراتي" (React)
      </p>
    </>
  );
}
