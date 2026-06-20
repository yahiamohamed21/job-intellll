import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const SearchableSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder = 'Select...', 
    searchPlaceholder = 'Search...',
    className = '',
    disabled = false
}) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const listContainerRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    // Find the selected option to display its label
    const selectedOption = options.find(opt => opt.value === value) || null;

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt => 
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    // Reset highlighted index when searching
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchTerm, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside the wrapper AND outside the portal list
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                if (listContainerRef.current && !listContainerRef.current.contains(event.target)) {
                    setIsOpen(false);
                    setSearchTerm('');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Portal coordinates & Collision Detection
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if (isOpen && wrapperRef.current) {
            const updateCoords = () => {
                const rect = wrapperRef.current.getBoundingClientRect();
                setCoords({
                    left: rect.left + window.scrollX,
                    top: rect.bottom + window.scrollY + 4,
                    width: rect.width
                });
            };
            updateCoords();
            window.addEventListener('resize', updateCoords);
            return () => window.removeEventListener('resize', updateCoords);
        }
    }, [isOpen]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && listRef.current && highlightedIndex >= 0) {
            const liElements = listRef.current.querySelectorAll('li[role="option"]');
            const targetLi = liElements[highlightedIndex];
            if (targetLi) {
                targetLi.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    // Handle opening and scroll position for selected item initially
    useEffect(() => {
        if (isOpen && listRef.current && selectedOption && highlightedIndex === -1) {
            setTimeout(() => {
                const selectedEl = listRef.current.querySelector('[data-selected="true"]');
                if (selectedEl) {
                    selectedEl.scrollIntoView({ block: 'nearest' });
                }
            }, 10);
        }
    }, [isOpen, selectedOption, highlightedIndex]);

    const handleSelect = useCallback((optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
    }, [onChange]);

    // Keyboard Navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                if (!disabled) setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                } else if (filteredOptions.length === 1) {
                    handleSelect(filteredOptions[0].value);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
            default:
                // Focus search input when typing
                if (inputRef.current) inputRef.current.focus();
                break;
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full" onKeyDown={handleKeyDown} tabIndex={0} style={{ outline: 'none' }}>
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
                    rounded-lg px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                    outline-none transition-all shadow-sm h-12 flex items-center justify-between cursor-pointer
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : 'hover:border-slate-300 dark:hover:border-slate-600'}
                    ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}
                    ${className}
                `}
            >
                <span className={`truncate ${!selectedOption ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="material-symbols-outlined text-slate-400 text-xl transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                </span>
            </div>

            {isOpen && coords && createPortal(
                <div 
                    ref={listContainerRef}
                    className={`absolute z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-200 slide-in-from-top-2`}
                    style={{
                        top: coords.top,
                        left: coords.left,
                        width: coords.width
                    }}
                    dir={i18n.dir()} // Ensure RTL text alignment works inside portal
                >
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700/50">
                        <div className="relative">
                            <span className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
                            <input
                                ref={inputRef}
                                type="text"
                                autoFocus
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg ps-9 pe-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 outline-none placeholder-slate-400"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <ul ref={listRef} className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {filteredOptions.length === 0 ? (
                            <li className="py-3 px-4 text-sm text-center text-slate-500 dark:text-slate-400">
                                {t('step1.noResults', 'No results found')}
                            </li>
                        ) : (
                            filteredOptions.map((opt, index) => (
                                <li
                                    key={opt.value}
                                    role="option"
                                    data-selected={opt.value === value}
                                    onClick={() => handleSelect(opt.value)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`
                                        flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors
                                        ${index === highlightedIndex && opt.value !== value ? 'bg-slate-100 dark:bg-slate-700/80' : ''}
                                        ${opt.value === value 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }
                                    `}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {opt.value === value && (
                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SearchableSelect;
