import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSetupNavbar from '../../Components/ProfileSetupNavbar.jsx';
import ProfileSidebarStepper from '../../Components/ProfileSidebarStepper.jsx';

const Step3 = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased selection:bg-primary/30 min-h-screen flex flex-col transition-colors duration-200">
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #f1f5f9; 
                }
                ::-webkit-scrollbar-thumb {
                    background: #cbd5e1; 
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #607AFB; 
                }
                .dark ::-webkit-scrollbar-track {
                    background: #0F172A; 
                }
                .dark ::-webkit-scrollbar-thumb {
                    background: #334155; 
                }
                .dark ::-webkit-scrollbar-thumb:hover {
                    background: #475569; 
                }
            `}</style>

            <ProfileSetupNavbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar / Stepper */}
                    <ProfileSidebarStepper currentStep={3} />
                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-8">
                        <div className="border-b border-border-light dark:border-border-dark pb-6">
                            <h2 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Showcase your expertise</h2>
                            <p className="text-text-secondary dark:text-slate-400 text-lg max-w-3xl">Select your top skills and add links to your best work to help recruiters understand your potential.</p>
                        </div>


                        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none overflow-hidden">
                            <div className="p-8 md:p-12 space-y-12">
                                <section>
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                                <span className="material-symbols-outlined text-primary">psychology</span>
                                                Key Skills
                                            </h2>
                                            <p className="text-text-secondary dark:text-slate-400 mt-1">Add at least 3 skills relevant to your role.</p>
                                        </div>
                                    </div>
                                    <div className="relative w-full mb-6">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                                            <span className="material-symbols-outlined">search</span>
                                        </div>
                                        <input className="w-full h-16 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl pl-14 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm dark:shadow-none" placeholder="Type to search skills (e.g. Figma, React, User Research)..." type="text" />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        <div className="lg:col-span-7 space-y-3">
                                            <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Selected Skills</label>
                                            <div className="flex flex-wrap gap-3">
                                                <div className="group flex items-center gap-2 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium hover:border-primary/50 transition-all cursor-default">
                                                    UI Design
                                                    <button className="flex items-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors rounded-full p-0.5"><span className="material-symbols-outlined text-[16px]">close</span></button>
                                                </div>
                                                <div className="group flex items-center gap-2 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium hover:border-primary/50 transition-all cursor-default">
                                                    Figma
                                                    <button className="flex items-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors rounded-full p-0.5"><span className="material-symbols-outlined text-[16px]">close</span></button>
                                                </div>
                                                <div className="group flex items-center gap-2 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium hover:border-primary/50 transition-all cursor-default">
                                                    Prototyping
                                                    <button className="flex items-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors rounded-full p-0.5"><span className="material-symbols-outlined text-[16px]">close</span></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-5 space-y-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-border-dark pt-4 lg:pt-0 lg:pl-8">
                                            <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm text-yellow-500">lightbulb</span> Suggestions
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                <button className="border border-dashed border-slate-300 dark:border-border-dark text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">add</span> Leadership
                                                </button>
                                                <button className="border border-dashed border-slate-300 dark:border-border-dark text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">add</span> Agile
                                                </button>
                                                <button className="border border-dashed border-slate-300 dark:border-border-dark text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">add</span> User Research
                                                </button>
                                                <button className="border border-dashed border-slate-300 dark:border-border-dark text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">add</span> CSS
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px w-full bg-slate-100 dark:bg-border-dark"></div>

                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                                <span className="material-symbols-outlined text-primary">folder_open</span>
                                                Portfolio
                                            </h2>
                                            <p className="text-text-secondary dark:text-slate-400 mt-1">Show us what you've built through links or documents.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-5">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">External Profiles</h3>

                                            <div className="flex items-center gap-3 group">
                                                <div className="size-12 rounded-lg bg-input-group-bg dark:bg-surface-dark flex items-center justify-center border border-border-light dark:border-border-dark shrink-0 group-focus-within:border-primary group-focus-within:bg-white dark:group-focus-within:bg-background-dark transition-all">
                                                    <img alt="LinkedIn Icon" className="w-6 h-6 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD08cJHKppMZxrcjuEXZz4MoG7qHGKp52r5q_n5FuaviO6dSQodb89XEfApo4M93dQwxXCpg6uKBpeVwNEgtYGDuKK6s5SilqEggt7tHbLojIPsoGPl5CATcqNNfKlyt4pq3Zfov9y06BXanTtG_snAhHFfSsV26nXMkiaxmJyT-YfJ_2qZJvgq_HojaEMuYxE1MA3fWiofuS2pHwOf1EzyE5hN33oJa-bwh7xqbcvkiOq9ZH5tjvPwKjC549sT7GQfuBiMswH7sva5" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="sr-only">LinkedIn URL</label>
                                                    <input className="w-full rounded-lg border border-border-light dark:border-border-dark bg-input-bg dark:bg-background-dark text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-12 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="LinkedIn URL" type="text" defaultValue="linkedin.com/in/johndoe" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 group">
                                                <div className="size-12 rounded-lg bg-input-group-bg dark:bg-surface-dark flex items-center justify-center border border-border-light dark:border-border-dark shrink-0 group-focus-within:border-primary group-focus-within:bg-white dark:group-focus-within:bg-background-dark transition-all">
                                                    <img alt="Behance Icon" className="w-6 h-6 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUqOGYpirGMj9Iq0NIVJazNtaZPm5cafc-MzITq6svYzreHLqyS746bBehJ90zAWnFFWc2rWMoDZy1V21BeY2J91xokYiMD-JOnha1PxBZrUAy5EPWlfdYom_fAcb7K0c671fdCiyJ2MeC_dawajOoCkoJJL9556iuDUaVGpslpFZObfwXbtVV8-XCEPEiqQtmbcH3VKPalmTupGw-5fiHGIzFEScXVhrWinXWRJNTTtKsSTCrH93bBM6-CBkICsv25uv6fb51RJ8a" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="sr-only">Behance URL</label>
                                                    <input className="w-full rounded-lg border border-border-light dark:border-border-dark bg-input-bg dark:bg-background-dark text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-12 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Behance URL" type="text" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 group">
                                                <div className="size-12 rounded-lg bg-input-group-bg dark:bg-surface-dark flex items-center justify-center border border-border-light dark:border-border-dark shrink-0 group-focus-within:border-primary group-focus-within:bg-white dark:group-focus-within:bg-background-dark transition-all">
                                                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary">link</span>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="sr-only">Personal Website</label>
                                                    <input className="w-full rounded-lg border border-border-light dark:border-border-dark bg-input-bg dark:bg-background-dark text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-12 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Personal Website URL" type="text" />
                                                </div>
                                            </div>

                                            <button className="text-left text-primary font-medium text-sm flex items-center gap-2 mt-2 hover:text-blue-700 transition-colors w-fit px-1">
                                                <span className="material-symbols-outlined text-[18px]">add_circle</span> Add another link
                                            </button>
                                        </div>

                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Resume & Documents</h3>
                                            <div className="relative group cursor-pointer flex-1 min-h-[240px]">
                                                <input className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" />
                                                <div className="h-full border-2 border-dashed border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-background-dark/50 rounded-xl p-8 flex flex-col items-center justify-center text-center group-hover:bg-slate-100 dark:group-hover:bg-background-dark group-hover:border-primary transition-all duration-300">
                                                    <div className="size-16 rounded-full bg-white dark:bg-surface-dark shadow-sm dark:shadow-none border border-slate-100 dark:border-border-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                                                        <span className="material-symbols-outlined text-3xl text-primary/70 group-hover:text-primary">cloud_upload</span>
                                                    </div>
                                                    <p className="text-slate-900 dark:text-white text-lg font-medium">Drag & drop files here</p>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-6">or click to browse your computer</p>
                                                    <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark px-3 py-1 rounded-full">
                                                        <span className="material-symbols-outlined text-xs">description</span> PDF, DOCX, JPG (Max 5MB)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark p-6 md:px-12 md:py-8 border-t border-border-light dark:border-border-dark flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-8 rounded-b-2xl">
                            <button
                                onClick={() => navigate('/step-2')}
                                className="w-full md:w-auto px-8 py-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-background-dark hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm dark:shadow-none"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span> Back
                            </button>
                            <div className="flex w-full md:w-auto gap-4">
                                <button
                                    onClick={() => navigate('/employee')}
                                    className="w-full md:w-auto px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                <p>© 2026 JobPlatform Inc. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Step3;
