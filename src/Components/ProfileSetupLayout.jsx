import React from 'react';
import ProfileSetupNavbar from './ProfileSetupNavbar.jsx';
import ProfileSidebarStepper from './ProfileSidebarStepper.jsx';

export default function ProfileSetupLayout({ children, currentStep, customStyles }) {
    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display antialiased selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col transition-colors duration-200">
            {customStyles && <style>{customStyles}</style>}

            <ProfileSetupNavbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar Stepper */}
                    <ProfileSidebarStepper currentStep={currentStep} />

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-6">
                        {children}
                    </div>
                </div>
            </main>

        </div>
    );
}
