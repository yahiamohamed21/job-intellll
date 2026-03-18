import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

/** مفاتيح الحفظ */
const LS_MODE_KEY = "dash_chart_mode";   // 'daily' | 'weekly' | 'monthly'
const LS_DAYS_KEY = "dash_chart_days";   // 30 | 60 | 90

/** توليد بيانات تجريبية */
function genDaily(n = 90) {
  const now = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const t = n - i; // مؤشر يوم متزايد
    const base = 62 + 22 * Math.sin(t / 5) + 14 * Math.cos(t / 7);
    const noise = (Math.sin(t * 1.7) + 1) * 6;
    const v = Math.max(5, Math.min(100, Math.round(base + noise)));
    out.push({
      date: d,
      label: d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" }),
      value: v,
    });
  }
  return out;
}

/** تجميع أسبوعي */
function toWeekly(data) {
  const out = [];
  for (let i = 0; i < data.length; i += 7) {
    const seg = data.slice(i, i + 7);
    const avg = Math.round(seg.reduce((a, b) => a + b.value, 0) / seg.length);
    out.push({ label: seg.at(-1).label, value: avg });
  }
  return out;
}

/** تجميع شهري */
function toMonthly(data) {
  const buckets = new Map();
  data.forEach((d) => {
    const k = `${d.date.getFullYear()}-${d.date.getMonth() + 1}`;
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(d.value);
  });
  const out = [];
  for (const [k, arr] of buckets.entries()) {
    const [y, m] = k.split("-");
    out.push({
      label: new Date(+y, +m - 1, 1).toLocaleDateString("ar-EG", {
        month: "short",
      }),
      value: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
    });
  }
  return out;
}

export default function TrendBarChart() {
  /** الحالة مع القراءة/الكتابة من localStorage */
  const [mode, setMode] = useState(() => {
    const v = localStorage.getItem(LS_MODE_KEY);
    return v === "weekly" || v === "monthly" ? v : "daily";
  });
  const [days, setDays] = useState(() => {
    const v = Number(localStorage.getItem(LS_DAYS_KEY) || "90");
    return v === 30 || v === 60 || v === 90 ? v : 90;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_MODE_KEY, mode);
      localStorage.setItem(LS_DAYS_KEY, String(days));
    } catch {}
  }, [mode, days]);

  /** البيانات حسب الفلترة */
  const daily = useMemo(() => genDaily(days), [days]);
  const data = useMemo(() => {
    if (mode === "weekly") return toWeekly(daily);
    if (mode === "monthly") return toMonthly(daily);
    return daily;
  }, [mode, daily]);

  /** ستايل التفعيل (للتبديل) */
  const activeStyle = (on) =>
    on
      ? {
          borderColor: "rgba(56,189,248,.35)",
          boxShadow: "0 0 0 2px rgba(56,189,248,.25) inset",
        }
      : undefined;

  return (
    <div>
      {/* أدوات الفلترة */}
      <div
        className="filters"
        style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}
      >
        <div className="sub" style={{ opacity: 0.8 }}>النطاق:</div>
        <button className="btn ghost" style={activeStyle(mode === "daily")} onClick={() => setMode("daily")}>
          يومي
        </button>
        <button className="btn ghost" style={activeStyle(mode === "weekly")} onClick={() => setMode("weekly")}>
          أسبوعي
        </button>
        <button className="btn ghost" style={activeStyle(mode === "monthly")} onClick={() => setMode("monthly")}>
          شهري
        </button>

        <div className="sub" style={{ marginInlineStart: 12, opacity: 0.8 }}>الفترة:</div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{
            height: 36,
            padding: "0 10px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text)",
          }}
          aria-label="تغيير عدد الأيام المعروضة"
        >
          <option value={30}>آخر 30 يومًا</option>
          <option value={60}>آخر 60 يومًا</option>
          <option value={90}>آخر 90 يومًا</option>
        </select>
      </div>

      {/* الرسم البياني */}
      <div
        className="rounded-2xl border p-4"
        style={{ borderColor: "var(--border)", background: "var(--card)", width: "100%", height: 260 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar
              dataKey="value"
              name="النتيجة"
              fill="hsl(217.2 91.2% 59.8%)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
