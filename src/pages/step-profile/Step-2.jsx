import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileSetupLayout from '../../Components/ProfileSetupLayout.jsx';
import wizardService from '../../api/wizardService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toastSuccess, alertError } from '../../lib/alerts.js';
import { extractError } from '../../utils/extractError.js';
import { useSessionStorage } from '../../hooks/useSessionStorage.js';
import { useTranslation } from 'react-i18next';
import SearchableSelect from '../../Components/SearchableSelect.jsx';

const DEGREE_OPTIONS = [
    { value: 'HighSchool', label: 'High School' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Associate', label: 'Associate' },
    { value: 'Bachelor', label: "Bachelor's" },
    { value: 'Master', label: "Master's" },
    { value: 'PhD', label: 'PhD' },
    { value: 'Other', label: 'Other' },
];

const emptyExperience = { jobTitle: '', companyName: '', countryId: '', cityId: '', startDate: '', endDate: '', isCurrent: false, employmentType: 'FullTime', responsibilities: '' };
const emptyEducation = { institution: '', degree: 'Bachelor', fieldOfStudyId: '', startDate: '', endDate: '', isCurrent: false, gradeOrGPA: '' };

const Step2 = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUser } = useAuth();

    // Existing entries from API
    const [experiences, setExperiences] = useState([]);
    const [educations, setEducations] = useState([]);
    const [openSection, setOpenSection] = useState(1);

    // Forms for adding new entries
    const [expForm, setExpForm] = useSessionStorage('step2_expForm', { ...emptyExperience });
    const [eduForm, setEduForm] = useSessionStorage('step2_eduForm', { ...emptyEducation });
    const [editingExpId, setEditingExpId] = useState(null);
    const [editingEduId, setEditingEduId] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [showExpForm, setShowExpForm] = useState(false);
    const [showEduForm, setShowEduForm] = useState(false);
    const [savingExp, setSavingExp] = useState(false);
    const [savingEdu, setSavingEdu] = useState(false);

    // Reference data
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [fieldsOfStudy, setFieldsOfStudy] = useState([]);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);

    // Load existing data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [expRes, eduRes, countriesRes, fieldsOfStudyRes] = await Promise.all([
                    wizardService.getExperiences(i18n.language),
                    wizardService.getEducation(i18n.language),
                    wizardService.getCountries(i18n.language),
                    wizardService.getFieldsOfStudy(i18n.language),
                ]);

                let currentExps = expRes.data?.data?.experiences || expRes.data?.data || [];
                let currentEdus = eduRes.data?.data?.educationList || eduRes.data?.data || [];



                setExperiences(currentExps);
                setEducations(currentEdus);
                setCountries(countriesRes.data?.data || countriesRes.data || []);
                setFieldsOfStudy(fieldsOfStudyRes.data?.data || fieldsOfStudyRes.data || []);
            } catch (ex) {
                console.error('Failed to load data', ex);
            } finally {
                setDataLoading(false);
            }
        };
        loadData();
    }, [i18n.language]);

    // Refetch data when language changes
    useEffect(() => {
        if (dataLoading) return;
        const updateData = async () => {
            try {
                const [expRes, eduRes, countriesRes, fieldsRes] = await Promise.all([
                    wizardService.getExperiences(i18n.language),
                    wizardService.getEducation(i18n.language),
                    wizardService.getCountries(i18n.language),
                    wizardService.getFieldsOfStudy(i18n.language)
                ]);
                
                setExperiences(expRes.data?.data?.experiences || expRes.data?.data || []);
                setEducations(eduRes.data?.data?.educationList || eduRes.data?.data || []);
                
                setCountries(countriesRes.data?.data || countriesRes.data || []);
                setFieldsOfStudy(fieldsRes.data?.data || fieldsRes.data || []);
                if (expForm.countryId) {
                    const citiesRes = await wizardService.getCities(expForm.countryId, i18n.language);
                    setCities(citiesRes.data?.data || citiesRes.data || []);
                }
            } catch (ex) {
                console.error(ex);
            }
        };
        updateData();
    }, [i18n.language, dataLoading, expForm.countryId]);

    const handleExpChange = async (field, value) => {
        setExpForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'isCurrent' && value) {
                updated.endDate = '';
            }
            if (field === 'countryId') {
                updated.cityId = ''; // Reset city
            }
            return updated;
        });

        if (field === 'countryId') {
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

    const handleEduChange = (field, value) => {
        setEduForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'isCurrent' && value) {
                updated.endDate = '';
            }
            return updated;
        });
    };

    // Performance Optimization: Removed unused memoized dropdown arrays
    const editExperience = async (exp) => {
        setExpForm({
            jobTitle: exp.jobTitle,
            companyName: exp.companyName,
            countryId: exp.countryId || '',
            cityId: exp.cityId || '',
            startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
            endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
            isCurrent: exp.isCurrent,
            employmentType: exp.employmentType || 'FullTime',
            responsibilities: exp.responsibilities || '',
        });
        setEditingExpId(exp.id);
        setShowExpForm(true);
        if (exp.countryId) {
            setIsCitiesLoading(true);
            try {
                const res = await wizardService.getCities(exp.countryId, i18n.language);
                setCities(res.data?.data || res.data || []);
            } catch (ex) {
                console.error('Failed to fetch cities', ex);
            } finally {
                setIsCitiesLoading(false);
            }
        }
    };

    const editEducation = (edu) => {
        setEduForm({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudyId: edu.fieldOfStudyId?.toString() || '',
            startDate: edu.startDate ? edu.startDate.split('T')[0] : '',
            endDate: edu.endDate ? edu.endDate.split('T')[0] : '',
            isCurrent: edu.isCurrent,
            gradeOrGPA: edu.gradeOrGPA || '',
        });
        setEditingEduId(edu.id);
        setShowEduForm(true);
    };

    const saveExperience = async () => {
        if (!expForm.jobTitle || !expForm.companyName || !expForm.startDate || !expForm.countryId || !expForm.cityId) {
            alertError(t('step2.alerts.missingFields'), t('step2.alerts.expFieldsRequired'));
            return;
        }
        setSavingExp(true);
        try {
            const payload = {
                jobTitle: expForm.jobTitle,
                companyName: expForm.companyName,
                countryId: parseInt(expForm.countryId) || 0,
                cityId: parseInt(expForm.cityId) || 0,
                startDate: expForm.startDate,
                endDate: expForm.isCurrent ? null : (expForm.endDate || null),
                isCurrent: expForm.isCurrent,
                employmentType: expForm.employmentType,
                responsibilities: expForm.responsibilities || null,
                displayOrder: experiences.length,
            };
            if (editingExpId) {
                await wizardService.updateExperience(editingExpId, payload);
                toastSuccess(t('step2.alerts.expUpdated'));
            } else {
                await wizardService.addExperience(payload);
                toastSuccess(t('step2.alerts.expAdded'));
            }
            // Optimistic UI logic: Refresh list in background, then close form instantly
            const expRes = await wizardService.getExperiences(i18n.language);
            const expData = expRes.data?.data;
            setExperiences(expData?.experiences || expData || []);

            setExpForm({ ...emptyExperience });
            setEditingExpId(null);
            setShowExpForm(false);
        } catch (ex) {
            alertError(t('step2.alerts.saveFailed'), extractError(ex));
        } finally {
            setSavingExp(false);
        }
    };

    const deleteExperience = async (id) => {
        try {
            await wizardService.deleteExperience(id);
            setExperiences(prev => prev.filter(e => e.id !== id));
            toastSuccess(t('step2.alerts.expRemoved'));
        } catch (ex) {
            alertError(t('step2.alerts.deleteFailed'), extractError(ex));
        }
    };

    const saveEducation = async () => {
        if (!eduForm.institution || !eduForm.fieldOfStudyId) {
            alertError(t('step2.alerts.missingFields'), t('step2.alerts.eduFieldsRequired'));
            return;
        }
        setSavingEdu(true);
        try {
            const payload = {
                institution: eduForm.institution,
                degree: eduForm.degree,
                fieldOfStudyId: parseInt(eduForm.fieldOfStudyId) || 0,
                startDate: eduForm.startDate,
                endDate: eduForm.isCurrent ? null : (eduForm.endDate || null),
                isCurrent: eduForm.isCurrent,
                gradeOrGPA: eduForm.gradeOrGPA || null,
                displayOrder: educations.length,
            };
            if (editingEduId) {
                await wizardService.updateEducation(editingEduId, payload);
                toastSuccess(t('step2.alerts.eduUpdated'));
            } else {
                await wizardService.addEducation(payload);
                toastSuccess(t('step2.alerts.eduAdded'));
            }
            // Optimistic UI logic: Refresh list in background, then close form instantly
            const eduRes = await wizardService.getEducation(i18n.language);
            const eduData = eduRes.data?.data;
            setEducations(eduData?.educationList || eduData || []);

            setEduForm({ ...emptyEducation });
            setEditingEduId(null);
            setShowEduForm(false);
        } catch (ex) {
            alertError(t('step2.alerts.saveFailed'), extractError(ex));
        } finally {
            setSavingEdu(false);
        }
    };

    const deleteEducation = async (id) => {
        try {
            await wizardService.deleteEducation(id);
            setEducations(prev => prev.filter(e => e.id !== id));
            toastSuccess(t('step2.alerts.eduRemoved'));
        } catch (ex) {
            alertError(t('step2.alerts.deleteFailed'), extractError(ex));
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            await wizardService.advanceStep(3);
        updateUser({ profileCompletionStep: 3 });
            toastSuccess(t('step2.alerts.step2Complete'));
            navigate('/step-3');
        } catch (ex) {
            alertError(t('step2.alerts.error'), extractError(ex));
        } finally {
            setLoading(false);
        }
    };

    const baseInputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm";
    const inputClass = baseInputClass + " h-12";
    const labelClass = "block text-[13.5px] font-medium text-slate-700 dark:text-slate-300 mb-2 tracking-wide";



    if (dataLoading) {
        return (
            <ProfileSetupLayout currentStep={2}>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-4xl animate-spin">progress_activity</span>
                        <p className="text-slate-600 dark:text-slate-400">{t('step2.loadingData')}</p>
                    </div>
                </div>
            </ProfileSetupLayout>
        );
    }

    return (
        <ProfileSetupLayout currentStep={2}>
            <div className="space-y-6">
                <div className="mb-6 sm:mb-8 text-start pt-2 sm:pt-4 w-full max-w-5xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                        {t('step2.title')}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                        {t('step2.desc')}
                    </p>
                </div>

                <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
                    <div className="flex-1 w-full space-y-4">
                        {/* ── EXPERIENCE SECTION ── */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 w-full shadow-sm">
                            <button onClick={() => setOpenSection(openSection === 1 ? null : 1)} className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 transition-colors ${openSection === 1 ? 'border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${openSection === 1 ? 'text-blue-500' : 'text-slate-500'}`}>work</span>
                                    <span className={`font-bold ${openSection === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{t('step2.workExperience')}</span>
                                    {experiences.length > 0 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">{experiences.length} {t('step2.added')}</span>}
                                </div>
                                <span className={`material-symbols-outlined transition-transform duration-300 ${openSection === 1 ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}>expand_more</span>
                            </button>
                            <div style={{ display: 'grid' }} className={`transition-[grid-template-rows,opacity] duration-300 ease-in-out w-full ${openSection === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden w-full">
                                    <div className="p-4 sm:p-8 md:p-10 w-full space-y-6 sm:space-y-8">
                                        {/* Existing experiences */}
                                        {experiences.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">work_history</span>
                                                <p className="text-slate-600 dark:text-slate-400 font-medium">{t('step2.noWorkExp')}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 max-w-sm">{t('step2.addPastRoles')}</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {experiences.map(exp => (
                                                    <div key={exp.id} className="group relative flex flex-col gap-3 sm:gap-4 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-all shadow-sm">
                                                        <div className="flex items-start gap-3 w-full">
                                                            {/* Icon Column */}
                                                            <div className="shrink-0 pt-[3px]">
                                                                <span className="material-symbols-outlined text-[20px] text-blue-500">work</span>
                                                            </div>
                                                            
                                                            {/* Content Column */}
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <h4 className="text-slate-800 dark:text-white text-base sm:text-lg font-bold break-words leading-tight mb-2">
                                                                    {exp.jobTitle}
                                                                </h4>
                                                                 <p className="text-slate-600 dark:text-slate-400 text-[15px] break-words leading-snug">{exp.companyName}</p>
                                                                 {exp.employmentType && (
                                                                     <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-1.5 w-fit">
                                                                         {t(`step2.employmentType.${exp.employmentType}`, exp.employmentType)}
                                                                     </span>
                                                                 )}
                                                                 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1.5 sm:gap-4 mt-2">
                                                                     {(exp.country || exp.city) && (
                                                                         <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[13px]">
                                                                             <span className="material-symbols-outlined text-[15px]">location_on</span>
                                                                             <span>{[exp.city, exp.country].filter(Boolean).join(', ')}</span>
                                                                         </div>
                                                                     )}
                                                                     {exp.dateRange && (
                                                                         <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[13px]">
                                                                             <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                                                                             <span>{exp.dateRange}</span>
                                                                         </div>
                                                                     )}
                                                                 </div>
                                                                 {exp.responsibilities && (
                                                                     <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 break-words whitespace-pre-line mt-2">
                                                                         {exp.responsibilities}
                                                                     </p>
                                                                 )}
                                                            </div>
                                                            
                                                            {/* Actions Column */}
                                                            <div className="flex items-center gap-0.5 shrink-0 -mt-1 -me-1 ms-auto">
                                                                <button onClick={() => editExperience(exp)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all" title="Edit">
                                                                    <span className="material-symbols-outlined text-[18px] sm:text-xl">edit</span>
                                                                </button>
                                                                <button onClick={() => deleteExperience(exp.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all" title="Delete">
                                                                    <span className="material-symbols-outlined text-[18px] sm:text-xl">delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Add Experience Form */}
                                        {showExpForm && (
                                            <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 w-full mt-4 sm:mt-6">
                                                <h4 className="text-slate-800 dark:text-white font-semibold flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">add_circle</span> {t('step2.addExperience')}
                                                </h4>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full">
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.jobTitle')}<span className="text-red-500 ms-1">*</span></label>
                                                        <input className={inputClass} placeholder={t('step2.jobTitlePlaceholder', 'e.g. Senior Developer')} value={expForm.jobTitle} onChange={e => handleExpChange('jobTitle', e.target.value)} />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.companyName')}<span className="text-red-500 ms-1">*</span></label>
                                                        <input className={inputClass} placeholder={t('step2.companyNamePlaceholder', 'e.g. TechFlow Inc.')} value={expForm.companyName} onChange={e => handleExpChange('companyName', e.target.value)} />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.country')}<span className="text-red-500 ms-1">*</span></label>
                                                        <SearchableSelect 
                                                            options={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
                                                            value={expForm.countryId?.toString() || ''}
                                                            onChange={(val) => handleExpChange('countryId', val)}
                                                            placeholder={t('step2.selectCountry')}
                                                            searchPlaceholder={t('step2.search', 'Search...')}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.cityRegion')}<span className="text-red-500 ms-1">*</span></label>
                                                        <SearchableSelect 
                                                            options={cities.map(c => ({ value: c.id.toString(), label: c.name }))}
                                                            value={expForm.cityId?.toString() || ''}
                                                            onChange={(val) => handleExpChange('cityId', val)}
                                                            placeholder={isCitiesLoading ? t('step2.loading') : t('step2.selectCity')}
                                                            searchPlaceholder={t('step2.search', 'Search...')}
                                                            disabled={!expForm.countryId || isCitiesLoading}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.employmentTypeLabel')}</label>
                                                        <SearchableSelect 
                                                            options={[
                                                                { value: 'FullTime', label: t('step2.employmentType.FullTime', 'Full-time') },
                                                                { value: 'PartTime', label: t('step2.employmentType.PartTime', 'Part-time') },
                                                                { value: 'Contract', label: t('step2.employmentType.Contract', 'Contract') },
                                                                { value: 'Freelance', label: t('step2.employmentType.Freelance', 'Freelance') },
                                                                { value: 'Internship', label: t('step2.employmentType.Internship', 'Internship') },
                                                            ]}
                                                            value={expForm.employmentType || 'FullTime'}
                                                            onChange={(val) => handleExpChange('employmentType', val)}
                                                            placeholder={t('step2.employmentTypePlaceholder', 'Select type')}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.startDate')}<span className="text-red-500 ms-1">*</span></label>
                                                        <input className={inputClass} type="date" value={expForm.startDate} onChange={e => handleExpChange('startDate', e.target.value)} />
                                                    </div>
                                                    <div className="flex flex-col w-full">
                                                        {!expForm.isCurrent && (
                                                            <>
                                                                <label className={labelClass}>{t('step2.endDate')}</label>
                                                                <input className={inputClass} type="date" value={expForm.endDate} onChange={e => handleExpChange('endDate', e.target.value)} />
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="col-span-1 sm:col-span-2 flex items-center gap-3 w-full">
                                                        <div className="relative flex items-center justify-center">
                                                            <input type="checkbox" id="exp-current" checked={expForm.isCurrent} onChange={e => handleExpChange('isCurrent', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer" />
                                                            <span className="material-symbols-outlined text-white text-[14px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                                                        </div>
                                                        <label htmlFor="exp-current" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">{t('step2.iCurrentlyWorkHere')}</label>
                                                    </div>
                                                    <div className="col-span-1 sm:col-span-2 w-full">
                                                        <label className={labelClass}>{t('step2.responsibilities')}</label>
                                                        <textarea
                                                            className={baseInputClass + ' min-h-[160px] resize-none py-3 custom-scrollbar leading-relaxed'}
                                                            value={expForm.responsibilities}
                                                            onChange={e => handleExpChange('responsibilities', e.target.value)}
                                                            placeholder={t('step2.responsibilitiesHint')}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-slate-200/80 dark:border-slate-700 w-full">
                                                    <button onClick={() => { setShowExpForm(false); setExpForm({ ...emptyExperience }); setEditingExpId(null); }} className="w-full sm:w-auto px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shadow-sm">
                                                        {t('step2.cancel')}
                                                    </button>
                                                    <button onClick={saveExperience} disabled={savingExp} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
                                                        {savingExp ? t('step2.saving') : (editingExpId ? t('step2.updateExperience') : t('step2.saveExperience'))}
                                                        {!savingExp && <span className="material-symbols-outlined text-lg">check_circle</span>}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {!showExpForm && (
                                            <div className="pt-2">
                                                <button onClick={() => setShowExpForm(true)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-transparent py-4 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-blue-600 dark:text-blue-400 hover:border-blue-500/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group">
                                                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <span className="material-symbols-outlined text-xl">add</span>
                                                    </div>
                                                    <span>{experiences.length > 0 ? t('step2.addAnotherPosition') : t('step2.addPosition')}</span>
                                                </button>
                                            </div>
                                        )}
                                        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end w-full">
                                            <button type="button" onClick={() => setOpenSection(2)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-colors">{t('step2.continue')}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── EDUCATION SECTION ── */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 w-full shadow-sm">
                            <button onClick={() => setOpenSection(openSection === 2 ? null : 2)} className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 transition-colors ${openSection === 2 ? 'border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${openSection === 2 ? 'text-blue-500' : 'text-slate-500'}`}>school</span>
                                    <span className={`font-bold ${openSection === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{t('step2.education')}</span>
                                    {educations.length > 0 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">{educations.length} {t('step2.added')}</span>}
                                </div>
                                <span className={`material-symbols-outlined transition-transform duration-300 ${openSection === 2 ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}>expand_more</span>
                            </button>
                            <div style={{ display: 'grid' }} className={`transition-[grid-template-rows,opacity] duration-300 ease-in-out w-full ${openSection === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden w-full">
                                    <div className="p-4 sm:p-8 md:p-10 w-full space-y-6 sm:space-y-8">
                                        {/* Existing educations */}
                                        {educations.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">school</span>
                                                <p className="text-slate-600 dark:text-slate-400 font-medium">{t('step2.noEducation')}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 max-w-sm">{t('step2.addAcademicBackground')}</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {educations.map(edu => (
                                                    <div key={edu.id} className="group relative flex flex-col gap-3 sm:gap-4 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-all shadow-sm">
                                                        <div className="flex items-start gap-3 w-full">
                                                            {/* Icon Column */}
                                                            <div className="shrink-0 pt-[3px]">
                                                                <span className="material-symbols-outlined text-[20px] text-blue-500">school</span>
                                                            </div>
                                                            
                                                            {/* Content Column */}
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <h4 className="text-slate-800 dark:text-white text-base sm:text-lg font-bold break-words leading-tight mb-2">
                                                                    {edu.institution}
                                                                </h4>
                                                                <p className="text-slate-600 dark:text-slate-400 text-[15px] break-words leading-snug">
                                                                    {t(`step2.degreeOptions.${edu.degree}`)} {i18n.language === 'ar' ? 'في' : 'in'} {edu.fieldOfStudy}
                                                                </p>
                                                                 {edu.dateRange && (
                                                                     <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[13px] mt-2">
                                                                         <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                                                                         <span>{edu.dateRange}</span>
                                                                     </div>
                                                                 )}
                                                                 {edu.gradeOrGPA && (
                                                                     <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                                                                         {t('step2.gradeOrGPA', 'GPA: {{gpa}}', { gpa: edu.gradeOrGPA })}
                                                                     </p>
                                                                 )}
                                                             </div>
                                                            
                                                            {/* Actions Column */}
                                                            <div className="flex items-center gap-0.5 shrink-0 -mt-1 -me-1 ms-auto">
                                                                <button onClick={() => editEducation(edu)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all" title="Edit">
                                                                    <span className="material-symbols-outlined text-[18px] sm:text-xl">edit</span>
                                                                </button>
                                                                <button onClick={() => deleteEducation(edu.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all" title="Delete">
                                                                    <span className="material-symbols-outlined text-[18px] sm:text-xl">delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Add Education Form */}
                                        {showEduForm && (
                                            <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 w-full mt-4 sm:mt-6">
                                                <h4 className="text-slate-800 dark:text-white font-semibold flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">add_circle</span> {t('step2.addEducation')}
                                                </h4>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full">
                                                    <div className="w-full sm:col-span-2">
                                                        <label className={labelClass}>{t('step2.schoolUniversity')}<span className="text-red-500 ms-1">*</span></label>
                                                        <input className={inputClass} placeholder={t('step2.schoolUniversityPlaceholder', 'e.g. Stanford University')} value={eduForm.institution} onChange={e => handleEduChange('institution', e.target.value)} />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.degree')}<span className="text-red-500 ms-1">*</span></label>
                                                        <SearchableSelect 
                                                            options={DEGREE_OPTIONS.map(d => ({ value: d.value, label: t(`step2.degreeOptions.${d.value}`) }))}
                                                            value={eduForm.degree || ''}
                                                            onChange={(val) => handleEduChange('degree', val)}
                                                            placeholder={t('step2.selectDegree', 'Select Degree')}
                                                            searchPlaceholder={t('step2.search', 'Search...')}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.fieldOfStudy')}<span className="text-red-500 ms-1">*</span></label>
                                                        <SearchableSelect 
                                                            options={fieldsOfStudy.map(f => ({ value: f.id.toString(), label: f.name }))}
                                                            value={eduForm.fieldOfStudyId || ''}
                                                            onChange={(val) => handleEduChange('fieldOfStudyId', val)}
                                                            placeholder={t('step2.selectFieldOfStudy', 'Select Field of Study')}
                                                            searchPlaceholder={t('step2.search', 'Search...')}
                                                        />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.startDate')}<span className="text-red-500 ms-1">*</span></label>
                                                        <input className={inputClass} type="date" value={eduForm.startDate} onChange={e => handleEduChange('startDate', e.target.value)} />
                                                    </div>
                                                    <div className="flex flex-col w-full">
                                                        {!eduForm.isCurrent && (
                                                            <>
                                                                <label className={labelClass}>{t('step2.endDate')}</label>
                                                                <input className={inputClass} type="date" value={eduForm.endDate} onChange={e => handleEduChange('endDate', e.target.value)} />
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step2.gradeOrGPALabel', 'GPA / Grade')}</label>
                                                        <input
                                                            className={inputClass}
                                                            value={eduForm.gradeOrGPA}
                                                            onChange={e => handleEduChange('gradeOrGPA', e.target.value)}
                                                            placeholder={t('step2.gradeOrGPAHint', 'e.g. 3.8/4.0, First Class Honours')}
                                                        />
                                                    </div>
                                                    <div className="col-span-1 sm:col-span-2 flex items-center gap-3 w-full mt-1">
                                                        <div className="relative flex items-center justify-center">
                                                            <input type="checkbox" id="edu-current" checked={eduForm.isCurrent} onChange={e => handleEduChange('isCurrent', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer" />
                                                            <span className="material-symbols-outlined text-white text-[14px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                                                        </div>
                                                        <label htmlFor="edu-current" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">{t('step2.iCurrentlyStudyHere')}</label>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-slate-200/80 dark:border-slate-700 w-full">
                                                    <button onClick={() => { setShowEduForm(false); setEduForm({ ...emptyEducation }); setEditingEduId(null); }} className="w-full sm:w-auto px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shadow-sm">
                                                        {t('step2.cancel')}
                                                    </button>
                                                    <button onClick={saveEducation} disabled={savingEdu} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
                                                        {savingEdu ? t('step2.saving') : (editingEduId ? t('step2.updateEducation') : t('step2.saveEducation'))}
                                                        {!savingEdu && <span className="material-symbols-outlined text-lg">check_circle</span>}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {!showEduForm && (
                                            <div className="pt-2">
                                                <button onClick={() => setShowEduForm(true)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-transparent py-4 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-blue-600 dark:text-blue-400 hover:border-blue-500/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group">
                                                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <span className="material-symbols-outlined text-xl">add</span>
                                                    </div>
                                                    <span>{educations.length > 0 ? t('step2.addAnotherEducation') : t('step2.addEducationBtn')}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-700 flex flex-col-reverse md:flex-row justify-between items-center gap-4 shadow-sm rounded-xl w-full mt-8">
                    <button onClick={() => navigate('/step-1')} className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
                        <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_back</span> {t('step2.back')}
                    </button>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest hidden sm:inline-block">{t('step2.step3of4')}</span>
                        <button onClick={handleNext} disabled={loading} className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                            {loading ? t('step2.saving') : t('step2.nextStep')}
                            {!loading && <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>}
                        </button>
                    </div>
                </div>
            </div>
        </ProfileSetupLayout>
    );
};

export default Step2;
