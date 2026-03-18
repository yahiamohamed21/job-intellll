import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { authService } from "../../api/authService";
import { extractError } from "../../utils/extractError";
import { toastSuccess } from "../../lib/alerts";

export default function VerifyEmail() {
    const loc = useLocation();
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // get email from navigation state if available
        if (loc.state?.email) {
            setEmail(loc.state.email);
        }
    }, [loc.state]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setMsg("");
        setLoading(true);

        try {
            await authService.verifyEmail(email, code);
            toastSuccess("Email verified successfully! Please log in.");
            setTimeout(() => nav("/login"), 2000);
        } catch (ex) {
            setErr(extractError(ex));
        } finally {
            setLoading(false);
        }
    };

    const onResend = async () => {
        if (!email) {
            setErr("Please enter your email address first to resend code.");
            return;
        }

        setErr("");
        setMsg("");
        try {
            await authService.resendVerification(email);
            setMsg("Verification code sent successfully. Please check your email.");
        } catch (ex) {
            setErr(extractError(ex));
        }
    };

    const inputStyle = { height: 44, padding: "0 14px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", width: "100%" };
    const cardStyle = { width: 480, maxWidth: "92vw", margin: "40px auto", padding: "24px", borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)", textAlign: "center" };

    return (
        <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "grid", placeItems: "center" }}>
            <section style={cardStyle}>
                <h2 style={{ margin: "0 0 18px", color: "#1e3a8a", fontWeight: 800 }}>Verify Email</h2>
                <p className="sub" style={{ marginBottom: 20 }}>Enter the 6-digit verification code sent to your email.</p>

                {err && <div className="sub" style={{ color: "tomato", marginBottom: 16 }}>{err}</div>}
                {msg && <div className="sub" style={{ color: "#10b981", marginBottom: 16 }}>{msg}</div>}

                <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, textAlign: "left" }}>
                    <div>
                        <label className="sub">Email Address</label>
                        <input
                            type="email"
                            style={inputStyle}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="sub">Verification Code</label>
                        <input
                            style={inputStyle}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            height: 46,
                            borderRadius: 999,
                            border: "1px solid rgba(251,146,60,.6)",
                            background: "linear-gradient(180deg, rgba(251,146,60,1), rgba(251,146,60,.85))",
                            color: "#fff",
                            fontWeight: 800,
                            marginTop: 10,
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Verifying..." : "Verify Code"}
                    </button>
                </form>

                <div className="sub" style={{ marginTop: 20 }}>
                    Didn't receive the code?{" "}
                    <button
                        type="button"
                        onClick={onResend}
                        style={{ background: "none", border: "none", color: "#f97316", fontWeight: 700, cursor: "pointer" }}
                    >
                        Resend it
                    </button>
                </div>

                <div className="sub" style={{ marginTop: 10 }}>
                    <Link to="/login" style={{ color: "var(--text)", textDecoration: "underline" }}>Back to login</Link>
                </div>
            </section>
        </div>
    );
}
