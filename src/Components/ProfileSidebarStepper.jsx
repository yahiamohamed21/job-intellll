import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ProfileSidebarStepper({ currentStep }) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const steps = [
        { id: 0, name: t('stepper.resumeUpload'), path: '/step-0' },
        { id: 1, name: t('stepper.personalInfo'), path: '/step-1' },
        { id: 2, name: t('stepper.experience'), path: '/step-2' },
        { id: 3, name: t('stepper.reviewSubmit'), path: '/step-3' },
    ];

    const handleNavigation = (stepId, path) => {
        // Allow navigation only to completed or current steps
        if (stepId <= currentStep) {
            navigate(path);
        }
    };

    return (
        <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 px-2 py-4">
                <nav aria-label="Progress">
                    <ol role="list" className="overflow-hidden">
                        {steps.map((step, stepIdx) => {
                            const isCompleted = step.id < currentStep;
                            const isCurrent = step.id === currentStep;
                            const isUpcoming = step.id > currentStep;
                            const isInteractive = isCompleted || isCurrent;

                            return (
                                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pb-10' : ''}`}>
                                    {/* Line connecting steps */}
                                    {stepIdx !== steps.length - 1 ? (
                                        <div
                                            className={`absolute top-[34px] ltr:left-[15px] rtl:right-[15px] bottom-[-8px] w-0.5 rounded-full transition-colors duration-300 ${isCompleted ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                            aria-hidden="true"
                                        ></div>
                                    ) : null}

                                    <div
                                        className={`relative flex items-start gap-4 group ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
                                        onClick={() => handleNavigation(step.id, step.path)}
                                        title={isInteractive ? `Go to ${step.name}` : ''}
                                    >
                                        <span className="h-8 flex items-center justify-center shrink-0">
                                            {isCompleted ? (
                                                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-blue-600 dark:bg-blue-500 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110">
                                                    <span className="material-symbols-outlined text-white text-[18px] font-bold">check</span>
                                                </span>
                                            ) : isCurrent ? (
                                                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border-[2.5px] border-blue-600 dark:border-blue-500 rounded-full shadow-sm ring-4 ring-blue-50 dark:ring-blue-900/20">
                                                    <span className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-full"></span>
                                                </span>
                                            ) : (
                                                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-transparent border-2 border-slate-300 dark:border-slate-600 rounded-full transition-colors duration-300 group-hover:border-slate-400 dark:group-hover:border-slate-500"></span>
                                            )}
                                        </span>

                                        <span className="min-w-0 flex flex-col pt-0.5 text-start">
                                            <span className={`text-[15px] transition-colors duration-300 ${isCurrent ? 'text-blue-600 dark:text-blue-400 font-bold' : isCompleted ? 'text-slate-800 dark:text-white font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400' : 'text-slate-400 dark:text-slate-500 font-medium group-hover:text-slate-500 dark:group-hover:text-slate-400'}`}>
                                                {step.name}
                                            </span>
                                            <span className={`text-xs sm:text-sm mt-0.5 transition-colors duration-300 ${isCurrent ? 'text-slate-500 dark:text-slate-400 font-medium' : isCompleted ? 'text-slate-500 dark:text-slate-400 font-medium' : 'text-slate-400 dark:text-slate-600 font-medium'}`}>
                                                {isCompleted ? t('stepper.completed') : isCurrent ? t('stepper.inProgress') : t('stepper.pending')}
                                            </span>
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            </div>
        </div>
    );
}
