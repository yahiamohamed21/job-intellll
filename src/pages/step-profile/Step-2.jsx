import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSetupLayout from '../../Components/ProfileSetupLayout.jsx';

const Step2 = () => {
    const navigate = useNavigate();

    const customStyles = `
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark ::-webkit-scrollbar-track { background: #0F172A; }
        .dark ::-webkit-scrollbar-thumb { background: #334155; }
        .dark ::-webkit-scrollbar-thumb:hover { background: #475569; }
        .toggle-checkbox:checked { right: 0; border-color: #ff7a00; }
        .toggle-checkbox:checked + .toggle-label { background-color: rgba(255, 122, 0, 0.2); border-color: #ff7a00; }
        .toggle-checkbox { right: 2px; transition: all 0.3s; }
        .dark .toggle-checkbox:not(:checked) { border-color: #334155; }
    `;

    return (
        <ProfileSetupLayout currentStep={2} customStyles={customStyles}>
            <div className="space-y-6">
                <div className="border-b border-border-light dark:border-border-dark pb-6">
                    <h2 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Work &amp; Education</h2>
                    <p className="text-text-secondary dark:text-slate-400 text-lg max-w-3xl">Please provide details about your professional background and educational history. This helps us match you with the right opportunities.</p>
                </div>

                <section className="bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm dark:shadow-none overflow-hidden">
                    <div className="px-8 py-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-sm dark:shadow-none">
                                <span className="material-symbols-outlined">work</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white">Work Experience</h3>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid gap-4">
                            <div className="group relative flex flex-col md:flex-row md:items-center gap-6 bg-white dark:bg-background-dark rounded-xl p-5 border border-border-light dark:border-border-dark hover:border-primary/50 transition-all cursor-pointer shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                                    <span className="material-symbols-outlined text-2xl">design_services</span>
                                </div>
                                <div className="flex flex-col justify-center flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-text-main dark:text-white text-lg font-bold truncate">Senior Product Designer</h4>
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">Current</span>
                                    </div>
                                    <p className="text-text-secondary dark:text-slate-400 text-base">TechFlow Inc. • San Francisco, CA</p>
                                    <p className="text-text-secondary/70 dark:text-slate-500 text-sm mt-1">Jan 2021 - Present</p>
                                </div>
                                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 rounded-lg text-text-secondary dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors" title="Edit">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button className="p-2 rounded-lg text-text-secondary dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-border-dark bg-transparent py-4 text-sm font-medium text-text-secondary dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-background-dark hover:text-primary hover:border-primary/50 transition-all group">
                            <div className="size-8 rounded-full bg-slate-100 dark:bg-surface-dark flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-xl">add</span>
                            </div>
                            <span>Add another position</span>
                        </button>
                    </div>
                </section>

                <section className="bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm dark:shadow-none overflow-hidden">
                    <div className="px-8 py-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-sm dark:shadow-none">
                                <span className="material-symbols-outlined">school</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white">Education</h3>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="bg-white dark:bg-background-dark rounded-xl p-8 border border-border-light dark:border-border-dark">
                            <h4 className="text-text-main dark:text-white font-semibold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">add_circle</span>
                                Add Education Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-text-main dark:text-slate-300 mb-2">School / University</label>
                                    <input className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark text-text-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors shadow-sm dark:shadow-none" placeholder="e.g. Stanford University" type="text" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-text-main dark:text-slate-300 mb-2">Degree</label>
                                    <input className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark text-text-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors shadow-sm dark:shadow-none" placeholder="e.g. Bachelor's" type="text" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-text-main dark:text-slate-300 mb-2">Field of Study</label>
                                    <input className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark text-text-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors shadow-sm dark:shadow-none" placeholder="e.g. Computer Science" type="text" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-text-main dark:text-slate-300 mb-2">Start Date</label>
                                    <div className="relative">
                                        <input className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark text-text-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors shadow-sm dark:shadow-none" placeholder="MM/YYYY" type="text" />
                                        <span className="material-symbols-outlined absolute right-3 top-3 text-text-secondary dark:text-slate-400 pointer-events-none text-xl">calendar_today</span>
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-text-main dark:text-slate-300 mb-2">End Date (or expected)</label>
                                    <div className="relative">
                                        <input className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark text-text-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 transition-colors shadow-sm dark:shadow-none" placeholder="MM/YYYY" type="text" />
                                        <span className="material-symbols-outlined absolute right-3 top-3 text-text-secondary dark:text-slate-400 pointer-events-none text-xl">calendar_today</span>
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 pt-2 flex items-center gap-3 bg-white dark:bg-background-dark p-3 w-fit">
                                    <div className="relative inline-block w-11 h-6 align-middle select-none transition duration-200 ease-in">
                                        <input className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-slate-300 appearance-none cursor-pointer peer checked:right-0 right-5 top-0.5 transition-all duration-300 checked:border-primary" id="edu-toggle" name="toggle" type="checkbox" />
                                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-200 dark:bg-surface-dark border border-slate-300 dark:border-border-dark cursor-pointer peer-checked:bg-primary/20 peer-checked:border-primary transition-colors" htmlFor="edu-toggle"></label>
                                    </div>
                                    <label className="text-text-main dark:text-slate-300 text-sm font-medium cursor-pointer select-none" htmlFor="edu-toggle">I am currently studying here</label>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border-light dark:border-border-dark">
                                <button className="px-6 py-2.5 text-sm font-medium text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white transition-colors">Cancel</button>
                                <button className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">check</span>
                                    Save Education
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="bg-white dark:bg-surface-dark p-6 md:px-10 md:py-6 border border-border-light dark:border-border-dark flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-8 rounded-2xl shadow-sm dark:shadow-none">
                    <button
                        onClick={() => navigate('/step-1')}
                        className="w-full md:w-auto px-8 py-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-background-dark hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm dark:shadow-none"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span> Back
                    </button>
                    <button
                        onClick={() => navigate('/step-3')}
                        className="w-full md:w-auto px-8 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                        Next Step
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                </div>
            </div>
        </ProfileSetupLayout>
    );
};

export default Step2;
