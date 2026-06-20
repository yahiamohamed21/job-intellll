// src/pages/employee/VideoInterview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { alertError, toastInfo, toastSuccess, confirmAction } from "../../lib/alerts.js";
import Swal from "sweetalert2";

const DEFAULT_QUESTIONS = [
  { id: 1, text: "قدّم نفسك بإيجاز وما هي أقوى نقاطك؟" },
  { id: 2, text: "احكي عن موقف صعب واجهته وكيف تعاملت معه." },
  { id: 3, text: "لو اختلفت مع زميل، كيف تدير الخلاف؟" },
  { id: 4, text: "ما خطتك للتعلّم وتطوير نفسك خلال 6 أشهر؟" },
];

const QUESTION_DURATION = 120;

// === سياسة إعادة التسجيل ===
// false: بدون إعادة
// "once": إعادة واحدة لكل سؤال قبل التسليم النهائي
const ALLOW_RETAKE = "once";

// مفاتيح التخزين
const LS_LOCK_KEY = "vi_locked";
const LS_RESULTS_KEY = "vi_results";

export default function VideoInterview(){
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const [questions] = useState(DEFAULT_QUESTIONS);
  const [idx, setIdx] = useState(0);
  const activeQuestion = useMemo(()=>questions[idx], [questions, idx]);

  const [secondsLeft, setSecondsLeft] = useState(QUESTION_DURATION);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // results: [{questionId, url, blob, mockScore, retakeCount}]
  const [results, setResults] = useState([]);
  const [locked, setLocked] = useState(() => {
    try { return localStorage.getItem(LS_LOCK_KEY) === "1"; } catch { return false; }
  });

  // حمّل نتائج قديمة (اختياري)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_RESULTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setResults(parsed.map(r => ({ ...r, url: r.url || (r.blob ? URL.createObjectURL(dataURItoBlob(r.blob)) : undefined) })));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // حفظ النتائج (بدون الـBlob URL، نحول لبيانات قابلة للتخزين)
  useEffect(() => {
    try {
      const safe = results.map(r => ({
        questionId: r.questionId,
        mockScore: r.mockScore,
        retakeCount: r.retakeCount || 0,
        // نخلي الـblob اختياري/بسيط: هنسيبه فاضي لتجنب تضخيم التخزين
        // لو عايز تحفظ فعليًا ممكن تستخدم IndexedDB
      }));
      localStorage.setItem(LS_RESULTS_KEY, JSON.stringify(safe));
    } catch {}
  }, [results]);

  // ====== كاميرا ومايك ======
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: { ideal:1280 }, height: { ideal:720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(()=>{});
      }
    } catch (err) {
      alertError("لا يمكن الوصول للكاميرا/المايك", "اعطِ إذن الكاميرا والمايك أو استخدم https/localhost");
      throw err;
    }
  };

  const startRecording = () => {
    const stream = mediaStreamRef.current;
    if (!stream) return alertError("لا يوجد كاميرا/مايك", "ابدأ تشغيل الكاميرا أولاً.");

    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);

      const used = QUESTION_DURATION - secondsLeft;
      const ratio = Math.max(0.3, Math.min(1, used / QUESTION_DURATION));
      const mockScore = Math.round(60 + ratio * 40);

      setResults(prev => {
        // هل فيه نتيجة قديمة لنفس السؤال؟
        const i = prev.findIndex(p => p.questionId === activeQuestion.id);
        if (i === -1) {
          return [...prev, { questionId: activeQuestion.id, url, blob, mockScore, retakeCount: 0 }];
        } else {
          // لو مسموح إعادة مرة واحدة
          if (ALLOW_RETAKE === "once" && (prev[i].retakeCount || 0) < 1) {
            const next = [...prev];
            // حرّر الـURL القديم
            try { URL.revokeObjectURL(next[i].url); } catch {}
            next[i] = { ...next[i], url, blob, mockScore, retakeCount: (next[i].retakeCount || 0) + 1 };
            return next;
          }
          // غير مسموح — احتفظ بالأول
          // (لو عايز تستبدل دائمًا، احذف هذا الشرط)
          toastInfo("تم تجاهل التسجيل الجديد لأن إعادة التسجيل غير مسموح بها.");
          try { URL.revokeObjectURL(url); } catch {}
          return prev;
        }
      });
    };

    mr.start(200);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // ====== التحكم في المقابلة ======
  const onStartInterview = async () => {
    if (locked) {
      alertError("المقابلة مُقفلة", "لقد تم تسليم المقابلة مسبقًا — لا يمكن البدء من جديد.");
      return;
    }
    try {
      await startStream();
      setInterviewStarted(true);
      toastInfo("بدأنا المقابلة — بالتوفيق ✨");
      setIdx(0);
      setSecondsLeft(QUESTION_DURATION);
      setTimeout(startRecording, 250);
      startTimer();
    } catch {}
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          onNextQuestion(true);
          return QUESTION_DURATION;
        }
        return s - 1;
      });
    }, 1000);
  };

  const onNextQuestion = (auto = false) => {
    if (!auto && isRecording) stopRecording();
    const nextIdx = idx + 1;
    if (nextIdx >= questions.length) {
      toastSuccess("تم إنهاء المقابلة 🎉 — يمكنك مراجعة التسجيلات ثم التسليم");
      setInterviewStarted(false);
      setIsRecording(false);
      setSecondsLeft(QUESTION_DURATION);
      return;
    }
    setIdx(nextIdx);
    setSecondsLeft(QUESTION_DURATION);
    setTimeout(() => {
      startRecording();
      startTimer();
    }, 200);
  };

  const onCancelInterview = async () => {
    const ok = await confirmAction("إلغاء المقابلة؟","سيتم فقدان التسجيل الحالي","إلغاء المقابلة","عودة");
    if (!ok) return;
    clearInterval(timerRef.current);
    stopRecording();
    stopStream();
    setInterviewStarted(false);
    setIsRecording(false);
    setSecondsLeft(QUESTION_DURATION);
    toastInfo("تم الإلغاء");
  };

  const onSubmitInterview = async () => {
  // كم فيديو متسجل فعلاً؟
      const recordedCount = results.filter(r => !!r.url).length;

      if (recordedCount < 3) {
        return alertError(
          "لا يمكن التسليم",
          "يجب عليك أولاً تسجيل على الأقل ثلاث إجابات فيديو قبل تسليم المقابلة."
        );
      }

      if (recordedCount < questions.length) {
        return alertError(
          "لا يمكن التسليم",
          `أجب على جميع الأسئلة (${questions.length}) أو عدّل القواعد لعدد أدنى مختلف.`
        );
      }

      const ok = await confirmAction(
        "تأكيد تسليم المقابلة؟",
        "لن تتمكن من إعادة التسجيل بعد التسليم",
        "تسليم",
        "عودة"
      );
      if (!ok) return;

      clearInterval(timerRef.current);
      stopRecording();
      stopStream();
      setInterviewStarted(false);
      setIsRecording(false);

      setLocked(true);
      try { localStorage.setItem(LS_LOCK_KEY, "1"); } catch {}
      toastSuccess("تم تسليم المقابلة وتم قفلها.");
    };


    const stopStream = () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      stopRecording();
      stopStream();
      results.forEach(r => {
        try { URL.revokeObjectURL(r.url); } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmt = (n) => {
    const m = String(Math.floor(n / 60)).padStart(2, "0");
    const s = String(n % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const canRetake = (qid) => {
    if (locked) return false;
    if (ALLOW_RETAKE === false) return false;
    const r = results.find(x => x.questionId === qid);
    return r && (r.retakeCount || 0) < 1; // مرة واحدة فقط
  };

  const retakeQuestion = async (qid) => {
    if (!canRetake(qid)) {
      return alertError("غير مسموح بإعادة التسجيل", "لقد استخدمت إعادة التسجيل لهذا السؤال بالفعل.");
    }
    const ok = await confirmAction("إعادة تسجيل؟","سيتم استبدال تسجيل هذا السؤال","إعادة","إلغاء");
    if (!ok) return;

    // لو المقابلة مش شغالة حاليًا، شغل ستريم مؤقت
    if (!interviewStarted) {
      await startStream().catch(() => {});
    }
    // بدّل المؤشر على السؤال المراد إعادة تسجيله
    const newIdx = questions.findIndex(q => q.id === qid);
    if (newIdx === -1) return;
    setIdx(newIdx);
    setSecondsLeft(QUESTION_DURATION);

    // ابدأ تسجيل جديد لهذا السؤال
    setInterviewStarted(true);
    setTimeout(() => {
      startRecording();
      startTimer();
    }, 200);
  };

  const allAnswered = results.filter(r => !!r.url).length >= questions.length;

  return (
    <>
      <section className="card" aria-labelledby="intrv-title">
        <h3 id="intrv-title" style={{ display:"flex", alignItems:"center", gap:8 }}>
          مقابلة الفيديو (أسئلة: {questions.length} • {QUESTION_DURATION/60} دقيقة لكل سؤال)
          {locked && <span className="chip" style={{marginInlineStart:8}}>مقفلة</span>}
        </h3>
        <p className="sub">سجّل إجابتك لكل سؤال قبل انتهاء الوقت. يمكنك (اختياريًا) إعادة تسجيل سؤال واحد مرة واحدة قبل التسليم.</p>

        <div className="legacy-grid" style={{ marginTop: 12 }}>
          <div className="col">
            <article className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ position: "relative", background: "black" }}>
                <video ref={videoRef} playsInline muted style={{ width:"100%", aspectRatio:"16/9", background:"#000" }} />
                {interviewStarted && (
                  <div style={{ position:"absolute", top:10, insetInlineStart:10, display:"flex", alignItems:"center", gap:10, background:"rgba(17,24,39,.55)", padding:"8px 12px", borderRadius:12, color:"#fff" }}>
                    <span style={{ width:10, height:10, borderRadius:"50%", background: isRecording ? "#ef4444" : "#64748b", boxShadow: isRecording ? "0 0 0 6px rgba(239,68,68,.25)" : "none" }} />
                    <span>{isRecording ? "Recording..." : "Paused"}</span>
                  </div>
                )}
                {interviewStarted && (
                  <div style={{ position:"absolute", top:10, insetInlineEnd:10, background:"rgba(17,24,39,.55)", padding:"8px 12px", borderRadius:12, color:"#fff", fontWeight:700 }}>
                    الوقت المتبقي: {fmt(secondsLeft)}
                  </div>
                )}
              </div>

              <div style={{ padding: 14 }}>
                {!interviewStarted ? (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button className="btn" onClick={onStartInterview} disabled={locked}>ابدأ المقابلة</button>
                    <button className="btn ghost" onClick={() => toastInfo("سيتم دعم تخصيص الأسئلة قريبًا")}>معاينة الأسئلة</button>
                    <button className="btn" onClick={onSubmitInterview} disabled={!allAnswered || locked}>تسليم المقابلة</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button className="btn" onClick={() => onNextQuestion(false)}>السؤال التالي</button>
                    <button className="btn ghost" onClick={onCancelInterview}>إلغاء</button>
                  </div>
                )}
              </div>
            </article>
          </div>

          <div className="col">
            <article className="card">
              <h4 style={{ marginTop: 0 }}>السؤال الحالي</h4>
              <div className="sub" style={{ marginBottom: 6 }}>#{idx + 1} من {questions.length}</div>
              <p style={{ fontSize: 16, lineHeight: 1.7 }}>{activeQuestion?.text}</p>
              <div className="progress" style={{ marginTop: 10 }}>
                <span style={{ "--val": ((QUESTION_DURATION - secondsLeft) / QUESTION_DURATION) * 100 }} />
              </div>
            </article>

{/* الفيديوهات اللي اتسجلت  */}
            <article className="card">
              <h4 style={{ marginTop: 0 }}>إجاباتك المسجلة</h4>
              {results.length === 0 ? (
                <div className="sub">لم تُسجّل أي إجابات بعد.</div>
              ) : (
                <div style={{ display:"grid", gap: 30 }}>
                  {results.map((r, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:40 }}>
                        <video
                          src={r.url}
                          controls
                          muted={false}
                          style={{ width: 250, borderRadius: 10 }}
                        />
                        <div>
                          <div><strong>السؤال #{r.questionId}</strong></div>
                          {"mockScore" in r
                            ? <div className="sub">تقييم أولي: {r.mockScore}/100</div>
                            : <div className="sub">—</div>
                          }
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <a className="btn ghost" href={r.url} download={`answer_q${r.questionId}.webm`}>تحميل</a>
                        {/* لو لسه قبل التسليم ومسموح ريتِيك مرة: */}
                        {(!locked && ALLOW_RETAKE === "once" && (r.retakeCount || 0) < 1) && (
                          <button className="btn secondary" onClick={() => retakeQuestion(r.questionId)}>
                            إعادة التسجيل
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>


          </div>
        </div>
      </section>

      <p className="sub" style={{ marginTop: 36, textAlign: "center" }}>
        2025 Job Intel — Video Interview Module
      </p>
    </>
  );
}

function getSupportedMimeType() {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4"
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported?.(t)) return t;
  }
  return "";
}

// (اختياري) لو حبيت تحفظ فيديوهات فعليًا في LocalStorage (بصيغة base64) وتسترجعها:
function dataURItoBlob(dataURI){
  try {
    const byteString = atob((dataURI.split(",")[1]) || "");
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mimeString || "video/webm" });
  } catch { return new Blob(); }
}
