// src/Components/ElectricBorder.jsx
import React from "react";

export default function ElectricBorder({
    children,
    color = "#7c3aed", // Default matching the dark mode primary tone
    speed = 1,
    chaos = 0.12,
    thickness = 2,
    className = "",
    style = {},
}) {
    return (
        <div
            className={`relative overflow-hidden flex ${className}`}
            style={{
                ...style,
                padding: thickness,
                // The background color of the outer ring acts as a base placeholder
                // though the conic gradient will spin over it.
            }}
        >
            {/* Spinning glow element */}
            <div
                className="absolute inset-[-150%] z-0"
                style={{
                    background: `conic-gradient(from 0deg, transparent 70%, ${color} 100%)`,
                    animation: `electric-spin ${2.5 / speed}s linear infinite`,
                }}
            />
            <div
                className="absolute inset-[-150%] z-0"
                style={{
                    background: `conic-gradient(from 180deg, transparent 70%, ${color} 100%)`,
                    animation: `electric-spin ${2.5 / speed}s linear infinite`,
                }}
            />

            {/* Jitter / Chaos overlay representing the 'chaos' prop */}
            <div
                className="absolute inset-0 z-0 mix-blend-overlay pointer-events-none opacity-50"
                style={{
                    animation: `electric-pulse ${0.5 / chaos}s ease-in-out infinite alternate`,
                    boxShadow: `inset 0 0 ${thickness * 4}px ${color}`
                }}
            />

            {/* The inner content container, hiding the gradient center */}
            <div
                className="relative z-10 w-full h-full bg-white dark:bg-[#1e293b]"
                style={{
                    // Inherit the curve inside but reduced by the thickness so the border stays uniform
                    borderRadius: style.borderRadius ? `calc(${Number(style.borderRadius)}px - ${thickness}px)` : 'inherit',
                }}
            >
                {children}
            </div>

            <style>{`
        @keyframes electric-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes electric-pulse {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
      `}</style>
        </div>
    );
}
