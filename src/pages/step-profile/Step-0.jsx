import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSetupLayout from '../../Components/ProfileSetupLayout.jsx';
import wizardService from '../../api/wizardService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toastSuccess, alertError } from '../../lib/alerts.js';
import { extractError } from '../../utils/extractError.js';
import SciFiScanner from './components/SciFiScanner';
import { useTranslation } from 'react-i18next';

const Step0 = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [existingResume, setExistingResume] = useState(null);
    const [extractedData, setExtractedData] = useState(() => {
        // Recover extractedData from sessionStorage on mount (survives page refresh)
        try {
            const stored = sessionStorage.getItem('step0_extractedData');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [parseFailed, setParseFailed] = useState(false);
    const [isLoadingResume, setIsLoadingResume] = useState(true);
    const resumeInputRef = useRef(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        const fetchExistingResume = async () => {
            try {
                const res = await wizardService.getResume();
                if (res.data?.success && res.data?.resume) {
                    setExistingResume(res.data.resume);
                } else if (res.data?.fileName || res.data?.filename) {
                    setExistingResume(res.data);
                }
            } catch (ex) {
                console.error('Failed to fetch existing resume:', ex);
            } finally {
                setIsLoadingResume(false);
            }
        };
        fetchExistingResume();
    }, []);

    const handleDeleteResume = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        try {
            await wizardService.deleteResume();
            setExistingResume(null);
            setExtractedData(null);
            setParseFailed(false);
            try { sessionStorage.removeItem('step0_extractedData'); } catch { /* non-fatal */ }
            toastSuccess(t('step0.alerts.resumeRemoved'));
        } catch (error) {
            alertError(t('step0.alerts.removeFailed'), extractError(error));
        }
    };

    const handleResumeChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setParseFailed(false);

        try {
            // Step 1: Upload the file. After the backend refactor, this
            // endpoint is STRICT FILE UPLOAD ONLY — it does NOT trigger AI
            // parsing and does NOT return `extractedData`. It only stores the
            // document and returns metadata with ParseStatus = "Pending".
            // Ensure minimum animation time of 3 seconds for the scanner UI.
            const [uploadRes] = await Promise.all([
                wizardService.uploadResume(file),
                new Promise(resolve => setTimeout(resolve, 3000))
            ]);

            // Step 2: Trigger AI extraction explicitly. This is a separate
            // endpoint (POST /api/jobseeker/resume/parse) and is the only
            // place that returns `extractedData`. Step-1 reads that data
            // from sessionStorage or navigation state to hydrate the form fields.
            let extracted = null;
            let failed = false;
            try {
                const parseRes = await wizardService.parseResume();
                extracted = parseRes.data?.extractedData || parseRes.extractedData;
                const parseStatus =
                    parseRes.data?.resume?.parseStatus || parseRes.resume?.parseStatus;
                if (parseStatus === 'Failed' || !extracted) {
                    failed = true;
                }
            } catch (parseErr) {
                // AI extraction failed (file unreadable, AI busy, etc.).
                // We still let the user proceed — the form just stays empty.
                console.error('CV parsing failed:', parseErr);
                failed = true;
            }

            if (failed) {
                alertError(t('step0.alerts.aiBusy'), t('step0.alerts.aiBusyMsg'));
            } else {
                toastSuccess(t('step0.alerts.uploadSuccess'));
            }

            if (isMounted.current) {
                setParseFailed(failed);
                setExtractedData(extracted);

                // Persist extractedData in sessionStorage so it survives page refresh
                if (extracted) {
                    try {
                        sessionStorage.setItem('step0_extractedData', JSON.stringify(extracted));
                    } catch { /* quota exceeded or private browsing — non-fatal */ }
                }

                // Set the existingResume so the UI updates to the "Uploaded" state
                setExistingResume({ fileName: file.name, ...uploadRes.data });
                setIsUploading(false);
            }

        } catch (ex) {
            alertError(t('step0.alerts.uploadFailed'), extractError(ex));
            if (isMounted.current) setIsUploading(false); // Only reset on failure
        } finally {
            if (isMounted.current && resumeInputRef.current) {
                resumeInputRef.current.value = '';
            }
        }
    };

    // Retry parse without re-uploading — calls the parse endpoint directly
    const handleRetryParse = async () => {
        setIsUploading(true);
        setParseFailed(false);
        try {
            const parseRes = await wizardService.parseResume();
            const extracted = parseRes.data?.extractedData || parseRes.extractedData;
            const parseStatus =
                parseRes.data?.resume?.parseStatus || parseRes.resume?.parseStatus;

            if (parseStatus === 'Failed' || !extracted) {
                setParseFailed(true);
                alertError(t('step0.alerts.aiBusy'), t('step0.alerts.aiBusyMsg'));
                return;
            }

            setExtractedData(extracted);
            try {
                sessionStorage.setItem('step0_extractedData', JSON.stringify(extracted));
            } catch { /* non-fatal */ }
            toastSuccess(t('step0.alerts.uploadSuccess'));
        } catch (parseErr) {
            console.error('CV re-parse failed:', parseErr);
            setParseFailed(true);
            alertError(t('step0.alerts.aiBusy'), t('step0.alerts.aiBusyMsg'));
        } finally {
            if (isMounted.current) setIsUploading(false);
        }
    };

    return (
        <ProfileSetupLayout currentStep={0}>
            <div className="space-y-6">
                <div className="mb-6 sm:mb-8 text-start pt-2 sm:pt-4 w-full max-w-5xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">{t('step0.fastTrackTitle')}</h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                        {t('step0.fastTrackDesc')}
                    </p>
                </div>

                <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
                    <div className="w-full relative group cursor-pointer min-w-0">
                        <div className={`relative bg-transparent dark:bg-[#0d1117]/20 border-2 ${existingResume || isLoadingResume ? 'border-solid border-slate-200 dark:border-slate-700/60 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600/80' : 'border-dashed border-slate-300 dark:border-slate-700/80 rounded-[2rem] hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]'} p-5 sm:p-8 flex flex-col items-center justify-center min-h-[320px] transition-all overflow-hidden min-w-0 w-full`}>

                            {isLoadingResume ? (
                                <div className="flex flex-col items-center gap-5 animate-pulse z-10 relative">
                                    <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 w-20 h-20 flex items-center justify-center rounded-full">
                                        <span className="material-symbols-outlined text-slate-400 text-3xl animate-spin">progress_activity</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500">{t('step0.checkingCv')}</p>
                                </div>
                            ) : existingResume ? (
                                <>
                                    {/* Success Glow Background */}
                                    <div className="absolute inset-0 z-0 pointer-events-none opacity-100 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent animate-in fade-in duration-1000"></div>
                                    <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTYsMTg1LDEyOSwxKSIvPjwvc3ZnPg==')] animate-in fade-in duration-1000"></div>

                                    <div className="flex flex-col items-center justify-center w-full z-10 relative min-w-0 animate-in fade-in zoom-in-[0.95] duration-700 ease-out">

                                        {/* Futuristic Success Icon */}
                                        <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-full mb-8">
                                            <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-2xl animate-pulse"></div>
                                            <div className="absolute inset-0 border border-emerald-500/40 rounded-full animate-[spin_12s_linear_infinite] border-t-emerald-400"></div>
                                            <div className="absolute inset-2 border border-emerald-400/20 rounded-full animate-[spin_10s_linear_infinite_reverse] border-b-emerald-300"></div>

                                            <div className="relative bg-white/60 dark:bg-[#061810]/80 backdrop-blur-md border border-emerald-200 dark:border-emerald-500/30 w-[60%] h-[60%] flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-4xl sm:text-5xl drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">task</span>
                                            </div>
                                        </div>

                                        <h3 className="relative z-10 text-2xl sm:text-3xl font-headline-lg font-black text-slate-800 dark:text-white mb-4 tracking-tight text-center drop-shadow-sm">
                                            {t('step0.cvUploaded')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">{t('step0.successfully')}</span>
                                        </h3>

                                        {/* Sci-Fi File Card */}
                                        <div className="relative z-10 flex items-center gap-4 bg-white/40 dark:bg-[#0d1520]/60 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/20 px-4 sm:px-6 py-4 rounded-2xl w-full max-w-lg mb-10 shadow-[0_8px_30px_rgba(16,185,129,0.05)] dark:shadow-[0_8px_30px_rgba(16,185,129,0.1)] min-w-0 group hover:border-emerald-400/40 transition-colors">
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>

                                            <div className="bg-red-500/10 dark:bg-red-500/20 p-2.5 rounded-xl shrink-0 border border-red-500/20">
                                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[24px] sm:text-[28px] block drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">picture_as_pdf</span>
                                            </div>

                                            <div className="flex-1 overflow-hidden text-start min-w-0 w-full">
                                                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 break-all whitespace-normal line-clamp-2 w-full" title={existingResume.fileName || existingResume.filename}>
                                                    {existingResume.fileName || existingResume.filename || t('step0.uploadedResume')}
                                                </p>
                                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1.5 whitespace-nowrap">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span> {t('step0.processedByAi')}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleDeleteResume}
                                                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl p-2 transition-all relative z-20 cursor-pointer shrink-0"
                                                title={t('step0.removeCv')}
                                            >
                                                <span className="material-symbols-outlined text-[24px] block">delete_forever</span>
                                            </button>
                                        </div>

                                        {/* Retry Parse — shown when AI extraction failed */}
                                        {parseFailed && !isUploading && (
                                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 w-full max-w-lg">
                                                <button
                                                    onClick={handleRetryParse}
                                                    className="cursor-pointer px-7 py-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-400/50 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 font-bold text-sm shadow-[0_4px_20px_rgba(245,158,11,0.08)] dark:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all hover:bg-amber-500/20 dark:hover:bg-amber-500/20 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                                                    {t('step0.retryParse', 'Retry Parse')}
                                                </button>
                                                <label className="cursor-pointer px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-[#061810] dark:border dark:border-emerald-500/50 text-white font-bold text-sm shadow-[0_4px_20px_rgba(15,23,42,0.15)] dark:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:shadow-[0_8px_30px_rgba(15,23,42,0.25)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-600 dark:hover:bg-emerald-500/20 hover:-translate-y-0.5 overflow-hidden flex items-center justify-center group/btn">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rtl:translate-x-[150%] -translate-x-[150%] rtl:group-hover/btn:-translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                                                    <span className="relative flex items-center gap-2.5 tracking-wide">
                                                        {t('step0.replaceCv')} <span className="material-symbols-outlined text-[20px]">find_replace</span>
                                                    </span>
                                                    <input
                                                        type="file"
                                                        ref={resumeInputRef}
                                                        onChange={handleResumeChange}
                                                        accept=".pdf,.docx"
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        )}

                                        {/* Replace CV — shown when parse succeeded (no retry needed) */}
                                        {!parseFailed && (
                                            <label className="relative z-10 cursor-pointer px-8 py-4 rounded-xl bg-slate-900 dark:bg-[#061810] dark:border dark:border-emerald-500/50 text-white font-bold text-sm shadow-[0_4px_20px_rgba(15,23,42,0.15)] dark:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:shadow-[0_8px_30px_rgba(15,23,42,0.25)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:bg-emerald-600 dark:hover:bg-emerald-500/20 hover:-translate-y-0.5 overflow-hidden flex items-center justify-center group/btn">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rtl:translate-x-[150%] -translate-x-[150%] rtl:group-hover/btn:-translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                                                <span className="relative flex items-center gap-2.5 tracking-wide">
                                                    {t('step0.replaceCv')} <span className="material-symbols-outlined text-[20px]">find_replace</span>
                                                </span>
                                                <input
                                                    type="file"
                                                    ref={resumeInputRef}
                                                    onChange={handleResumeChange}
                                                    accept=".pdf,.docx"
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Animated Sci-Fi Background Glows (Empty State Only) */}
                                    <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
                                    <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LDE2MywxODQsMSkiLz48L3N2Zz4=')]"></div>

                                    <div className="flex flex-col items-center justify-center w-full z-10 relative animate-in fade-in zoom-in-[0.95] duration-700 ease-out">
                                        {/* Futuristic Floating Upload Icon */}
                                        <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-full mb-8 group-hover:-translate-y-2 transition-transform duration-500">
                                            <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
                                            <div className="absolute inset-0 border border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite] border-t-blue-500"></div>
                                            <div className="absolute inset-2 border border-cyan-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse] border-b-cyan-400"></div>
                                            <div className="absolute inset-4 border border-blue-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>

                                            <div className="relative bg-white/60 dark:bg-[#0b1326]/80 backdrop-blur-md border border-white/50 dark:border-blue-500/30 w-[60%] h-[60%] flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-4xl sm:text-5xl group-hover:scale-110 group-hover:text-cyan-500 transition-all duration-300">cloud_upload</span>
                                            </div>
                                        </div>

                                        {/* High-Tech Typography */}
                                        <h3 className="relative z-10 text-2xl sm:text-3xl font-headline-lg font-black text-slate-800 dark:text-white mb-4 tracking-tight text-center drop-shadow-sm">
                                            {t('step0.initialize')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">{t('step0.uploadSequence')}</span>
                                        </h3>

                                        <div className="relative z-10 flex flex-col items-center max-w-sm mb-10">
                                            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium text-center leading-relaxed">
                                                {t('step0.dropMatrix')}
                                            </p>
                                            <span className="text-[11px] font-bold uppercase tracking-widest mt-5 flex items-center justify-center gap-2.5 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-[#0d1117]/80 backdrop-blur-sm py-2 px-5 rounded-full border border-slate-200 dark:border-slate-700/80 shadow-sm">
                                                <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></span>
                                                {t('step0.pdfDocxMax')}
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <button className="relative z-10 px-8 py-4 rounded-xl bg-slate-900 dark:bg-[#0b1326] dark:border dark:border-blue-500/50 text-white font-bold text-sm shadow-[0_4px_20px_rgba(15,23,42,0.15)] dark:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all pointer-events-none group-hover:shadow-[0_8px_30px_rgba(15,23,42,0.25)] dark:group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] group-hover:bg-blue-600 dark:group-hover:bg-blue-500/20 group-hover:-translate-y-0.5 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rtl:translate-x-[150%] -translate-x-[150%] rtl:group-hover:-translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                                            <span className="relative flex items-center gap-2.5 tracking-wide">
                                                {t('step0.engageScanner')} <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                                            </span>
                                        </button>

                                        <input
                                            type="file"
                                            ref={resumeInputRef}
                                            onChange={handleResumeChange}
                                            accept=".pdf,.docx"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-700 flex flex-col-reverse md:flex-row justify-between items-center gap-4 shadow-sm rounded-xl w-full mt-8">
                        <button
                            disabled
                            className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600/80 bg-white dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed text-sm shadow-sm shrink-0"
                        >
                            <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_back</span> {t('step0.back')}
                        </button>
                        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end min-w-0">
                            <span className="text-slate-400 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest hidden sm:inline-block shrink-0">{t('step0.step1of4')}</span>
                            <button
                                onClick={async () => {
                                    try {
                                        await wizardService.advanceStep(1);
        updateUser({ profileCompletionStep: 1 });
                                    } catch (e) {
                                        console.error('Failed to advance wizard from step 0', e);
                                    }
                                    navigate('/step-1', { state: { extractedData } });
                                }}
                                disabled={isUploading}
                                className="w-full md:w-auto px-7 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm shrink-0"
                            >
                                {t('step0.nextStep')}
                                <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-Screen Upload Overlay */}
            {isUploading && (
                <div className="fixed inset-0 z-[200]">
                    <SciFiScanner />
                </div>
            )}
        </ProfileSetupLayout>
    );
};

export default Step0;
