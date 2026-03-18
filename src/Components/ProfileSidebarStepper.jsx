import React from 'react';

export default function ProfileSidebarStepper({ currentStep }) {
    const steps = [
        { id: 1, name: 'Personal Info' },
        { id: 2, name: 'Experience' },
        { id: 3, name: 'Review & Submit' },
    ];

    return (
        <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 px-2 py-4">
                <nav aria-label="Progress">
                    <ol role="list" className="overflow-hidden">
                        {steps.map((step, stepIdx) => {
                            const isCompleted = step.id < currentStep;
                            const isCurrent = step.id === currentStep;
                            const isUpcoming = step.id > currentStep;

                            return (
                                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pb-12' : ''}`}>
                                    {/* Line connecting steps */}
                                    {stepIdx !== steps.length - 1 ? (
                                        <div
                                            className={`absolute top-[35px]  right-[15px] bottom-[-4px] w-0.5 rounded-full ${isCompleted ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                            aria-hidden="true"
                                        ></div>
                                    ) : null}

                                    <div className="relative flex items-start group">
                                        <span className="h-9 flex items-center">
                                            {isCompleted ? (
                                                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-primary rounded-full shadow-sm">
                                                    <span className="material-symbols-outlined text-white text-[18px] font-bold">check</span>
                                                </span>
                                            ) : isCurrent ? (
                                                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-transparent border-[2px] border-primary rounded-full shadow-sm">
                                                    <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                                                </span>
                                            ) : (
                                                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-transparent border-[2px] border-slate-300 dark:border-slate-600 rounded-full"></span>
                                            )}
                                        </span>
                                        <span className="ml-4 min-w-0 flex flex-col pt-1">
                                            <span className={`text-[15px] ${isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-slate-500 font-semibold'}`}>
                                                {step.name}
                                            </span>
                                            <span className={`text-sm mt-0.5 ${isCurrent ? 'text-slate-400 dark:text-slate-400 font-medium' : isCompleted ? 'text-slate-500 dark:text-slate-400 font-medium' : 'text-slate-400 dark:text-slate-500 font-medium'}`}>
                                                {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
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
