import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface SearchableOption {
    value: string;
    label: string;
    subLabel?: string;
    badge?: string;
    badgeColor?: string;
    icon?: string;
}

interface SearchableDropdownProps {
    options: SearchableOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    allOption?: { value: string; label: string };
    icon?: string;
    width?: string | number;
    maxWidth?: string | number;
    style?: React.CSSProperties;
    disabled?: boolean;
    clearable?: boolean;
    compact?: boolean;
    required?: boolean;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'নির্বাচন করুন...',
    searchPlaceholder = 'অনুসন্ধান করুন...',
    allOption,
    icon,
    width = 'auto',
    maxWidth,
    style,
    disabled = false,
    clearable = false,
    compact = false,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Combine allOption with regular options
    const fullOptions = useMemo(() => {
        if (allOption) {
            return [
                {
                    value: allOption.value,
                    label: allOption.label,
                    icon: '🌐'
                },
                ...options
            ];
        }
        return options;
    }, [allOption, options]);

    // Current selected option
    const selectedOption = useMemo(() => {
        return fullOptions.find(o => o.value === value);
    }, [fullOptions, value]);

    // Filtered options based on search query
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return fullOptions;
        const term = searchTerm.toLowerCase().trim();
        return fullOptions.filter(opt => {
            const labelMatch = (opt.label || '').toLowerCase().includes(term);
            const subLabelMatch = (opt.subLabel || '').toLowerCase().includes(term);
            const valueMatch = (opt.value || '').toLowerCase().includes(term);
            const badgeMatch = (opt.badge || '').toLowerCase().includes(term);
            return labelMatch || subLabelMatch || valueMatch || badgeMatch;
        });
    }, [fullOptions, searchTerm]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setHighlightedIndex(0);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 60);
        }
    }, [isOpen]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && listRef.current && highlightedIndex >= 0) {
            const listItems = listRef.current.querySelectorAll('[data-dropdown-item]');
            const item = listItems[highlightedIndex] as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredOptions[highlightedIndex]) {
                handleSelect(filteredOptions[highlightedIndex].value);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (allOption) {
            onChange(allOption.value);
        } else {
            onChange('');
        }
    };

    return (
        <div
            ref={dropdownRef}
            style={{
                position: 'relative',
                display: 'inline-block',
                width: width,
                maxWidth: maxWidth,
                ...style
            }}
            onKeyDown={handleKeyDown}
        >
            {/* Hidden native input for form compatibility */}
            <input
                type="hidden"
                value={value}
                required={required}
            />

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    padding: compact ? '5px 8px' : '7px 11px',
                    fontSize: compact ? '.82rem' : '.85rem',
                    fontWeight: 500,
                    lineHeight: 1.3,
                    borderRadius: '6px',
                    border: isOpen
                        ? '1px solid var(--accent, #0E6B66)'
                        : '1px solid var(--line, #d1d5db)',
                    background: 'var(--surface, #ffffff)',
                    color: selectedOption ? 'var(--ink, #1f2937)' : 'var(--muted, #6b7280)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    boxShadow: isOpen
                        ? '0 0 0 2px rgba(14, 107, 102, 0.18)'
                        : '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'border-color .15s, box-shadow .15s',
                    textAlign: 'left'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flex: 1 }}>
                    {icon && <span style={{ fontSize: '.9rem', flexShrink: 0 }}>{icon}</span>}
                    {selectedOption?.icon && <span style={{ fontSize: '.88rem', flexShrink: 0 }}>{selectedOption.icon}</span>}
                    <span
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: selectedOption ? 600 : 400
                        }}
                    >
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.badge && (
                        <span
                            style={{
                                fontSize: '.72rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: selectedOption.badgeColor || 'var(--accent-soft, #e0f2fe)',
                                color: 'var(--ink, #0369a1)',
                                fontWeight: 600,
                                flexShrink: 0
                            }}
                        >
                            {selectedOption.badge}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {clearable && selectedOption && selectedOption.value !== (allOption?.value || '') && (
                        <span
                            onClick={handleClear}
                            title="ক্লিয়ার করুন"
                            style={{
                                padding: '1px 4px',
                                fontSize: '.75rem',
                                color: 'var(--muted, #9ca3af)',
                                cursor: 'pointer',
                                borderRadius: '50%'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted, #9ca3af)')}
                        >
                            ✕
                        </span>
                    )}
                    <span
                        style={{
                            fontSize: '.75rem',
                            color: 'var(--muted, #64748b)',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform .18s ease'
                        }}
                    >
                        ▾
                    </span>
                </div>
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        minWidth: typeof width === 'number' && width < 220 ? '240px' : '100%',
                        zIndex: 1060,
                        background: 'var(--surface, #ffffff)',
                        border: '1px solid var(--line, #cbd5e1)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        animation: 'fadeInScale .14s ease-out'
                    }}
                >
                    {/* Live Search Input Header */}
                    <div
                        style={{
                            padding: '8px 10px',
                            borderBottom: '1px solid var(--line, #e2e8f0)',
                            background: 'var(--surface2, #f8fafc)',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <span
                            style={{
                                position: 'absolute',
                                left: '18px',
                                fontSize: '.84rem',
                                color: 'var(--muted, #94a3b8)',
                                pointerEvents: 'none'
                            }}
                        >
                            🔍
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value);
                                setHighlightedIndex(0);
                            }}
                            style={{
                                width: '100%',
                                padding: '6px 8px 6px 28px',
                                fontSize: '.84rem',
                                borderRadius: '5px',
                                border: '1px solid var(--line, #cbd5e1)',
                                background: 'var(--surface, #ffffff)',
                                color: 'var(--ink, #1e293b)',
                                outline: 'none'
                            }}
                            onFocus={e => (e.target.style.borderColor = 'var(--accent, #0E6B66)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--line, #cbd5e1)')}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    inputRef.current?.focus();
                                }}
                                style={{
                                    position: 'absolute',
                                    right: '18px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '.8rem',
                                    color: 'var(--muted, #94a3b8)'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <div
                        ref={listRef}
                        style={{
                            maxHeight: '230px',
                            overflowY: 'auto',
                            padding: '4px'
                        }}
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = opt.value === value;
                                const isHighlighted = idx === highlightedIndex;

                                return (
                                    <div
                                        key={opt.value}
                                        data-dropdown-item
                                        onClick={() => handleSelect(opt.value)}
                                        onMouseEnter={() => setHighlightedIndex(idx)}
                                        style={{
                                            padding: '7px 9px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '8px',
                                            background: isHighlighted
                                                ? 'var(--surface2, #f1f5f9)'
                                                : isSelected
                                                ? 'var(--accent-soft, #e6f4f2)'
                                                : 'transparent',
                                            color: isSelected ? 'var(--accent, #0E6B66)' : 'var(--ink, #1e293b)',
                                            transition: 'background .1s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {opt.icon && <span style={{ fontSize: '.88rem' }}>{opt.icon}</span>}
                                                <span
                                                    style={{
                                                        fontSize: '.84rem',
                                                        fontWeight: isSelected ? 700 : 500,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {opt.label}
                                                </span>
                                            </div>
                                            {opt.subLabel && (
                                                <span
                                                    style={{
                                                        fontSize: '.74rem',
                                                        color: 'var(--muted, #64748b)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        paddingLeft: opt.icon ? '18px' : '0'
                                                    }}
                                                >
                                                    {opt.subLabel}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                            {opt.badge && (
                                                <span
                                                    style={{
                                                        fontSize: '.72rem',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        background: opt.badgeColor || '#f1f5f9',
                                                        color: '#475569',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {opt.badge}
                                                </span>
                                            )}
                                            {isSelected && (
                                                <span
                                                    style={{
                                                        fontSize: '.88rem',
                                                        color: 'var(--accent, #0E6B66)',
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div
                                style={{
                                    padding: '18px 12px',
                                    textAlign: 'center',
                                    fontSize: '.82rem',
                                    color: 'var(--muted, #94a3b8)'
                                }}
                            >
                                কোনো ফলাফল পাওয়া যায়নি
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
