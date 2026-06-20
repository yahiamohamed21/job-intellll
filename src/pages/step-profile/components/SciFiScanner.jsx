import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SciFiScanner = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language?.startsWith('ar');

    const [progress, setProgress] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);

    // Derive the statuses array from translations so it reacts to language changes
    const statuses = t('step0.sciFiScanner.statuses', { returnObjects: true });
    const statusesLength = Array.isArray(statuses) ? statuses.length : 7;

    useEffect(() => {
        // Lock body scroll while loader is active
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        // Asymptotic curve: fast at first, crawls toward 99%
        // Syncs with real Gemini API processing time (~20-25 seconds to 99%)
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 99) return 99;

                const remaining = 99 - prev;
                const step = remaining * (Math.random() * 0.08 + 0.02);
                const newProgress = Math.min(prev + step, 99);

                const newStatusIndex = Math.min(
                    Math.floor((newProgress / 100) * statusesLength),
                    statusesLength - 1
                );

                setStatusIndex(newStatusIndex);
                return newProgress;
            });
        }, 300);

        return () => {
            clearInterval(interval);
            document.body.style.overflow = originalStyle;
        };
    }, [statusesLength]);

    const currentStatus = Array.isArray(statuses)
        ? statuses[statusIndex] ?? statuses[0]
        : '';

    return (
        <div
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center overflow-hidden dark:bg-[#0b1326]/95"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Dot-grid background */}
            <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            <section className="relative z-10 w-full flex flex-col items-center justify-center p-4 sm:p-8 transform scale-[0.75] sm:scale-[0.85] xl:scale-[0.95] origin-center transition-transform duration-500">

                {/* ── Central Visual ── */}
                <div className="relative w-full max-w-4xl flex items-center justify-center">

                    {/* Rotating rings */}
                    <div className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] border border-white/10 rounded-full animate-[spin_30s_linear_infinite]" />
                    <div className="absolute w-[220px] h-[220px] sm:w-[350px] sm:h-[350px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite_reverse]" />

                    {/* Hero image */}
                    <div className="relative z-10 floating">
                        <div className="w-56 h-56 sm:w-96 sm:h-96 relative group">
                            <div className="absolute -inset-2 sm:-inset-4 border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)]" />
                            <img
                                alt={t('step0.sciFiScanner.title')}
                                className="w-full h-full object-contain mix-blend-screen brightness-125 hologram-flicker drop-shadow-2xl"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfnRZX86qfxYFPf6sCFxAkQTA-0gbd7A4oj-_rt6Rj4Lu2IEb0Fm2BG_2LIKUR-PKsPn7ixnbyP4ZFQOBPgpRFVZ2m2R4gqCppwK-wRpklm1FUf08jPEAf_tdYtiYSEDxo4YoYOhQaeAecHTdbPyYf0dQMBToo9V8r-5_RbcdyWZMluMqCztwaAgGZWRPRcJhy2HptJaRsf5twJhXCiGs9BSbCpOOp_xtG-KqVmHmFUDG-r60INuRzyNzhIAAZWU3KzwmzELg7J4I"
                            />
                        </div>
                    </div>

                    {/* ── Data Card: Detected Skills (top-start) ── */}
                    <div
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className={`
                            hidden sm:block absolute -top-8
                            ${isRTL ? '-right-8' : '-left-8'}
                            glass-card border border-white/10 bg-[#0F172A]/80 backdrop-blur-xl
                            p-4 rounded-xl w-60
                            transform ${isRTL ? 'rotate-3' : '-rotate-3'} hover:rotate-0
                            transition-transform duration-500 shadow-2xl
                        `}
                    >
                        {/* Header: icon + label — order and alignment follow dir automatically */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-[#FF7A00] text-sm">hub</span>
                            <span className="font-label-caps text-[10px] text-[#FF7A00]">
                                {t('step0.sciFiScanner.cards.detectedSkills')}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {[
                                { key: 'cloudArchitecture', pct: '98%', color: '#22c55e' },
                                { key: 'machineLearning',   pct: '92%', color: '#22c55e' },
                                { key: 'kubernetes',        pct: '85%', color: '#FF7A00' },
                            ].map(({ key, pct, color }) => (
                                <div
                                    key={key}
                                    className="flex justify-between items-center bg-[#1E293B]/60 border border-white/5 p-2 rounded-lg"
                                >
                                    <span className="font-data-mono text-[12px] text-white">
                                        {t(`step0.sciFiScanner.cards.${key}`)}
                                    </span>
                                    <span className="font-bold text-[10px]" style={{ color }}>{pct}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Data Card: Market Demand (bottom-end) ── */}
                    <div
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className={`
                            hidden md:block absolute -bottom-4
                            ${isRTL ? '-left-12' : '-right-12'}
                            glass-card border border-white/10 bg-[#0F172A]/80 backdrop-blur-xl
                            p-4 rounded-xl w-64
                            transform ${isRTL ? '-rotate-2' : 'rotate-2'} hover:rotate-0
                            transition-transform duration-500 shadow-2xl
                        `}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#2786F8] text-sm">public</span>
                            <span className="font-label-caps text-[10px] text-[#2786F8] uppercase">
                                {t('step0.sciFiScanner.cards.marketDemandIndex')}
                            </span>
                        </div>
                        {/* In RTL: bars appear on the right, text block on the left — reversed via dir */}
                        <div className="flex items-end gap-3 mb-2">
                            <div className="flex items-end gap-2 shrink-0">
                                <div className="w-2 h-10 bg-[#2786F8]/20 rounded-full overflow-hidden relative">
                                    <div className="absolute bottom-0 left-0 w-full bg-[#2786F8] h-[70%]" />
                                </div>
                                <div className="w-2 h-14 bg-[#2786F8]/20 rounded-full overflow-hidden relative">
                                    <div className="absolute bottom-0 left-0 w-full bg-[#2786F8] h-[90%]" />
                                </div>
                                <div className="w-2 h-12 bg-[#FF7A00]/20 rounded-full overflow-hidden relative">
                                    <div className="absolute bottom-0 left-0 w-full bg-[#FF7A00] h-[85%] shadow-[0_0_10px_rgba(255,122,0,0.5)]" />
                                </div>
                            </div>
                            <div className="ms-auto text-start">
                                <div className="font-display-lg text-[32px] text-[#FF7A00] leading-tight">
                                    {t('step0.sciFiScanner.cards.topPercent')}
                                </div>
                                <div className="font-label-caps text-[10px] text-gray-400">
                                    {t('step0.sciFiScanner.cards.globalTalentTier')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Data Card: ATS Optimization (middle-start) ── */}
                    <div
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className={`
                            hidden lg:block absolute top-1/2 -translate-y-1/2
                            ${isRTL ? '-right-28' : '-left-28'}
                            glass-card border border-[#FF7A00]/30 bg-[#0F172A]/80 backdrop-blur-xl
                            shadow-[0_0_20px_rgba(255,122,0,0.05)] p-4 rounded-xl w-52
                        `}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[#FF7A00] text-sm">search</span>
                            <span className="font-label-caps text-[10px] text-[#FF7A00] uppercase">
                                {t('step0.sciFiScanner.cards.atsOptimization')}
                            </span>
                        </div>
                        {/* Each bullet row: symbol on the inline-start side, text after it */}
                        <div className="font-data-mono text-[11px] text-gray-300 leading-relaxed space-y-1">
                            <div className="flex items-start gap-1">
                                <span className="text-[#22c55e] shrink-0 mt-px">✓</span>
                                <span>{t('step0.sciFiScanner.cards.keywordDensity')}</span>
                            </div>
                            <div className="flex items-start gap-1">
                                <span className="text-[#22c55e] shrink-0 mt-px">✓</span>
                                <span>{t('step0.sciFiScanner.cards.structureParsable')}</span>
                            </div>
                            <div className="flex items-start gap-1">
                                <span className="text-[#FF7A00] shrink-0 mt-px">!</span>
                                <span>{t('step0.sciFiScanner.cards.missingLeadExp')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bottom Status Panel ── */}
                <div className="mt-6 sm:mt-12 w-full max-w-2xl text-center relative z-20">

                    {/* Headline */}
                    <h2 className="font-headline-lg text-xl sm:text-3xl font-bold text-white mb-2 tracking-wide px-4">
                        {t('step0.sciFiScanner.title')}
                    </h2>

                    {/* Status row */}
                    <div className="flex items-center justify-between font-label-caps text-[12px] text-on-surface-variant mb-4 px-2">
                        <span dir={isRTL ? 'rtl' : 'ltr'}>{currentStatus}</span>
                        <span dir="ltr" className="text-tertiary tabular-nums">{Math.floor(progress)}%</span>
                    </div>

                    {/* Progress bar — fills ltr in both modes (standard progress convention) */}
                    <div className="h-3 w-full bg-[#1E293B] rounded-full p-0.5 overflow-hidden relative shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FFA042] rounded-full transition-all duration-75 ease-linear relative data-pulse shadow-[0_0_15px_rgba(255,122,0,0.6)]"
                            style={{
                                width: `${progress}%`,
                                // In RTL, anchor the bar to the right so it fills right-to-left
                                ...(isRTL ? { marginLeft: 'auto' } : {}),
                            }}
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse" />
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-8 grid gap-2 sm:gap-4 grid-cols-3">
                        {[
                            { icon: 'speed',    color: '#FF7A00', labelKey: 'scanSpeed',   value: '4.8 GB/s' },
                            { icon: 'lock',     color: '#2786F8', labelKey: 'encryption',  value: 'AES-256'  },
                            { icon: 'security', color: '#22c55e', labelKey: 'privacy',     value: null       },
                        ].map(({ icon, color, labelKey, value }) => (
                            <div
                                key={labelKey}
                                dir={isRTL ? 'rtl' : 'ltr'}
                                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 glass-card border border-white/5 bg-[#0F172A]/80 py-2 px-2 sm:py-3 sm:px-4 rounded-lg justify-center sm:justify-start"
                            >
                                <span
                                    className="material-symbols-outlined text-base sm:text-lg"
                                    style={{ color, fontVariationSettings: "'FILL' 1" }}
                                >
                                    {icon}
                                </span>
                                <div className="text-center sm:text-start">
                                    <div className="font-label-caps text-[8px] sm:text-[10px] text-gray-400 whitespace-nowrap">
                                        {t(`step0.sciFiScanner.stats.${labelKey}`)}
                                    </div>
                                    <div className="font-data-mono text-[9px] sm:text-[12px] text-white font-bold whitespace-nowrap">
                                        {/* privacyValue is translatable; technical values (AES-256, GB/s) are constants */}
                                        {value ?? t('step0.sciFiScanner.stats.privacyValue')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SciFiScanner;
