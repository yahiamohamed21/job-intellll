// src/components/FullScreenLoader.jsx
import React, { useEffect, useState } from "react";

export default function FullScreenLoader() {
  // نفس فكرة تغيير الرسالة اللي كانت في <script> في HTML
  const messages = [
    "Loading  ...",
   ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // NOTE:
  // - اللودر فوق كل حاجة (position: fixed, zIndex كبير)
  // - إحنا بنستخدم نفس الأنيميشن اللي انت عاملها، بس بنحولها ل <style> جوه الكومبوننت
  //   عشان تشتغل في React بدون ما نعمل ملف CSS منفصل.

  return (
    <>
      <style>{`
      .loader-root {
        position: fixed;
        inset: 0;
        z-index: 9999;
        margin: 0;
        background: radial-gradient(circle at center, #0f172a 0%, #1e293b 70%, #334155 100%);
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        font-family: "Poppins", sans-serif;
        color: #f8fafc;
      }

      .halo {
        position: absolute;
        width: 280px;
        height: 280px;
        border: 1px solid rgba(56,189,248,0.2);
        border-radius: 50%;
        animation: loader-spin 10s linear infinite;
        box-shadow: 0 0 25px rgba(56,189,248,0.3);
        z-index: 1;
      }

      .robot {
        position: relative;
        width: 220px;
        height: 280px;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: loader-float 3s ease-in-out infinite;
        z-index: 2;
      }

      .head {
        position: relative;
        width: 140px;
        height: 100px;
        background: linear-gradient(180deg, #1e293b, #0f172a);
        border-radius: 25px;
        border: 2px solid rgba(56,189,248,0.3);
        box-shadow: inset 0 0 15px rgba(56,189,248,0.4), 0 0 25px rgba(56,189,248,0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .antenna {
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 35px;
        background: #38bdf8;
        border-radius: 3px;
        box-shadow: 0 0 15px #38bdf8;
      }
      .antenna::after {
        content: '';
        position: absolute;
        top: -12px;
        left: -6px;
        width: 18px;
        height: 18px;
        background: #38bdf8;
        border-radius: 50%;
        animation: loader-pulse 1.2s infinite alternate;
        box-shadow: 0 0 20px #38bdf8;
      }

      .eyes {
        display: flex;
        gap: 20px;
      }
      .eye {
        width: 28px;
        height: 28px;
        background: radial-gradient(circle at 40% 40%, #38bdf8 0%, #0ea5e9 100%);
        border-radius: 50%;
        animation: loader-eyeTrack 3.5s infinite ease-in-out;
        box-shadow: 0 0 12px rgba(56,189,248,0.6);
        position: relative;
      }
      .eye::after {
        content: '';
        position: absolute;
        top: 6px;
        left: 8px;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        opacity: 0.9;
      }

      .mouth {
        margin-top: 10px;
        width: 50px;
        height: 6px;
        background: #38bdf8;
        border-radius: 5px;
        animation: loader-talk 1.2s infinite ease-in-out;
      }

      .body {
        position: relative;
        margin-top: 25px;
        width: 130px;
        height: 100px;
        background: linear-gradient(180deg, #1e293b, #0f172a);
        border-radius: 20px;
        border: 2px solid rgba(56,189,248,0.3);
        box-shadow: inset 0 -4px 10px rgba(0,0,0,0.3);
        display: flex;
        justify-content: center;
        align-items: flex-end;
      }

      .laptop {
        width: 95%;
        height: 60px;
        background: #0f172a;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        border: 1px solid rgba(56,189,248,0.4);
        box-shadow: inset 0 0 15px rgba(56,189,248,0.2);
      }

      .code-block {
        position: absolute;
        left: 10px;
        top: 5px;
        font-size: 9.5px;
        font-family: "Consolas", monospace;
        color: #38bdf8;
        opacity: 0.9;
        line-height: 1.3em;
        white-space: pre;
        animation: loader-scrollCode 6s linear infinite;
      }
      .syntax-key { color: #60a5fa; }
      .syntax-func { color: #22d3ee; }
      .syntax-str { color: #a7f3d0; }

      .arm {
        position: absolute;
        top: 55%;
        width: 45px;
        height: 12px;
        background: #1e293b;
        border-radius: 10px;
        box-shadow: 0 0 8px rgba(56,189,248,0.3);
      }
      .arm.left {
        left: -30px;
        transform-origin: right center;
        animation: loader-armMove 2.2s infinite ease-in-out;
      }
      .arm.right {
        right: -30px;
        transform-origin: left center;
        animation: loader-armMove 2.2s infinite ease-in-out reverse;
      }

      .shadow-under {
        margin-top: 30px;
        width: 120px;
        height: 25px;
        background: rgba(56,189,248,0.15);
        border-radius: 50%;
        filter: blur(2px);
        animation: loader-shadowFloat 3s ease-in-out infinite;
      }

      .loading-text {
        margin-top: 45px;
        font-size: 20px;
        font-weight: 600;
        color: #38bdf8;
        letter-spacing: 1px;
        text-shadow: 0 0 10px #38bdf8;
        animation: loader-textPulse 2s infinite;
        transition: opacity .4s;
      }

      @keyframes loader-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
      @keyframes loader-pulse { from { transform: scale(1); } to { transform: scale(1.3); } }
      @keyframes loader-eyeTrack { 0%,100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
      @keyframes loader-talk { 0%,100% { height: 6px; } 50% { height: 14px; } }
      @keyframes loader-armMove { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } }
      @keyframes loader-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes loader-shadowFloat { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 0.25; } }
      @keyframes loader-textPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
      @keyframes loader-scrollCode {
        0% { transform: translateY(15px); opacity: 0.3; }
        20%,80% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-10px); opacity: 0.5; }
      }
    `}</style>

      <div className="loader-root" role="alert" aria-live="assertive">
        <div className="halo"></div>

        <div className="robot">
          <div className="antenna"></div>

          <div className="head">
            <div className="eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
            <div className="mouth"></div>
          </div>

          <div className="body">
            <div className="arm left"></div>
            <div className="arm right"></div>

            <div className="laptop">
                <div className="code-block">
                <span className="syntax-key">function</span> <span className="syntax-func">analyzeCandidate</span>(data) {"{"}{"\n"}
                {"  "}<span className="syntax-key">let</span> score = <span className="syntax-str">0</span>;{"\n"}
                {"  "}<span className="syntax-key">for</span>(<span className="syntax-key">const</span> skill <span className="syntax-key">of</span> data.skills) {"{"}{"\n"}
                {"    "}score += <span className="syntax-func">evaluateSkill</span>(skill);{"\n"}
                {"  }"}{"\n"}
                {"  "}<span className="syntax-func">return</span> <span className="syntax-func">normalizeScore</span>(score);{"\n"}
                {"}"}{"\n"}
                {"\n"}
                <span className="syntax-key">async</span> <span className="syntax-func">startRecruitingAI</span>() {"{"}{"\n"}
                {"  "}<span className="syntax-func">loadModel</span>(<span className="syntax-str">'neural-net-v2'</span>);{"\n"}
                {"  "}<span className="syntax-func">await</span> <span className="syntax-func">analyzeDatabase</span>();{"\n"}
                {"  "}<span className="syntax-func">displayResults</span>();{"\n"}
                {"}"}{"\n"}
                </div>
            </div>
          </div>
        </div>

        <div className="shadow-under"></div>

        <div className="loading-text">
          {messages[msgIndex]}
        </div>
      </div>
    </>
  );
}
