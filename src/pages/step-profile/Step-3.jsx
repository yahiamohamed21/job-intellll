import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileSetupLayout from '../../Components/ProfileSetupLayout.jsx';
import wizardService from '../../api/wizardService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSessionStorage } from '../../hooks/useSessionStorage.js';
import { useTranslation } from 'react-i18next';
import { toastSuccess, alertError } from '../../lib/alerts.js';
import { extractError } from '../../utils/extractError.js';

const SOCIAL_FIELDS = [
    { key: 'linkedIn', label: 'LinkedIn', faClass: 'fa-brands fa-linkedin-in', brandColor: '#0A66C2', placeholder: 'https://linkedin.com/in/your-profile' },
    { key: 'github', label: 'GitHub', faClass: 'fa-brands fa-github', brandColor: '#e6edf3', placeholder: 'https://github.com/your-username' },
    { key: 'behance', label: 'Behance', faClass: 'fa-brands fa-behance', brandColor: '#1769FF', placeholder: 'https://behance.net/your-profile' },
    { key: 'dribbble', label: 'Dribbble', faClass: 'fa-brands fa-dribbble', brandColor: '#EA4C89', placeholder: 'https://dribbble.com/your-username' },
    { key: 'personalWebsite', label: 'Personal Website', faClass: 'fa-solid fa-globe', brandColor: '#6366f1', placeholder: 'https://your-website.com' },
];

const Step3 = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    // Skills state
    const [availableSkills, setAvailableSkills] = useState([]);
    const [selectedSkillIds, setSelectedSkillIds] = useState([]);
    const [skillSearch, setSkillSearch] = useSessionStorage('step3_skillSearch', '');

    // Social accounts state
    const [socialForm, setSocialForm] = useSessionStorage('step3_socialForm', {
        linkedIn: '', github: '', behance: '', dribbble: '', personalWebsite: '',
    });

    // Projects state
    const [projects, setProjects] = useState([]);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [projectForm, setProjectForm] = useSessionStorage('step3_projectForm', { title: '', technologiesUsed: '', description: '', projectLink: '' });
    const [savingProject, setSavingProject] = useState(false);
    const [editingProjId, setEditingProjId] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [openSection, setOpenSection] = useState(1);

    // Load existing data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [availRes, userSkillsRes, socialRes, projectsRes] = await Promise.allSettled([
                    wizardService.getAvailableSkills(),
                    wizardService.getUserSkills(),
                    wizardService.getSocialAccounts(),
                    wizardService.getProjects(),
                ]);

                // Available skills
                if (availRes.status === 'fulfilled') {
                    setAvailableSkills(availRes.value.data?.data || availRes.value.data || []);
                }

                // User's current skills
                let currentSkills = [];
                if (userSkillsRes.status === 'fulfilled') {
                    const skills = userSkillsRes.value.data?.data || userSkillsRes.value.data?.skills || [];
                    currentSkills = skills.map(s => s.id);
                }
                setSelectedSkillIds(currentSkills);

                // Social accounts
                let saForm = { linkedIn: '', github: '', behance: '', dribbble: '', personalWebsite: '' };
                if (socialRes.status === 'fulfilled') {
                    const sa = socialRes.value.data?.socialAccounts || socialRes.value.data?.data;
                    if (sa) {
                        saForm = {
                            linkedIn: sa.linkedIn || '',
                            github: sa.github || '',
                            behance: sa.behance || '',
                            dribbble: sa.dribbble || '',
                            personalWebsite: sa.personalWebsite || '',
                        };
                    }
                }
                setSocialForm(saForm);

                // Projects
                let currentProjects = [];
                if (projectsRes.status === 'fulfilled') {
                    currentProjects = projectsRes.value.data?.data || [];
                }
                setProjects(currentProjects);
            } catch (ex) {
                console.error('Failed to load data', ex);
            } finally {
                setDataLoading(false);
            }
        };
        loadData();
    }, [setSocialForm]);

    // Skills
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleSkill = (id) => {
        setSelectedSkillIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(sid => sid !== id);
            }
            if (prev.length >= 25) {
                alertError(t('step3.alerts.skillLimitReached'), t('step3.alerts.maxSkillsMsg'));
                return prev;
            }
            return [...prev, id];
        });
        setIsDropdownOpen(false); // Close dropdown on selection
        setSkillSearch(''); // Clear search on selection
    };

    const filteredSkills = React.useMemo(() => availableSkills.filter(s =>
        s.name.toLowerCase().includes(skillSearch.toLowerCase())
    ), [availableSkills, skillSearch]);

    // Social form
    const handleSocialChange = (key, value) => {
        setSocialForm(prev => ({ ...prev, [key]: value }));
    };

    // Projects
    const handleProjectChange = (field, value) => {
        setProjectForm(prev => ({ ...prev, [field]: value }));
    };

    const editProject = (proj) => {
        setProjectForm({
            title: proj.title,
            technologiesUsed: proj.technologiesUsed || '',
            description: proj.description || '',
            projectLink: proj.projectLink || '',
        });
        setEditingProjId(proj.id);
        setShowProjectForm(true);
    };

    const saveProject = async () => {
        if (!projectForm.title.trim()) {
            alertError(t('step3.alerts.missingField'), t('step3.alerts.projTitleRequired'));
            return;
        }
        setSavingProject(true);
        try {
            const payload = {
                title: projectForm.title.trim(),
                technologiesUsed: projectForm.technologiesUsed?.trim() || null,
                description: projectForm.description?.trim() || null,
                projectLink: projectForm.projectLink?.trim() || null,
            };
            if (editingProjId) {
                await wizardService.updateProject(editingProjId, payload);
                toastSuccess(t('step3.alerts.projUpdated'));
            } else {
                await wizardService.addProject(payload);
                toastSuccess(t('step3.alerts.projAdded'));
            }
            // Optimistic UI logic: Refresh list in background, then close form instantly
            const res = await wizardService.getProjects();
            setProjects(res.data?.data || []);

            setProjectForm({ title: '', technologiesUsed: '', description: '', projectLink: '' });
            setEditingProjId(null);
            setShowProjectForm(false);
        } catch (ex) {
            alertError(t('step3.alerts.saveFailed'), extractError(ex));
        } finally {
            setSavingProject(false);
        }
    };

    const deleteProject = async (id) => {
        try {
            await wizardService.deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
            toastSuccess(t('step3.alerts.projRemoved'));
        } catch (ex) {
            alertError(t('step3.alerts.deleteFailed'), extractError(ex));
        }
    };

    // Final Submit
    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Save skills
            await wizardService.updateSkills(selectedSkillIds);

            // Save social accounts
            const socialPayload = {};
            SOCIAL_FIELDS.forEach(f => {
                const val = socialForm[f.key]?.trim();
                if (val) socialPayload[f.key] = val;
            });
            if (Object.keys(socialPayload).length > 0) {
                await wizardService.updateSocialAccounts(socialPayload);
            }

        // Advance wizard: mark profile as complete
        await wizardService.advanceStep(4);
        updateUser({ profileCompletionStep: 4 });

            // Clean up wizard session storage now that the profile is complete
            try {
                sessionStorage.removeItem('step0_extractedData');
                sessionStorage.removeItem('step1_form');
                sessionStorage.removeItem('step2_expForm');
                sessionStorage.removeItem('step2_eduForm');
                sessionStorage.removeItem('step3_skillSearch');
                sessionStorage.removeItem('step3_socialForm');
                sessionStorage.removeItem('step3_projectForm');
            } catch { /* non-fatal */ }

            toastSuccess(t('step3.alerts.profileCompleted'));
            navigate('/employee');
        } catch (ex) {
            const msg = extractError(ex);
            alertError(t('step3.alerts.saveFailed'), msg);
        } finally {
            setLoading(false);
        }
    };

    const baseInputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm";
    const inputClass = baseInputClass + " h-12";
    const labelClass = "block text-[13.5px] font-medium text-slate-700 dark:text-slate-300 mb-2 tracking-wide";



    if (dataLoading) {
        return (
            <ProfileSetupLayout currentStep={3}>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-4xl animate-spin">progress_activity</span>
                        <p className="text-slate-600 dark:text-slate-400">{t('step3.loadingData')}</p>
                    </div>
                </div>
            </ProfileSetupLayout>
        );
    }

    return (
        <ProfileSetupLayout currentStep={3}>
            <div className="space-y-6">
                <div className="mb-6 sm:mb-8 text-start pt-2 sm:pt-4 w-full max-w-5xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                        {t('step3.title')}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
                        {t('step3.desc')}
                    </p>
                </div>

                <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
                    <div className="flex-1 w-full space-y-4">
                        {/* ── SKILLS SECTION ── */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 w-full shadow-sm">
                            <button onClick={() => setOpenSection(openSection === 1 ? null : 1)} className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 transition-colors ${openSection === 1 ? 'border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-xl' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${openSection === 1 ? 'text-blue-500' : 'text-slate-500'}`}>psychology</span>
                                    <span className={`font-bold ${openSection === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{t('step3.skills')}</span>
                                    {selectedSkillIds.length > 0 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">{selectedSkillIds.length} {t('step3.selected')}</span>}
                                </div>
                                <span className={`material-symbols-outlined transition-transform duration-300 ${openSection === 1 ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}>expand_more</span>
                            </button>
                            <div style={{ display: 'grid' }} className={`transition-[grid-template-rows,opacity] duration-300 ease-in-out w-full ${openSection === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className={`w-full ${openSection === 1 ? 'overflow-visible' : 'overflow-hidden'}`}>
                                    <div className="p-4 sm:p-8 md:p-10 w-full space-y-4 sm:space-y-6">
                                        {/* Autocomplete Search & Dropdown */}
                                        <div className="relative" ref={dropdownRef}>
                                            <div className="relative">
                                                <span className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
                                                <input
                                                    className={inputClass + " ps-9 w-full"}
                                                    type="text"
                                                    placeholder={t('step3.searchSkills')}
                                                    value={skillSearch}
                                                    onChange={(e) => setSkillSearch(e.target.value)}
                                                    onFocus={() => setIsDropdownOpen(true)}
                                                />
                                            </div>

                                            {/* Dropdown Menu */}
                                            {isDropdownOpen && (
                                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {filteredSkills.filter(skill => !selectedSkillIds.includes(skill.id)).length > 0 ? (
                                                        <div className="p-2 flex flex-col gap-1">
                                                            {filteredSkills.filter(skill => !selectedSkillIds.includes(skill.id)).map(skill => (
                                                                <button
                                                                    key={skill.id}
                                                                    onClick={() => toggleSkill(skill.id)}
                                                                    className="group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-left text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-500 transition-colors">add</span>
                                                                    {skill.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-6 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                                                            {skillSearch ? `${t('step3.noSkillsFound')} "${skillSearch}"` : t('step3.allSkillsSelected')}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Skills Tags */}
                                        {selectedSkillIds.length > 0 && (
                                            <div className="flex flex-col gap-2 pt-2">
                                                <div className="flex items-center justify-between ps-1">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('step3.selectedSkills')} ({selectedSkillIds.length})</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedSkillIds([]); }}
                                                        className="text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                                                        {t('step3.clearAll')}
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pt-1 w-full">
                                                    {selectedSkillIds.map(id => {
                                                        const skill = availableSkills.find(s => s.id === id);
                                                        if (!skill) return null;
                                                        return (
                                                            <div key={id} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50/80 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-[13px] font-medium shadow-sm animate-in fade-in zoom-in duration-200">
                                                                <span>{skill.name}</span>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); toggleSkill(id); }}
                                                                    className="hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md p-0.5 ms-0.5 transition-colors focus:outline-none flex items-center justify-center text-blue-400 dark:text-blue-500 hover:text-red-500 dark:hover:text-red-400"
                                                                    title={`Remove ${skill.name}`}
                                                                >
                                                                    <span className="material-symbols-outlined text-[15px]">close</span>
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end w-full">
                                            <button type="button" onClick={() => setOpenSection(2)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-colors">{t('step3.continue')}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── PROJECTS SECTION ── */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 w-full shadow-sm">
                            <button onClick={() => setOpenSection(openSection === 2 ? null : 2)} className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 transition-colors ${openSection === 2 ? 'border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${openSection === 2 ? 'text-blue-500' : 'text-slate-500'}`}>folder_open</span>
                                    <span className={`font-bold ${openSection === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{t('step3.projects')}</span>
                                    {projects.length > 0 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">{projects.length} {t('step3.added')}</span>}
                                </div>
                                <span className={`material-symbols-outlined transition-transform duration-300 ${openSection === 2 ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}>expand_more</span>
                            </button>
                            <div style={{ display: 'grid' }} className={`transition-[grid-template-rows,opacity] duration-300 ease-in-out w-full ${openSection === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden w-full">
                                    <div className="p-4 sm:p-8 md:p-10 w-full space-y-4 sm:space-y-6">
                                        {/* Existing projects */}
                                        {projects.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">folder_open</span>
                                                <p className="text-slate-600 dark:text-slate-400 font-medium">{t('step3.noProjects')}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 max-w-sm">{t('step3.showcaseWork')}</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {projects.map(proj => (
                                                    <div key={proj.id} className="group relative flex flex-col gap-3 sm:gap-4 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-all shadow-sm">
                                                        <div className="flex items-start gap-3 w-full">
                                                            {/* Icon Column */}
                                                            <div className="shrink-0 pt-[3px]">
                                                                <span className="material-symbols-outlined text-[20px] text-blue-500">rocket_launch</span>
                                                            </div>

                                                            {/* Content Column */}
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <h4 className="text-slate-800 dark:text-white text-base sm:text-lg font-bold break-words leading-tight mb-2">
                                                                    {proj.title}
                                                                </h4>
                                                                {proj.technologiesUsed && (
                                                                    <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed break-words mt-0.5 mb-3">
                                                                        {proj.technologiesUsed.split(',').map(t => t.trim()).join(', ')}
                                                                    </p>
                                                                )}
                                                                {proj.projectLink && (
                                                                    <a href={proj.projectLink} title={proj.projectLink} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 w-fit transition-colors">
                                                                        <span className="material-symbols-outlined text-[16px]">link</span>
                                                                        <span className="group-hover:underline underline-offset-2">{t('step3.viewProject')}</span>
                                                                    </a>
                                                                )}
                                                            </div>

                                                            {/* Actions Column */}
                                                            <div className="flex items-center gap-0.5 shrink-0 -mt-1 -me-1 ms-auto">
                                                                <button onClick={() => editProject(proj)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all" title="Edit">
                                                                    <span className="material-symbols-outlined text-[18px] sm:text-xl">edit</span>
                                                                </button>
                                                                <button onClick={() => deleteProject(proj.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all" title="Delete">
                                                                    <span className="material-symbols-outlined text-[18px] sm:text-xl">delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Add Project Form */}
                                        {showProjectForm && (
                                            <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 w-full mt-4 sm:mt-6">
                                                <h4 className="text-slate-800 dark:text-white font-semibold flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">add_circle</span> {t('step3.addProject')}
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full">
                                                    <div className="w-full sm:col-span-2">
                                                        <label className={labelClass}>{t('step3.projectTitle')}<span className="text-red-500 ms-1">*</span></label>
                                                        <input className={inputClass} placeholder={t('step3.projectTitlePlaceholder', 'e.g. E-Commerce Platform')} value={projectForm.title} onChange={e => handleProjectChange('title', e.target.value)} />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step3.technologiesUsed')}</label>
                                                        <input className={inputClass} placeholder={t('step3.technologiesUsedPlaceholder', 'e.g. React, Node.js, MongoDB')} value={projectForm.technologiesUsed} onChange={e => handleProjectChange('technologiesUsed', e.target.value)} />
                                                    </div>
                                                    <div className="w-full">
                                                        <label className={labelClass}>{t('step3.projectLink')}</label>
                                                        <input className={inputClass} placeholder={t('step3.projectLinkPlaceholder', 'https://github.com/...')} value={projectForm.projectLink} onChange={e => handleProjectChange('projectLink', e.target.value)} />
                                                    </div>
                                                    <div className="w-full sm:col-span-2">
                                                        <label className={labelClass}>{t('step3.description')}</label>
                                                        <textarea className={baseInputClass + " min-h-[160px] resize-none py-3 custom-scrollbar leading-relaxed"} spellCheck="false" placeholder={t('step3.descriptionPlaceholder', 'Brief description of your project...')} value={projectForm.description} onChange={e => handleProjectChange('description', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-slate-200/80 dark:border-slate-700 w-full">
                                                    <button onClick={() => { setShowProjectForm(false); setProjectForm({ title: '', technologiesUsed: '', description: '', projectLink: '' }); setEditingProjId(null); }} className="w-full sm:w-auto px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shadow-sm">
                                                        {t('step3.cancel')}
                                                    </button>
                                                    <button onClick={saveProject} disabled={savingProject} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
                                                        {savingProject ? t('step3.saving') : (editingProjId ? t('step3.updateProject') : t('step3.saveProject'))}
                                                        {!savingProject && <span className="material-symbols-outlined text-lg">check_circle</span>}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {!showProjectForm && (
                                            <button onClick={() => setShowProjectForm(true)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-transparent py-4 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-blue-600 dark:text-blue-400 hover:border-blue-500/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group">
                                                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined text-xl">add</span>
                                                </div>
                                                <span>{projects.length > 0 ? t('step3.addAnotherProject') : t('step3.addProjectBtn')}</span>
                                            </button>
                                        )}
                                        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end w-full">
                                            <button type="button" onClick={() => setOpenSection(3)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-colors">{t('step3.continue')}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── SOCIAL ACCOUNTS SECTION ── */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 w-full shadow-sm">
                            <button onClick={() => setOpenSection(openSection === 3 ? null : 3)} className={`w-full flex items-center justify-between px-4 sm:px-6 py-4 transition-colors ${openSection === 3 ? 'border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${openSection === 3 ? 'text-blue-500' : 'text-slate-500'}`}>share</span>
                                    <span className={`font-bold ${openSection === 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{t('step3.socialLinks')}</span>
                                </div>
                                <span className={`material-symbols-outlined transition-transform duration-300 ${openSection === 3 ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}>expand_more</span>
                            </button>
                            <div style={{ display: 'grid' }} className={`transition-[grid-template-rows,opacity] duration-300 ease-in-out w-full ${openSection === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden w-full">
                                    <div className="p-4 sm:p-8 md:p-10 w-full">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full">
                                            {SOCIAL_FIELDS.map(field => (
                                                <div key={field.key} className="space-y-1.5">
                                                    <label className={labelClass}>{t(`step3.social.${field.key}`, field.label)}</label>
                                                    <div className="relative">
                                                        <span className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2">
                                                            <i className={`${field.faClass} text-[18px]`} style={{ color: field.brandColor }} />
                                                        </span>
                                                        <input
                                                            className={inputClass + " ps-9"}
                                                            type="url"
                                                            placeholder={t(`step3.socialPlaceholder.${field.key}`, field.placeholder)}
                                                            value={socialForm[field.key]}
                                                            onChange={(e) => handleSocialChange(field.key, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-700 flex flex-col-reverse md:flex-row justify-between items-center gap-4 shadow-sm rounded-xl w-full mt-8">
                    <button onClick={() => navigate('/step-2')} className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
                        <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_back</span> {t('step3.back')}
                    </button>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest hidden sm:inline-block">{t('step3.step4of4')}</span>
                        <button onClick={handleSubmit} disabled={loading} className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                            {loading ? t('step3.submitting') : t('step3.submitProfile')}
                            {!loading && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                        </button>
                    </div>
                </div>
            </div>

        </ProfileSetupLayout>
    );
};

export default Step3;
