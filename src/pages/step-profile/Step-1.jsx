import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSetupLayout from '../../Components/ProfileSetupLayout.jsx';

const Step1 = () => {
    const navigate = useNavigate();

    return (
        <ProfileSetupLayout currentStep={1}>
            <div className="space-y-6">
                <div className="border-b border-border-light dark:border-border-dark pb-6 mb-8">
                    <h2 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Let's start with the basics</h2>
                    <p className="text-text-secondary dark:text-slate-400 text-lg max-w-3xl">Upload your CV to auto-fill details or enter your information manually below to get started with your application.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Personal Details */}
                    <div className="xl:col-span-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">person</span>
                                <h3 className="text-text-main dark:text-white font-bold text-lg">Personal Details</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-white dark:bg-surface-dark px-3 py-1 rounded-full border border-slate-200 dark:border-border-dark">Manual Entry</span>
                        </div>

                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-sm dark:shadow-none flex flex-col sm:flex-row gap-8">
                            {/* Photo */}
                            <div className="flex flex-col items-center gap-3 w-full md:w-32 shrink-0">
                                <div className="relative size-28 rounded-full overflow-hidden bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark group cursor-pointer hover:border-primary transition-all shadow-sm dark:shadow-none">
                                    <img alt="User profile placeholder" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDG-uXDJsI279hm6j_a5p5T9f3vf1rXbXPWgpXMeckz0Nz6poJVqR6ns5RoWlCwdQdSz0gaigiPNWxwjxsqSA0tbnA1ixyBZgUVJ5k4_CdktToP1WrdjWMsQJrEpxN-55gpIXkhnkK6WmTDXOGRYYXK_zRXED5bPOq26_EkOVUJvS-ET8r3Vt7TlPDcT88ieMRyplLFUajgNUhALXByU5OMzqA6XnElMVJwbWnPZH4SXOA1WCoiIAYd17QzWJHpTg3U6CdlNV8WsFv" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 dark:bg-black/40 group-hover:bg-black/20 dark:group-hover:bg-black/60 transition-colors">
                                        <span className="material-symbols-outlined text-white text-2xl drop-shadow-sm mb-1">camera_alt</span>
                                    </div>
                                    <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" type="file" />
                                </div>
                                <div className="text-center">
                                    <button className="text-primary text-xs font-bold hover:text-primary-dark transition-colors">Change Photo</button>
                                    <p className="text-[10px] text-text-muted dark:text-slate-400 mt-0.5">Max 2MB</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="flex-1 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" type="text" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">mail</span>
                                            <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" placeholder="alex@example.com" type="email" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Phone Number</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">call</span>
                                            <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" type="tel" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Job Title</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">work</span>
                                            <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" type="text" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Current Company</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" placeholder="e.g. Senior Product Des" type="text" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Country</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">location_on</span>
                                            <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg pl-9 pr-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" type="text" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">City</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" type="text" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">First Language</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" type="text" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Proficiency</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" type="text" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Second Language</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" type="text" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Proficiency</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary outline-none transition-all shadow-sm dark:shadow-none" type="text" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1.5 pt-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Bio / Summary</label>
                                        <textarea className="w-full bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-3 text-sm text-text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 h-24 focus:border-primary outline-none transition-all resize-none shadow-sm dark:shadow-none" placeholder="Tell us a bit about yourself..."></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="xl:col-span-4">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary text-xl">description</span>
                            <h3 className="text-text-main dark:text-white font-bold text-lg">Resume / CV</h3>
                        </div>
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-border-light dark:border-border-dark shadow-sm dark:shadow-none h-full xl:h-[calc(100%-2.5rem)] flex flex-col">
                            <div className="relative group cursor-pointer w-full flex-1 min-h-[260px] flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-border-dark px-6 py-8 transition-colors hover:border-primary/50 bg-slate-50/50 dark:bg-background-dark/50">
                                <div className="bg-white dark:bg-surface-dark p-3 rounded-full shadow-sm dark:shadow-none border border-slate-100 dark:border-border-dark group-hover:scale-110 transition-transform duration-300">
                                    <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-text-main dark:text-white font-bold">Upload Resume</p>
                                    <p className="text-text-muted dark:text-slate-400 text-xs">PDF, DOCX up to 10MB</p>
                                </div>
                                <span className="text-[10px] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 font-bold mt-2">Auto-fills details</span>
                                <input accept=".pdf,.docx,.doc" className="absolute inset-0 opacity-0 cursor-pointer" type="file" />
                            </div>
                            <div className="mt-5 pt-5 border-t border-border-light dark:border-border-dark">
                                <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-text-muted dark:text-slate-400 text-[16px] mt-0.5">info</span>
                                    <p className="text-xs text-text-muted dark:text-slate-400 leading-relaxed">
                                        Uploading your CV will automatically parse your information into the fields on the right. You can always edit them manually.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="bg-white dark:bg-surface-dark p-6 md:px-10 md:py-6 border border-border-light dark:border-border-dark flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-8 rounded-2xl shadow-sm dark:shadow-none">
                    <button
                        onClick={() => navigate('/employee')}
                        className="w-full md:w-auto px-8 py-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-background-dark hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm dark:shadow-none"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span> Back
                    </button>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium hidden sm:inline-block">Step 1 of 3</span>
                        <button
                            onClick={() => navigate('/step-2')}
                            className="w-full md:w-auto px-8 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                            Next Step
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </ProfileSetupLayout>
    );
};

export default Step1;
