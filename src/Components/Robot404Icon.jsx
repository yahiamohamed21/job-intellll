import React from "react";
import { useTheme } from "../theme/ThemeProvider.jsx";

export default function Robot404Icon({ className = "" }) {
    const { theme } = useTheme();

    // الالوان
    const bodyColor = theme === "dark" ? "#e2e8f0" : "#f1f5f9";
    const shadowColor = theme === "dark" ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.1)";
    const glowColor = "#00f0ff";
    const zapColor = theme === "dark" ? "#0057c2ff" : "#ff7300ff"; // كهرباء بلون أصفر أو برتقالي

    return (
        <svg
            className={className}
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
        >
            <defs>
                {/* تدرج الألوان الخفيف لإعطاء لمسة الـ 3D الناعمة */}
                <linearGradient id="soft3D" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#dbeafe" />
                </linearGradient>

                <linearGradient id="bodyDark" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>

                {/* تأثير الظل للإضاءة */}
                <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                <filter id="zapGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="15" stdDeviation="10" floodColor={shadowColor} />
                </filter>

                <style>
                    {`
            @keyframes flicker {
              0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; filter: drop-shadow(0 0 8px ${glowColor}); }
              20%, 24%, 55% { opacity: 0.4; filter: none; }
            }
            .elec-text {
              animation: flicker 4s infinite;
            }
            
            @keyframes zapDash {
              0% { stroke-dashoffset: 150; opacity: 0; }
              10% { opacity: 1; }
              50% { opacity: 1; }
              90% { stroke-dashoffset: -150; opacity: 1; }
              100% { stroke-dashoffset: -150; opacity: 0; }
            }
            .elec-path {
              stroke-dasharray: 60;
              animation: zapDash 2.5s infinite linear;
            }
          `}
                </style>
            </defs>

            <g filter="url(#softShadow)">

                {/* Arms (Raised but lowered shoulder position) */}
                <rect x="25" y="130" width="33" height="85" rx="16.5" transform="rotate(-35 41.5 172.5)" fill="url(#soft3D)" />
                <rect x="182" y="130" width="33" height="85" rx="16.5" transform="rotate(35 198.5 172.5)" fill="url(#soft3D)" />

                {/* Main Body (Larger Belly - Taller) */}
                {/* العرض 90، والارتفاع زاد لـ 115، وتمت محاذاته للأسفل */}
                <rect x="75" y="120" width="90" height="115" rx="35" fill="url(#soft3D)" />

                {/* شاشة البطن اللي فيها كلمة Not Found */}
                <rect x="85" y="155" width="70" height="42" rx="12" fill="#0f172a" opacity="0.4" />

                {/* تفريغ شحنة كهربية بالبطن (Electro-cardiogram style line) */}
                <path
                    d="M 85 175 L 95 175 L 100 165 L 105 185 L 115 160 L 125 190 L 132 175 L 140 175 L 155 175"
                    stroke={zapColor}
                    strokeWidth="1.5"
                    fill="none"
                    className="elec-path"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#zapGlow)"
                />

                {/* كلمة NOT FOUND مشعة */}
                <text
                    x="120" y="181"
                    fontFamily="'Courier New', Courier, monospace"
                    fontSize="11"
                    fontWeight="900"
                    fill={glowColor}
                    textAnchor="middle"
                    className="elec-text"
                >
                    NOT FOUND
                </text>

                {/* Head Group */}
                <g transform="rotate(-4 120 90)">
                    {/* Antenna */}
                    <rect x="118" y="5" width="4" height="35" rx="2" fill="#94a3b8" />
                    <circle cx="120" cy="3" r="6" fill={glowColor} filter="url(#blueGlow)" />

                    {/* Head Box */}
                    <rect x="45" y="40" width="150" height="100" rx="28" fill="url(#soft3D)" />

                    <rect x="65" y="60" width="110" height="60" rx="14" fill="#0f172a" />

                    <g filter="url(#blueGlow)">
                        {/* Left Eye */}
                        <rect x="90" y="75" width="16" height="30" rx="8" stroke={glowColor} strokeWidth="4" fill="transparent" />
                        {/* Right Eye */}
                        <rect x="134" y="75" width="16" height="30" rx="8" stroke={glowColor} strokeWidth="4" fill="transparent" />
                    </g>
                </g>

                {/* Floating Hands (Lowered to bottom of body) */}
                <circle cx="26" cy="245" r="14" fill="url(#soft3D)" />
                <circle cx="236" cy="245" r="14" fill="url(#soft3D)" />

            </g>
        </svg>
    );
}
