import React from 'react';

export default function LogoIcon({ className = "w-10 h-10" }) {
    return (
        <>
            <img
                src="/logo/logo_light.png"
                alt="Job Intel Logo"
                className={`${className} block dark:hidden object-contain`}
            />
            <img
                src="/logo/logo_dark.png"
                alt="Job Intel Logo"
                className={`${className} hidden dark:block object-contain`}
            />
        </>
    );
}
