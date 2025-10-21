import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";

export default function Signup(){
  const { user, signup } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  // اجعل الافتراضي "employee" (موظّف)
  const [role, setRole] = useState("employee"); // 'employee' | 'hr'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  // لو مسجّل بالفعل، رجّعه مباشرةً
  if (user) {
    const go = user.role === "hr" ? "/hr" : "/employee";
    return <Navigate to={go} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      await signup({ name, email, password, role });
      const to = loc.state?.from || (role === "hr" ? "/hr" : "/employee");
      nav(to, { replace: true });
    }catch(ex){
      setErr(ex.message || "حدث خطأ أثناء إنشاء الحساب");
    }
  };

  // ستايل بسيط مؤقت — غيّره بتصميمك بحرية
  const input = { height:44, padding:"0 12px", borderRadius:10, border:"1px solid var(--border)", background:"transparent", color:"var(--text)", width:"100%" };
  const card = { width:480, maxWidth:"92vw", margin:"40px auto" };

  return (
    <section className="card" style={card}>
      <h2 style={{marginTop:0}}>إنشاء حساب</h2>
      {err && <div className="sub" style={{color:"tomato"}}>{err}</div>}

      <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
        <div>
          <label className="sub">الاسم</label>
          <input style={input} value={name} onChange={(e)=>setName(e.target.value)} placeholder="اسمك" />
        </div>

        <div>
          <label className="sub">الدور</label>
          <div style={{display:"flex", gap:8, marginTop:6}}>
            <label className="chip" style={{cursor:"pointer"}}>
              <input type="radio" name="role" value="employee" checked={role==="employee"} onChange={()=>setRole("employee")} /> موظّف
            </label>
            <label className="chip" style={{cursor:"pointer"}}>
              <input type="radio" name="role" value="hr" checked={role==="hr"} onChange={()=>setRole("hr")} /> HR
            </label>
          </div>
        </div>

        <div>
          <label className="sub">البريد</label>
          <input style={input} value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div>
          <label className="sub">كلمة المرور</label>
          <input type="password" style={input} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        <button className="btn" type="submit">تسجيل</button>

        <div className="sub">
          لديك حساب بالفعل؟ <Link className="btn ghost" to="/login">تسجيل الدخول</Link>
        </div>
      </form>
    </section>
  );
}
