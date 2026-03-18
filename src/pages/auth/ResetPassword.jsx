// src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../api/authService";
import { extractError } from "../../utils/extractError";
import { toastSuccess } from "../../lib/alerts";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const nav = useNavigate();

    const [isTokenValid, setIsTokenValid] = useState(false);
    const [validating, setValidating] = useState(true);

    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setErr("No reset token found in URL.");
            setValidating(false);
            return;
        }

        authService.validateResetToken(token)
            .then(() => setIsTokenValid(true))
            .catch(() => setErr("This reset link is invalid or expired. Please request a new one."))
            .finally(() => setValidating(false));
    }, [token]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        if (newPassword !== confirmNewPassword) {
            setErr("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, newPassword, confirmNewPassword);
            toastSuccess("Password reset successfully. You can now login with your new password.");
            setTimeout(() => nav("/login"), 2000);
        } catch (ex) {
            setErr(extractError(ex));
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { height: 44, padding: "0 14px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", width: "100%" };
    const cardStyle = { width: 480, maxWidth: "92vw", margin: "40px auto", padding: "24px", borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)" };

    if (validating) {
        return (
            <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "grid", placeItems: "center" }}>
                <div style={{ color: "var(--text)" }}>Validating reset token...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "grid", placeItems: "center" }}>
            <section style={cardStyle}>
                <h2 style={{ margin: "0 0 18px", color: "#1e3a8a", fontWeight: 800 }}>Reset Password</h2>

                {err ? (
                    <div style={{ textAlign: "center" }}>
                        <div className="sub" style={{ color: "tomato", padding: "12px", background: "rgba(255,99,71,0.1)", borderRadius: "8px", marginBottom: 20 }}>
                            {err}
                        </div>
                        <Link to="/forgot-password" style={{ color: "#f97316", fontWeight: 700 }}>Request a new reset link</Link>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
                        <div>
                            <label className="sub" style={{ marginBottom: 4, display: "block" }}>New Password</label>
                            <input
                                type="password"
                                style={inputStyle}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                            <small style={{ color: "var(--text)", opacity: 0.7, marginTop: "4px", display: "inline-block" }}>8+ chars, 1 uppercase, 1 lowercase, 1 digit</small>
                        </div>

                        <div>
                            <label className="sub" style={{ marginBottom: 4, display: "block" }}>Confirm New Password</label>
                            <input
                                type="password"
                                style={inputStyle}
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                                placeholder="••••••••"
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
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}
            </section>
        </div>
    );
}
