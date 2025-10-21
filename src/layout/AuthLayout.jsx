import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function AuthLayout(){
  return (
    <div className="min-h-screen" style={{
      display:"grid", placeItems:"center",
      background: "radial-gradient(1200px 800px at 100% -10%, rgba(56,189,248,.07), transparent 50%), radial-gradient(900px 700px at -10% 120%, rgba(34,197,94,.07), transparent 45%), var(--bg)"
    }}>
      <div className="card" style={{ width: 420, maxWidth:"90vw" }}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
          <div className="logo" style={{width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#22c55e,#38bdf8)"}} />
          <h2 style={{margin:0}}>Job Intel <span style={{color:"var(--accent)"}}>AI</span></h2>
        </div>
        <Outlet />
        <div className="sub" style={{marginTop:12}}>
          <Link className="btn ghost" to="/">العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  );
}
