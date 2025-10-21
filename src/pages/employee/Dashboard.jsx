import React from "react";
 import TrendBarChart from "../../Components/TrendBarChart.jsx";

//  font awesome 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVial, faWandMagicSparkles, faFileLines,
  faBriefcase, faBolt
} from "@fortawesome/free-solid-svg-icons";



export default function Dashboard(){
  return (
    <>
      <section className="card" aria-labelledby="kpi-title">
        <h3 id="kpi-title">نظرة عامة سريعة</h3>
        <p className="sub">تابع تقدّمك في الاختبارات والمقابلة ومطابقة الوظائف</p>
        <div className="kpis" role="list">
          <div className="kpi" role="listitem" aria-label="اختبارات التقنية والمهارات الشخصية">
            <div className="value">78<span style={{fontSize:14}}>/100</span></div>
            <div className="label">متوسط تقييم (تقني + سوفت)</div>
            <div className="progress" style={{marginTop:10}}>
              <span style={{ "--val": 78 }} />
            </div>
          </div>
          <div className="kpi" role="listitem" aria-label="مقابلة الفيديو">
            <div className="value">غير مكتمل</div>
            <div className="label">مطلوب إتمام 4 أسئلة • 2 دقيقة لكل سؤال</div>
            <div style={{marginTop:10, display:'flex', gap:8}}>
              <a className="btn" href="#">ابدأ المقابلة</a>
              <a className="btn ghost" href="#">معاينة الأسئلة</a>
            </div>
          </div>
          <div className="kpi" role="listitem" aria-label="أعلى تطابق وظيفي">
            <div className="value">82<span style={{fontSize:14}}>%</span></div>
            <div className="label">أفضل تطابق حاليًا</div>
            <div className="progress" style={{marginTop:10}}>
              <span style={{ "--val": 82 }} />
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{marginTop:16}}>
        <h3>تطوّر قدراتك عبر الشهور</h3>
        <p className="sub">رسم بياني بالأعمدة يُظهر أداءك (يومي/أسبوعي/شهري)</p>
        <TrendBarChart />
      </section>

      <section className="grid" aria-label="محتوى رئيسي" style={{marginTop:16}}>
        {/* العمود الأيسر */}
        <div className="col">
          <article className="card" aria-labelledby="tests-title">
            <h3 id="tests-title">
                <FontAwesomeIcon icon={faVial} style={{marginLeft:8, opacity:.9}} />
              اختباراتك
            </h3>
            <p className="sub">ارفع مستواك عبر إعادة المحاولة بعد المذاكرة 💪</p>

            <div className="row" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'14px 0', borderBottom:'1px dashed rgba(148,163,184,.15)'}}>
              <div>
                <strong>اختبار تقني</strong>
                <div className="sub">آخر نتيجة: 80/100 • 20 سؤالًا • 25 دقيقة</div>
                <div className="progress" style={{marginTop:8}}>
                  <span style={{ "--val": 80 }} />
                </div>
              </div>
              <div><a className="btn" href="#">إعادة الاختبار</a></div>
            </div>

            <div className="row" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'14px 0'}}>
              <div>
                <strong>اختبار مهارات شخصية</strong>
                <div className="sub">آخر نتيجة: 74/100 • مواقف سلوكية</div>
                <div className="progress" style={{marginTop:8}}>
                  <span style={{ "--val": 74 }} />
                </div>
              </div>
              <div><a className="btn secondary" href="#">تحسين نقاطي</a></div>
            </div>
          </article>

          <article className="card" aria-labelledby="skills-title">
            <h3 id="skills-title">
              <FontAwesomeIcon icon={faWandMagicSparkles} style={{marginLeft:8, opacity:.9}} />
              مهاراتك المستخرجة من السيرة
            </h3>

            <div className="skills" aria-label="قائمة المهارات">
              <span className="chip">JavaScript</span>
              <span className="chip">React</span>
              <span className="chip">Node.js</span>
              <span className="chip">REST APIs</span>
              <span className="chip">SQL</span>
              <span className="chip">Problem Solving</span>
              <span className="chip">Teamwork</span>
              <span className="chip">Communication</span>
            </div>
            <div style={{marginTop:12}}>
              <a className="btn ghost" href="#">تعديل المهارات</a>
              <a className="btn ghost" href="#">+ إضافة شهادة</a>
            </div>
          </article>
        </div>

        {/* العمود الأيمن */}
        <div className="col">
          <article className="card" aria-labelledby="cv-title">
            <h3 id="cv-title">
              <FontAwesomeIcon icon={faFileLines} style={{marginLeft:8, opacity:.9}} />
              سيرتك الذاتية
            </h3>

            <p className="sub">CV_Ahmed_2025.pdf • تم التعرف على 18 مهارة</p>
            <div style={{display:'flex', gap:10, marginTop:10}}>
              <a className="btn" href="#">تحديث السيرة</a>
              <a className="btn ghost" href="#">تنزيل</a>
            </div>
          </article>

          <article className="card" aria-labelledby="jobs-title">
            <h3 id="jobs-title">
              <FontAwesomeIcon icon={faBriefcase} style={{marginLeft:8, opacity:.9}} />
              وظائف مقترحة لك
            </h3>

            <div className="jobs">
              <div className="job">
                <div style={{display:'flex', gap:12}}>
                  <div className="logo" aria-hidden="true"></div>
                  <div>
                    <strong>Front-end Developer</strong>
                    <div className="sub">Techly • القاهرة • دوام كامل</div>
                  </div>
                </div>
                <div className="match">82%</div>
              </div>

              <div className="job">
                <div style={{display:'flex', gap:12}}>
                  <div className="logo" aria-hidden="true"></div>
                  <div>
                    <strong>Full-stack Engineer</strong>
                    <div className="sub">CloudLabs • الإسكندرية • هجين</div>
                  </div>
                </div>
                <div className="match" style={{background:'rgba(56,189,248,.12)', borderColor:'rgba(56,189,248,.35)', color:'#0891b2'}}>79%</div>
              </div>

              <div className="job">
                <div style={{display:'flex', gap:12}}>
                  <div className="logo" aria-hidden="true"></div>
                  <div>
                    <strong>React Developer</strong>
                    <div className="sub">NovaWorks • عن بُعد</div>
                  </div>
                </div>
                <div className="match">76%</div>
              </div>

              <div style={{textAlign:'center', marginTop:6}}>
                <a className="btn ghost" href="#">عرض المزيد</a>
              </div>
            </div>
          </article>

          <article className="card" aria-labelledby="activity-title">
            <h3 id="activity-title">
              <FontAwesomeIcon icon={faBolt} style={{marginLeft:8, opacity:.9}} />
              آخر نشاط
            </h3>

            <div className="list" style={{display:'grid', gap:'var(--gap-list)'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'14px 0', borderBottom:'1px dashed rgba(148,163,184,.15)'}}>
                <span>📄 تم تحديث السيرة</span><span className="sub">قبل 3 أيام</span>
              </div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'14px 0', borderBottom:'1px dashed rgba(148,163,184,.15)'}}>
                <span>🧪 اكتمال اختبار تقني</span><span className="sub">قبل أسبوع</span>
              </div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'14px 0'}}>
                <span>✨ إضافة مهارة: TypeScript</span><span className="sub">قبل أسبوعين</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
