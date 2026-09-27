import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface SearchableOption {
    value: string;
    label: string;
    subtext?: string;
}

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SearchableOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    allowCustom?: boolean;
    className?: string;
    id?: string;
}

export default function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = 'Select an option...',
    searchPlaceholder = 'Search...',
    allowCustom = false,
    className = '',
    id,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        } else if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.subtext && opt.subtext.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const selectedOption = options.find((opt) => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : (value || placeholder);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleCustomUse = () => {
        if (searchTerm.trim()) {
            onChange(searchTerm.trim());
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`} id={id}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-left px-3 py-2 text-xs sm:text-sm rounded-xl border transition-all cursor-pointer bg-white ${
                    isOpen
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-300 hover:border-slate-400'
                }`}
            >
                <span className={`truncate font-medium ${selectedOption || value ? 'text-slate-900' : 'text-slate-400'}`}>
                    {displayLabel}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Search Field */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (filteredOptions.length > 0) {
                                            handleSelect(filteredOptions[0].value);
                                        } else if (allowCustom && searchTerm.trim()) {
                                            handleCustomUse();
                                        }
                                    } else if (e.key === 'Escape') {
                                        setIsOpen(false);
                                    }
                                }}
                                placeholder={searchPlaceholder}
                                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-52 overflow-y-auto p-1 divide-y divide-slate-50 text-xs">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = opt.value === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition cursor-pointer ${
                                            isSelected
                                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                    >
                                        <div className="truncate pr-2">
                                            <div className="truncate">{opt.label}</div>
                                            {opt.subtext && (
                                                <div className="text-[10px] text-slate-400 truncate mt-0.5">{opt.subtext}</div>
                                            )}
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-3 px-3 text-center text-xs text-slate-500">
                                {allowCustom && searchTerm.trim() ? (
                                    <button
                                        type="button"
                                        onClick={handleCustomUse}
                                        className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg text-left truncate flex items-center gap-1.5"
                                    >
                                        <span>Use custom:</span>
                                        <strong className="truncate">"{searchTerm}"</strong>
                                    </button>
                                ) : (
                                    <span>No matches found</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
