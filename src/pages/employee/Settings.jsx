import React from "react";
import { useTheme } from "../../theme/ThemeProvider.jsx";

export default function Settings(){
  const { theme, setTheme } = useTheme();
  const input = { height:40, padding:"0 12px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text)" };

  const Switch = ({ label, def=false }) => (
    <label style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:12, border:"1px solid var(--border)", borderRadius:12}}>
      <span>{label}</span>
      <input type="checkbox" defaultChecked={def} />
    </label>
  );

  return (
    <>
      <section className="card" style={{ marginBottom:16 }}>
        <h2 style={{ margin:"0 0 6px" }}>الإعدادات</h2>
        <p className="sub">تحكّم في حسابك، الخصوصية، والإشعارات</p>
      </section>

      <section style={{ display:"grid", gap:16, gridTemplateColumns:"1fr 1fr" }}>
        {/* الملف الشخصي */}
        <article className="card">
          <h3>الملف الشخصي</h3>
          <div style={{ display:"grid", gap:12 }}>
            <div><label className="sub">الاسم</label><input style={input} defaultValue="أحمد علي" /></div>
            <div><label className="sub">البريد</label><input style={input} defaultValue="ahmed@example.com" /></div>
            <div><label className="sub">الهاتف</label><input style={input} defaultValue="+20 100 000 0000" /></div>
            <div><label className="sub">الموقع</label><input style={input} defaultValue="القاهرة، مصر" /></div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <a className="btn" href="#">حفظ التغييرات</a>
            <a className="btn ghost" href="#">إلغاء</a>
          </div>
        </article>

        {/* الأمان */}
        <article className="card">
          <h3>الأمان</h3>
          <div style={{ display:"grid", gap:12 }}>
            <div><label className="sub">كلمة المرور الحالية</label><input style={input} type="password" defaultValue="••••••••" /></div>
            <div><label className="sub">كلمة مرور جديدة</label><input style={input} type="password" /></div>
            <div><label className="sub">تأكيد كلمة المرور</label><input style={input} type="password" /></div>
          </div>
          <div style={{ marginTop:10 }}><a className="btn" href="#">تحديث كلمة المرور</a></div>
          <hr style={{ opacity:.2, margin:"14px 0" }} />
          <Switch label="التحقق بخطوتين (2FA)" />
        </article>

        {/* التفضيلات */}
        <article className="card">
          <h3>التفضيلات</h3>
          <div style={{ display:"grid", gap:12 }}>
            <div>
              <label className="sub">اللغة</label>
              <select style={input} defaultValue="ar">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="sub">المظهر</label>
              <select style={input} value={theme} onChange={e=>setTheme(e.target.value)}>
                <option value="light">فاتح</option>
                <option value="dark">داكن</option>
                <option value="system">نظام الجهاز</option>
              </select>
            </div>
            <Switch label="إرسال تقارير أسبوعية" />
          </div>
        </article>

        {/* الخصوصية */}
        <article className="card">
          <h3>الخصوصية</h3>
          <div style={{ display:"grid", gap:12 }}>
            <Switch label="إخفاء بريدي عن الشركات" />
            <Switch label="السماح بظهور ملفي في نتائج البحث" def />
            <Switch label="السماح بالمراسلة عبر المنصة" def />
          </div>
          <hr style={{ opacity:.2, margin:"14px 0" }} />
          <a className="btn" href="#" style={{ background:"linear-gradient(180deg,rgba(239,68,68,.16),rgba(239,68,68,.08))", borderColor:"rgba(239,68,68,.35)" }}>
            حذف الحساب نهائيًا
          </a>
        </article>
      </section>

      <p className="sub" style={{ marginTop:16, textAlign:"center" }}>© 2025 Talents AI — صفحة "الإعدادات" (React)</p>
    </>
  );
}
