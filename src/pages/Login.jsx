import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toastSuccess, alertError, toastInfo } from "../lib/alerts";

export default function Login(){
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState("job-seeker"); // 'job-seeker' | 'hr'
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      await login({ email, password, role });

      // SweetAlert2 toast للنجاح
      toastSuccess(role === "hr" ? "تم تسجيل الدخول (HR) بنجاح" : "تم تسجيل الدخول بنجاح");

      const to = loc.state?.from || (role === "hr" ? "/hr" : "/employee");
      nav(to, { replace: true });
    }catch(ex){
      alertError("فشل تسجيل الدخول", ex?.message || "تحقق من البريد/كلمة المرور وحاول مرة أخرى");
      setErr(ex?.message || "Login failed");
    }
  };

  const input = {
    height: 44, padding: "0 14px", borderRadius: 10,
    border: "1px solid var(--border)", background: "transparent",
    color: "var(--text)", width: "100%"
  };

  return (
    <div style={{minHeight:"100dvh", background:"var(--bg)"}}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "40px 20px",
        display: "grid", gridTemplateColumns: "1fr 480px", gap: 24,
      }}>
        {/* Illustration */}
        <div style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: 20,
          background: "linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0)), var(--card)"
        }}>
          <div style={{
            height: 520, display: "grid", placeItems: "center",
            borderRadius: 12, background:
              "radial-gradient(600px 300px at 70% 30%, rgba(56,189,248,.1), transparent 50%), var(--surface)"
          }}>
            <img
              src="/login-illustration.svg"
              alt="Businessman hurdles illustration"
              style={{ maxWidth: "92%", maxHeight: "92%", objectFit: "contain", opacity: .95 }}
              onError={(e)=>{ e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="sub" style={{textAlign:"center", marginTop:10, opacity:.8}}>
            (ضع ملف <code>public/login-illustration.svg</code> لعرض الرسم)
          </div>
        </div>

        {/* Form */}
        <div style={{
          border: "1px solid var(--border)", borderRadius: 16, padding: 24,
          background: "linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0)), var(--card)"
        }}>
          <h2 style={{margin:"0 0 18px", color:"#1e3a8a", fontWeight:800}}>
            Welcome back to Jobintel
          </h2>

          {/* اختيار الدور */}
          <div className="sub" style={{display:"flex", gap:8, alignItems:"center", margin:"-6px 0 10px"}}>
            Sign in as:
            <label className="chip" style={{cursor:"pointer"}}>
              <input type="radio" name="role" value="job-seeker"
                checked={role==="job-seeker"} onChange={()=>setRole("job-seeker")} /> Job seeker
            </label>
            <label className="chip" style={{cursor:"pointer"}}>
              <input type="radio" name="role" value="hr"
                checked={role==="hr"} onChange={()=>setRole("hr")} /> HR
            </label>
          </div>

          <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
            {err && <div className="sub" style={{color:"tomato"}}>{err}</div>}

            <input style={input} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input style={input} placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />

            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <Link to="#" className="sub" style={{color:"#f97316", fontWeight:700}}>Forgot password?</Link>

              {/* Remember me */}
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <span className="sub">Remember&nbsp;<span style={{opacity:.7}}>sign in details</span></span>
                <button
                  type="button"
                  onClick={()=>setRemember(v=>!v)}
                  aria-pressed={remember}
                  style={{
                    width: 50, height: 26, borderRadius: 999,
                    border: "1px solid var(--border)", background: remember ? "#fb923c" : "rgba(148,163,184,.25)",
                    position:"relative"
                  }}
                >
                  <span style={{
                    position:"absolute", top:2, left: remember ? 26 : 2, width:22, height:22,
                    background:"#fff", borderRadius:"50%", transition:"left .18s"
                  }} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                height: 46, borderRadius: 999, border: "1px solid rgba(251,146,60,.6)",
                background: "linear-gradient(180deg, rgba(251,146,60,1), rgba(251,146,60,.85))",
                color:"#fff", fontWeight:800
              }}
            >
              Log in
            </button>

            <div style={{display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:12}}>
              <div style={{height:1, background:"rgba(148,163,184,.35)"}} />
              <span className="sub" style={{fontWeight:700}}>OR</span>
              <div style={{height:1, background:"rgba(148,163,184,.35)"}} />
            </div>

            <button
              type="button"
              className="btn secondary"
              style={{
                height: 44, borderRadius: 999, width:"100%",
                background:"#fff", color:"#1f2937",
                display:"inline-flex", alignItems:"center", justifyContent:"center", gap:10,
                border:"1px solid rgba(148,163,184,.35)"
              }}
              onClick={()=>toastInfo("سيتم ربط Google OAuth لاحقًا")}
            >
              <span style={{
                width:18, height:18, display:"inline-block",
                background:"conic-gradient(#ea4335 0 25%, #fbbc05 0 50%, #34a853 0 75%, #4285f4 0 100%)",
                borderRadius:3
              }} />
              Continue with Google
            </button>

            <div className="sub" style={{textAlign:"center"}}>
              Don’t have an account?{" "}
              <Link to="/signup" style={{color:"#f97316", fontWeight:700}}>Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
