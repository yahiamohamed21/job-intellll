import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";

export default function Home(){
  return (
    <>
      <Navbar />

      <section className="card" style={{maxWidth:780, margin:"40px auto"}}>
        <h1 style={{marginTop:0}}>Jobintel</h1>
        <p className="sub">الصفحة الرئيسية</p>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <Link className="btn" to="/login">Log in</Link>
          <Link className="btn secondary" to="/signup">Sign up</Link>
          <Link className="btn ghost" to="/about">عن Jobintel</Link>
        </div>

        
      </section>
    </>
  );
}
