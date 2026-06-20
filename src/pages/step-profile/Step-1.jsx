import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileSetupLayout from '../../Components/ProfileSetupLayout.jsx';
import wizardService from '../../api/wizardService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePicture } from '../../context/PictureContext.jsx';
import { useSessionStorage } from '../../hooks/useSessionStorage.js';
import { toastSuccess, alertError } from '../../lib/alerts.js';
import { extractError } from '../../utils/extractError.js';
import { useTranslation } from 'react-i18next';
import SearchableSelect from '../../Components/SearchableSelect.jsx';

const PROFICIENCY_OPTIONS = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Native', label: 'Native' },
];

const Step1 = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useAuth();
    const { pictureUrl, uploadPicture: contextUploadPicture } = usePicture();
    const fileInputRef = useRef(null);

    // Reference data
    const [jobTitles, setJobTitles] = useState([]);
    const [countries, setCountries] = useState([]);
    const [languages, setLanguages] = useState([]);

    // Form state matching PersonalInfoRequestDto
    const [form, setForm] = useSessionStorage('step1_form', {
        jobTitleId: '',
        yearsOfExperience: '',
        countryId: '',
        cityId: '',
        phoneNumber: '',
        firstLanguageId: '',
        firstLanguageProficiency: 'Native',
        secondLanguageId: '',
        secondLanguageProficiency: '',
        bio: '',
        workPreferences: [],
        desiredEmploymentTypes: [],
    });

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [cities, setCities] = useState([]);
    const [err, setErr] = useState('');
    const [openSection, setOpenSection] = useState(1);

    // Local preview for optimistic display (file object URL)
    const [localPreview, setLocalPreview] = useState(null);
    const [imgError, setImgError] = useState(false);
    const localPreviewRef = useRef(null);

    const setLocalPreviewSafe = (url) => {
        if (localPreviewRef.current) {
            URL.revokeObjectURL(localPreviewRef.current);
            localPreviewRef.current = null;
        }
        setLocalPreview(url);
        if (url) localPreviewRef.current = url;
    };

    // Reset imgError when pictureUrl changes
    useEffect(() => {
        setImgError(false);
    }, [pictureUrl]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (localPreviewRef.current) {
                URL.revokeObjectURL(localPreviewRef.current);
            }
        };
    }, []);

    // Load reference data + existing personal info
    useEffect(() => {
        const loadData = async () => {
            try {
                const [titlesRes, countriesRes, langsRes] = await Promise.all([
                    wizardService.getJobTitles(i18n.language),
                    wizardService.getCountries(i18n.language),
                    wizardService.getLanguages(i18n.language),
                ]);

                setJobTitles(titlesRes.data?.data || titlesRes.data || []);
                setCountries(countriesRes.data?.data || countriesRes.data || []);
                setLanguages(langsRes.data?.data || langsRes.data || []);

                // Try to load existing personal info
                try {
                    const infoRes = await wizardService.getPersonalInfo();
                    const info = infoRes.data?.data;
                    if (info) {
                        setForm({
                            jobTitleId: info.jobTitleId || '',
                            yearsOfExperience: info.yearsOfExperience ?? '',
                            countryId: info.countryId || '',
                            cityId: info.cityId || '',
                            phoneNumber: info.phoneNumber || '',
                            firstLanguageId: info.firstLanguageId || '',
                            firstLanguageProficiency: info.firstLanguageProficiency || 'Native',
                            secondLanguageId: info.secondLanguageId || '',
                            secondLanguageProficiency: info.secondLanguageProficiency || '',
                            bio: info.bio || '',
                            workPreferences: info.workPreferences || [],
                            desiredEmploymentTypes: info.desiredEmploymentTypes || [],
                        });

                        // Fetch cities for existing country
                        if (info.countryId) {
                            setIsCitiesLoading(true);
                            try {
                                const citiesRes = await wizardService.getCities(info.countryId, i18n.language);
                                setCities(citiesRes.data?.data || citiesRes.data || []);
                            } catch (e) {
                                console.error('Failed to load cities for saved profile', e);
                            } finally {
                                setIsCitiesLoading(false);
                            }
                        }
                    }
                } catch {
                    // No existing info, form stays with defaults
                }

                // If user came from Step-0 (Fast-Track CV upload), hydrate form immediately
                // Try location.state first, then sessionStorage as fallback (survives page refresh)
                const extracted = location.state?.extractedData || (() => {
                    try {
                        const stored = sessionStorage.getItem('step0_extractedData');
                        return stored ? JSON.parse(stored) : null;
                    } catch { return null; }
                })();
                if (extracted) {
                    setForm(prev => ({
                        ...prev,
                        jobTitleId: extracted.jobTitleId || prev.jobTitleId,
                        yearsOfExperience: extracted.yearsOfExperience !== null ? extracted.yearsOfExperience : prev.yearsOfExperience,
                        phoneNumber: extracted.phoneNumber || prev.phoneNumber,
                        countryId: extracted.countryId || prev.countryId,
                        cityId: extracted.cityId || prev.cityId,
                        firstLanguageId: extracted.firstLanguageId || prev.firstLanguageId,
                        bio: extracted.bio || prev.bio
                    }));

                    if (extracted.countryId) {
                        setIsCitiesLoading(true);
                        try {
                            const citiesRes = await wizardService.getCities(extracted.countryId, i18n.language);
                            setCities(citiesRes.data?.data || citiesRes.data || []);
                        } catch (err) {
                            console.error('Failed to load cities for auto-filled country', err);
                        } finally {
                            setIsCitiesLoading(false);
                        }
                    }
                }
            } catch (ex) {
                console.error('Failed to load reference data', ex);
                setErr('Failed to load form data. Please refresh the page.');
            } finally {
                setDataLoading(false);
            }
        };
        loadData();
    }, [i18n.language, location.state?.extractedData, setForm]);

    // Refetch reference data when language changes
    useEffect(() => {
        if (dataLoading) return;
        const updateRefData = async () => {
            try {
                const [titlesRes, countriesRes, langsRes] = await Promise.all([
                    wizardService.getJobTitles(i18n.language),
                    wizardService.getCountries(i18n.language),
                    wizardService.getLanguages(i18n.language),
                ]);
                setJobTitles(titlesRes.data?.data || titlesRes.data || []);
                setCountries(countriesRes.data?.data || countriesRes.data || []);
                setLanguages(langsRes.data?.data || langsRes.data || []);
                if (form.countryId) {
                    const citiesRes = await wizardService.getCities(form.countryId, i18n.language);
                    setCities(citiesRes.data?.data || citiesRes.data || []);
                }
            } catch (ex) {
                console.error(ex);
            }
        };
        updateRefData();
    }, [i18n.language, dataLoading, form.countryId]);

    const handleChange = async (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));

        if (field === 'countryId') {
            // Explicitly reset cityId on country change
            setForm(prev => ({ ...prev, cityId: '' }));
            if (!value) {
                setCities([]);
                return;
            }

            setIsCitiesLoading(true);
            try {
                const res = await wizardService.getCities(value, i18n.language);
                setCities(res.data?.data || res.data || []);
            } catch (ex) {
                console.error('Failed to fetch cities', ex);
            } finally {
                setIsCitiesLoading(false);
            }
        }
    };

    // Performance Optimization: Removed unused memoized dropdown arrays

    const handleWorkPreferenceChange = (pref) => {
        setForm(prev => {
            const current = prev.workPreferences || [];
            if (current.includes(pref)) {
                return { ...prev, workPreferences: current.filter(p => p !== pref) };
            } else {
                return { ...prev, workPreferences: [...current, pref] };
            }
        });
    };

    const handleEmploymentTypeChange = (type) => {
        setForm(prev => {
            const current = prev.desiredEmploymentTypes || [];
            if (current.includes(type)) {
                return { ...prev, desiredEmploymentTypes: current.filter(t => t !== type) };
            } else {
                return { ...prev, desiredEmploymentTypes: [...current, type] };
            }
        });
    };

    const handleProfilePicChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic local preview
        setLocalPreviewSafe(URL.createObjectURL(file));

        // Upload via context (updates shared state)
        try {
            await contextUploadPicture(file);
        } catch (ex) {
            alertError(t('step1.alerts.uploadFailed'), extractError(ex));
        }
    };

    const handleSubmit = async () => {
        setErr('');
        setLoading(true);

        // Build payload matching PersonalInfoRequestDto
        if (!form.workPreferences || form.workPreferences.length === 0) {
            alertError(t('step1.alerts.validationError'), t('step1.alerts.selectWorkModel'));
            setLoading(false);
            return;
        }

        if (!form.desiredEmploymentTypes || form.desiredEmploymentTypes.length === 0) {
            alertError(t('step1.alerts.validationError'), t('step1.alerts.selectEmploymentType'));
            setLoading(false);
            return;
        }

        const payload = {
            jobTitleId: parseInt(form.jobTitleId) || 0,
            yearsOfExperience: parseInt(form.yearsOfExperience) || 0,
            countryId: parseInt(form.countryId) || 0,
            cityId: parseInt(form.cityId) || 0,
            phoneNumber: form.phoneNumber?.trim() || null,
            firstLanguageId: parseInt(form.firstLanguageId) || 0,
            firstLanguageProficiency: form.firstLanguageProficiency,
            secondLanguageId: null,
            secondLanguageProficiency: null,
            bio: form.bio?.trim() || null,
            workPreferences: form.workPreferences,
            desiredEmploymentTypes: form.desiredEmploymentTypes,
        };

        try {
            await wizardService.savePersonalInfo(payload);

            // Advance wizard to step 2 (Step-0 already advanced to step 1)
            await wizardService.advanceStep(2);
        updateUser({ profileCompletionStep: 2 });

            toastSuccess(t('step1.alerts.personalInfoSaved'));
            navigate('/step-2');
        } catch (ex) {
            const msg = extractError(ex);
            setErr(msg);
            alertError(t('step1.alerts.saveFailed'), msg);
        } finally {
            setLoading(false);
        }
    };

    const baseInputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm";
    const inputClass = baseInputClass + " h-12";
    const labelClass = "block text-[13.5px] font-medium text-slate-700 dark:text-slate-300 mb-2 tracking-wide";

    if (dataLoading) {
        return (
            <ProfileSetupLayout currentStep={1}>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-3">
                        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
                        <p className="text-text-secondary dark:text-slate-400">{t('step1.loadingFormData')}</p>
                    </div>
                </div>
            </ProfileSetupLayout>
        );
    }

    return (
        <ProfileSetupLayout currentStep={1}>
            <div className="space-y-6">
                <div className="mb-6 sm:mb-8 text-start pt-2 sm:pt-4 w-full max-w-5xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">{t('step1.title')}</h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">{t('step1.desc')}</p>
                </div>

                {err && (
                    <div className="text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg">
                        {err}
                    </div>
                )}

                <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
                    {/* Personal Details */}
                    <div className="w-full space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-500 text-xl">person</span>
                                <h3 className="text-slate-800 dark:text-white font-bold text-lg">{t('step1.personalDetails')}</h3>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/20 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">{t('step1.manualEntry')}</span>
                        </div>

                        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-8 md:p-10 shadow-sm flex flex-col gap-6 overflow-hidden w-full">
                            {/* Profile Header (Photo + Identity Badge) */}
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full shrink-0 border-b border-slate-200 dark:border-slate-700 pb-6">
                                <div className="flex flex-col items-center gap-3 w-full md:w-32 shrink-0">
                                    <div className="relative size-28 rounded-full overflow-hidden bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark group cursor-pointer hover:border-primary transition-all shadow-sm dark:shadow-none">
                                        {(localPreview || pictureUrl) && !imgError ? (
                                            <img alt="Profile" className="w-full h-full object-cover" src={localPreview || pictureUrl} onError={() => setImgError(true)} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-4xl">person</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 dark:bg-black/40 group-hover:bg-black/20 dark:group-hover:bg-black/60 transition-colors">
                                            <span className="material-symbols-outlined text-white text-2xl drop-shadow-sm mb-1">camera_alt</span>
                                        </div>
                                        <input ref={fileInputRef} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" type="file" onChange={handleProfilePicChange} />
                                    </div>
                                    <div className="text-center">
                                        <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:text-primary-dark transition-colors">{t('step1.changePhoto')}</button>
                                        <p className="text-[10px] text-text-muted dark:text-slate-400 mt-0.5">{t('step1.max5MB')}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center text-center md:text-start h-full md:pt-4">
                                    <h3 className="text-2xl font-bold text-text-main dark:text-white mb-1">
                                        {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : t('step1.userProfile')}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center md:justify-start gap-1.5">
                                        <span className="material-symbols-outlined text-[16px]">mail</span>
                                        {user?.email || 'email@example.com'}
                                    </p>
                                    <div className="mt-3">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-md border border-green-200 dark:border-green-800">
                                            <span className="material-symbols-outlined text-[12px]">verified</span> {t('step1.verifiedAccount')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields Accordions */}
                            <div className="flex-1 w-full space-y-4">
                                {/* Accordion 1: Location & Identity */}
                                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 w-full shadow-sm">
                                    <button onClick={() => setOpenSection(openSection === 1 ? null : 1)} className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 transition-colors ${openSection === 1 ? 'border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20 bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined ${openSection === 1 ? 'text-blue-500' : 'text-slate-500'}`}>badge</span>
                                            <span className={`font-bold ${openSection === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{t('step1.locationIdentity')}</span>
                                        </div>
                                        <span className={`material-symbols-outlined transition-transform duration-300 ${openSection === 1 ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}>expand_more</span>
                                    </button>
                                    <div style={{ display: 'grid' }} className={`transition-[grid-template-rows,opacity] duration-300 ease-in-out w-full ${openSection === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden w-full">
                                            <div className="p-4 sm:p-8 md:p-10 w-full">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full">
                                                    {/* Phone */}
                                                    <div className="w-full sm:col-span-2">
                                                        <label className={labelClass}>{t('step1.phoneNumber')}</label>
                                                        <div className="relative w-full">
                                                            <span className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">call</span>
                                                            <input
                                                                className={inputClass + " ps-11"}
                                                                type="tel"
                                                                placeholder={t('step1.phonePlaceholder', '+201234567890')}
                                                                value={form.phoneNumber}
                                                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Country */}
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step1.country')}<span className="text-red-500 ms-1">*</span></label>
                                                        <SearchableSelect 
                                                            options={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
                                                            value={form.countryId?.toString() || ''}
                                                            onChange={(val) => handleChange('countryId', val)}
                                                            placeholder={t('step1.selectCountry')}
                                                            searchPlaceholder={t('step1.search', 'Search...')}
                                                        />
                                                    </div>

                                                    {/* City / Region */}
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step1.cityRegion')}<span className="text-red-500 ms-1">*</span></label>
                                                        <SearchableSelect 
                                                            options={cities.map(c => ({ value: c.id.toString(), label: c.name }))}
                                                            value={form.cityId?.toString() || ''}
                                                            onChange={(val) => handleChange('cityId', val)}
                                                            placeholder={isCitiesLoading ? t('step1.loadingRegions') : t('step1.selectCity')}
                                                            searchPlaceholder={t('step1.search', 'Search...')}
                                                            disabled={!form.countryId || isCitiesLoading}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end w-full">
                                                    <button type="button" onClick={() => setOpenSection(2)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-colors">{t('step1.continue')}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion 2: Job Preferences */}
                                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 w-full shadow-sm">
                                    <button onClick={() => setOpenSection(openSection === 2 ? null : 2)} className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 transition-colors ${openSection === 2 ? 'border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20 bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined ${openSection === 2 ? 'text-blue-500' : 'text-slate-500'}`}>work</span>
                                            <span className={`font-bold ${openSection === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{t('step1.jobPreferences')}</span>
                                        </div>
                                        <span className={`material-symbols-outlined transition-transform duration-300 ${openSection === 2 ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}>expand_more</span>
                                    </button>
                                    <div style={{ display: 'grid' }} className={`transition-[grid-template-rows,opacity] duration-300 ease-in-out w-full ${openSection === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden w-full">
                                            <div className="p-4 sm:p-8 md:p-10 w-full">
                                                <div className="space-y-6 w-full">
                                                    {/* Desired Employment Types */}
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step1.desiredEmploymentType')}<span className="text-red-500 ms-1">*</span></label>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('step1.desiredEmploymentTypeDesc')}</p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
                                                            {[
                                                                { value: 'FullTime', label: t('step1.fullTime'), icon: 'schedule' },
                                                                { value: 'PartTime', label: t('step1.partTime'), icon: 'timelapse' },
                                                                { value: 'Freelance', label: t('step1.freelance'), icon: 'laptop_mac' },
                                                                { value: 'Internship', label: t('step1.internship'), icon: 'school' },
                                                            ].map(({ value, label, icon }) => {
                                                                const active = (form.desiredEmploymentTypes || []).includes(value);
                                                                return (
                                                                    <button
                                                                        key={value}
                                                                        type="button"
                                                                        onClick={() => handleEmploymentTypeChange(value)}
                                                                        className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 p-3 sm:p-4 w-full rounded-xl border-2 text-center sm:text-start transition-all duration-150 ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20 hover:border-blue-400/40'}`}
                                                                    >
                                                                        {active && <span className="absolute top-2 ltr:right-2 rtl:left-2 material-symbols-outlined text-blue-500 text-[16px]">check_circle</span>}
                                                                        <div className={`flex items-center justify-center size-8 sm:size-10 rounded-lg shrink-0 ${active ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                                            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{icon}</span>
                                                                        </div>
                                                                        <span className={`text-xs sm:text-sm font-bold mt-1 sm:mt-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{label}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Work Preferences */}
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step1.desiredWorkModel')}<span className="text-red-500 ms-1">*</span></label>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('step1.desiredWorkModelDesc')}</p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
                                                            {[
                                                                { value: 'Remote', label: t('step1.remote'), icon: 'public', desc: t('step1.remoteDesc') },
                                                                { value: 'Hybrid', label: t('step1.hybrid'), icon: 'home_work', desc: t('step1.hybridDesc') },
                                                                { value: 'OnSite', label: t('step1.onSite'), icon: 'apartment', desc: t('step1.onSiteDesc') },
                                                            ].map(({ value, label, icon, desc }) => {
                                                                const active = (form.workPreferences || []).includes(value);
                                                                return (
                                                                    <button
                                                                        key={value}
                                                                        type="button"
                                                                        onClick={() => handleWorkPreferenceChange(value)}
                                                                        className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 p-3 sm:p-4 w-full rounded-xl border-2 text-center sm:text-start transition-all duration-150 ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20 hover:border-blue-400/40'}`}
                                                                    >
                                                                        {active && <span className="absolute top-2 ltr:right-2 rtl:left-2 material-symbols-outlined text-blue-500 text-[16px]">check_circle</span>}
                                                                        <div className={`flex items-center justify-center size-8 sm:size-10 rounded-lg shrink-0 ${active ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                                            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{icon}</span>
                                                                        </div>
                                                                        <div className="flex flex-col mt-1 sm:mt-0 w-full min-w-0">
                                                                            <span className={`text-xs sm:text-sm font-bold ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'} truncate`}>{label}</span>
                                                                            <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{desc}</span>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end w-full">
                                                    <button type="button" onClick={() => setOpenSection(3)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-colors">{t('step1.continue')}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Accordion 3: Professional Details */}
                                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 w-full shadow-sm">
                                    <button onClick={() => setOpenSection(openSection === 3 ? null : 3)} className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 transition-colors ${openSection === 3 ? 'border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20 bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined ${openSection === 3 ? 'text-blue-500' : 'text-slate-500'}`}>psychology</span>
                                            <span className={`font-bold ${openSection === 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{t('step1.professionalDetails')}</span>
                                        </div>
                                        <span className={`material-symbols-outlined transition-transform duration-300 ${openSection === 3 ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}>expand_more</span>
                                    </button>
                                    <div style={{ display: 'grid' }} className={`transition-[grid-template-rows,opacity] duration-300 ease-in-out w-full ${openSection === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden w-full">
                                            <div className="p-4 sm:p-8 md:p-10 w-full">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full">
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step1.jobTitle')}<span className="text-red-500 ms-1">*</span></label>
                                                        <SearchableSelect 
                                                            options={jobTitles.map(j => ({ value: j.id.toString(), label: j.title }))}
                                                            value={form.jobTitleId?.toString() || ''}
                                                            onChange={(val) => handleChange('jobTitleId', val)}
                                                            placeholder={t('step1.selectJobTitle')}
                                                            searchPlaceholder={t('step1.search', 'Search...')}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step1.yearsOfExp')}<span className="text-red-500 ms-1">*</span></label>
                                                        <input
                                                            className={inputClass}
                                                            type="number"
                                                            min="0"
                                                            max="50"
                                                            placeholder={t('step1.yearsOfExpPlaceholder', 'e.g. 3')}
                                                            value={form.yearsOfExperience}
                                                            onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step1.firstLanguage')}<span className="text-red-500 ms-1">*</span></label>
                                                        <SearchableSelect 
                                                            options={languages.map(l => ({ value: l.id.toString(), label: l.name }))}
                                                            value={form.firstLanguageId?.toString() || ''}
                                                            onChange={(val) => handleChange('firstLanguageId', val)}
                                                            placeholder={t('step1.selectLanguage')}
                                                            searchPlaceholder={t('step1.search', 'Search...')}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step1.proficiency')}<span className="text-red-500 ms-1">*</span></label>
                                                        <SearchableSelect 
                                                            options={PROFICIENCY_OPTIONS.map(p => ({ value: p.value, label: t(`step1.proficiencyOptions.${p.value}`) }))}
                                                            value={form.firstLanguageProficiency || ''}
                                                            onChange={(val) => handleChange('firstLanguageProficiency', val)}
                                                            placeholder={t('step1.selectProficiency')}
                                                            searchPlaceholder={t('step1.search', 'Search...')}
                                                        />
                                                    </div>
                                                    <div className="w-full sm:col-span-2 mt-1">
                                                        <label className={labelClass}>{t('step1.bioSummary')} <span className="text-slate-400 font-normal text-xs">{t('step1.maxChars')}</span></label>
                                                        <textarea
                                                            className={baseInputClass + " min-h-[180px] resize-none py-3 custom-scrollbar leading-relaxed"}
                                                            placeholder={t('step1.bioPlaceholder')}
                                                            maxLength={800}
                                                            value={form.bio}
                                                            onChange={(e) => handleChange('bio', e.target.value)}
                                                        />
                                                        <p className="text-[11px] text-slate-400 text-end mt-1.5 font-medium">{form.bio.length}/800</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-700 flex flex-col-reverse md:flex-row justify-between items-center gap-4 shadow-sm rounded-xl w-full mt-8">
                    <button
                        onClick={() => navigate('/step-0')}
                        className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                        <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_back</span> {t('step1.back')}
                    </button>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest hidden sm:inline-block">{t('step1.step2of4')}</span>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? t('step1.saving') : t('step1.nextStep')}
                            {!loading && <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>}
                        </button>
                    </div>
                </div>
            </div>
        </ProfileSetupLayout>
    );
};

export default Step1;