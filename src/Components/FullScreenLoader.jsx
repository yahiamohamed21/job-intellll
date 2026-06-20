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
