const fs = require('fs');

const files = [
    'src/pages/step-profile/Step-1.jsx',
    'src/pages/step-profile/Step-2.jsx',
    'src/pages/step-profile/Step-3.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Prevent double application by stripping out existing dark: classes we're about to add
    content = content.replace(/ dark:\S+/g, '');

    const replacements = [
        { from: 'bg-background-light', to: 'bg-background-light dark:bg-background-dark' },
        { from: 'text-text-main', to: 'text-text-main dark:text-white' },
        { from: 'text-text-secondary', to: 'text-text-secondary dark:text-slate-300' },
        { from: 'text-text-muted', to: 'text-text-muted dark:text-slate-400' },
        { from: 'text-text-tertiary', to: 'text-text-tertiary dark:text-slate-500' },
        { from: 'bg-surface-light', to: 'bg-surface-light dark:bg-surface-dark' },
        { from: 'bg-slate-50', to: 'bg-slate-50 dark:bg-[#151b2b]' },
        { from: 'bg-slate-100', to: 'bg-slate-100 dark:bg-[#151b2b]' },
        { from: 'border-border-light', to: 'border-border-light dark:border-border-dark' },
        { from: 'border-slate-200', to: 'border-slate-200 dark:border-border-dark' },
        { from: 'border-slate-300', to: 'border-slate-300 dark:border-border-dark' },
        { from: 'text-slate-600', to: 'text-slate-600 dark:text-slate-300' },
        { from: 'text-slate-500', to: 'text-slate-500 dark:text-slate-400' },
        { from: 'text-slate-400', to: 'text-slate-400 dark:text-slate-500' },
        { from: 'placeholder-slate-400', to: 'placeholder-slate-400 dark:placeholder-slate-500' },
        { from: 'bg-white/80', to: 'bg-white/80 dark:bg-surface-dark/80' },
        { from: 'bg-white/50', to: 'bg-white/50 dark:bg-surface-dark/50' },
        { from: 'shadow-slate-200/50', to: 'shadow-slate-200/50 dark:shadow-none' },
        { from: 'shadow-sm', to: 'shadow-sm dark:shadow-none' },
        { from: 'bg-white', to: 'bg-white dark:bg-surface-dark' },
        { from: 'border-slate-100', to: 'border-slate-100 dark:border-border-dark' },
        { from: 'hover:bg-slate-50', to: 'hover:bg-slate-50 dark:hover:bg-background-dark' },
        { from: 'hover:bg-slate-100', to: 'hover:bg-slate-100 dark:hover:bg-background-dark' },
        { from: 'bg-slate-50/50', to: 'bg-slate-50/50 dark:bg-background-dark/50' }
    ];

    // sort by length descending to prevent partial matches
    replacements.sort((a, b) => b.from.length - a.from.length);

    replacements.forEach(({ from, to }) => {
        const escapedFrom = from.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(?<!dark:)\\b${escapedFrom}\\b`, 'g');
        content = content.replace(regex, to);
    });

    // Inputs/Textareas specific logic
    content = content.replace(/<input([^>]*)bg-white dark:bg-surface-dark([^>]*)>/g, '<input$1bg-white dark:bg-background-dark$2>');
    content = content.replace(/<textarea([^>]*)bg-white dark:bg-surface-dark([^>]*)>/g, '<textarea$1bg-white dark:bg-background-dark$2>');

    fs.writeFileSync(file, content);
});

console.log('Update complete.');
