import React, { useState, useRef, useEffect } from 'react';
import { Order } from './types';

export interface OrderActionDropdownProps {
    order: Order;
    role?: 'fac' | 'ven';
    onSelectOrder: (orderId: string) => void;
    onOpenAssignModal?: (orderId: string) => void;
    onOpenDeliveryModal?: (orderId: string) => void;
    onUpdateStatus?: (orderId: string, status: 'run' | 'wait' | 'done') => void;
    onOpenQcModal?: (orderId: string) => void;
    onViewQuotations?: (orderDbId: number) => void;
    showToast?: (message: string) => void;
    bn?: (n: number | string) => string;
}

export const OrderActionDropdown: React.FC<OrderActionDropdownProps> = ({
    order,
    role = 'fac',
    onSelectOrder,
    onOpenAssignModal,
    onOpenDeliveryModal,
    onUpdateStatus,
    onOpenQcModal,
    onViewQuotations,
    bn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]),
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuCoords, setMenuCoords] = useState<{ top?: number; bottom?: number; right: number }>({ right: 16 });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const calculatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const menuHeight = role === 'fac' ? 220 : 120;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Position dropdown aligned to the button's right edge
        const right = Math.max(12, window.innerWidth - rect.right);

        if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
            // Open upwards if cramped below
            setMenuCoords({
                bottom: window.innerHeight - rect.top + 6,
                right,
            });
        } else {
            // Open downwards
            setMenuCoords({
                top: rect.bottom + 6,
                right,
            });
        }
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen) {
            calculatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleWindowScroll = (e: Event) => {
            if (menuRef.current && menuRef.current.contains(e.target as Node)) {
                return;
            }
            setIsOpen(false);
        };

        const handleWindowResize = () => {
            setIsOpen(false);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleWindowScroll, true);
        window.addEventListener('resize', handleWindowResize);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleWindowScroll, true);
            window.removeEventListener('resize', handleWindowResize);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const executeAction = (fn?: () => void) => {
        setIsOpen(false);
        if (fn) {
            setTimeout(() => fn(), 10);
        }
    };

    const isRunning = order.status === 'run';
    const isWaiting = order.status === 'wait';
    const isDone = order.status === 'done';

    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            {/* THREE-DOT TRIGGER BUTTON */}
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
                title="অ্যাকশন মেনু"
                aria-label={`অ্যাকশন মেনু - ${order.id}`}
                aria-expanded={isOpen}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    padding: 0,
                    borderRadius: '8px',
                    border: isOpen
                        ? '1.5px solid var(--accent, #16a34a)'
                        : '1px solid var(--line, #cbd5e1)',
                    background: isOpen
                        ? 'rgba(22, 163, 74, 0.08)'
                        : 'var(--surface, #ffffff)',
                    color: isOpen
                        ? 'var(--accent, #16a34a)'
                        : 'var(--ink, #1e293b)',
                    cursor: 'pointer',
                    boxShadow: isOpen
                        ? '0 0 0 3px rgba(22, 163, 74, 0.16)'
                        : '0 1px 2px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                    if (!isOpen) {
                        e.currentTarget.style.borderColor = 'var(--accent, #16a34a)';
                        e.currentTarget.style.background = 'var(--surface2, #f8fafc)';
                    }
                }}
                onMouseLeave={e => {
                    if (!isOpen) {
                        e.currentTarget.style.borderColor = 'var(--line, #cbd5e1)';
                        e.currentTarget.style.background = 'var(--surface, #ffffff)';
                    }
                }}
            >
                {/* SVG Vertical Three Dots */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2.2" />
                    <circle cx="12" cy="12" r="2.2" />
                    <circle cx="12" cy="19" r="2.2" />
                </svg>
            </button>

            {/* DROPDOWN POPOVER MENU */}
            {isOpen && (
                <div
                    ref={menuRef}
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        top: menuCoords.top !== undefined ? `${menuCoords.top}px` : 'auto',
                        bottom: menuCoords.bottom !== undefined ? `${menuCoords.bottom}px` : 'auto',
                        right: `${menuCoords.right}px`,
                        width: '210px',
                        maxWidth: 'calc(100vw - 24px)',
                        maxHeight: 'calc(100vh - 40px)',
                        overflowY: 'auto',
                        background: 'var(--surface, #ffffff)',
                        border: '1px solid var(--line, #e2e8f0)',
                        borderRadius: '10px',
                        boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.16), 0 6px 14px -6px rgba(0, 0, 0, 0.08)',
                        zIndex: 9999,
                        padding: '5px',
                        fontSize: '0.84rem',
                        animation: 'fadeInScale 0.14s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    {/* ACTION ITEMS (CLEAN & COMPACT - TITLES ONLY) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {/* 1. VIEW DETAILS */}
                        <button
                            type="button"
                            className="dropdown-action-btn"
                            onClick={() => executeAction(() => onSelectOrder(order.id))}
                            style={itemButtonStyle}
                            onMouseEnter={e => applyHover(e.currentTarget, true)}
                            onMouseLeave={e => applyHover(e.currentTarget, false)}
                        >
                            <span style={iconWrapStyle}>👁️</span>
                            <span style={{ fontWeight: 500, color: 'var(--ink, #1e293b)' }}>
                                বিস্তারিত দেখুন
                            </span>
                        </button>

                        {/* FACTORY ROLE SPECIFIC ACTIONS */}
                        {role === 'fac' && (
                            <>
                                {/* 2. ASSIGN / CHANGE MACHINES */}
                                {onOpenAssignModal && (
                                    <button
                                        type="button"
                                        className="dropdown-action-btn"
                                        onClick={() => executeAction(() => onOpenAssignModal(order.id))}
                                        style={itemButtonStyle}
                                        onMouseEnter={e => applyHover(e.currentTarget, true)}
                                        onMouseLeave={e => applyHover(e.currentTarget, false)}
                                    >
                                        <span style={iconWrapStyle}>⚙️</span>
                                        <span style={{ fontWeight: 500, color: 'var(--ink, #1e293b)' }}>
                                            মেশিন বরাদ্দ / পরিবর্তন
                                        </span>
                                    </button>
                                )}

                                {/* 3. CREATE DELIVERY CHALLAN */}
                                {onOpenDeliveryModal && (
                                    <button
                                        type="button"
                                        className="dropdown-action-btn"
                                        onClick={() => executeAction(() => onOpenDeliveryModal(order.id))}
                                        style={itemButtonStyle}
                                        onMouseEnter={e => applyHover(e.currentTarget, true)}
                                        onMouseLeave={e => applyHover(e.currentTarget, false)}
                                    >
                                        <span style={iconWrapStyle}>🚚</span>
                                        <span style={{ fontWeight: 500, color: 'var(--ink, #1e293b)' }}>
                                            ডেলিভারি চালান তৈরি
                                        </span>
                                    </button>
                                )}

                                {/* STATUS TRANSITION ACTIONS */}
                                {onUpdateStatus && (
                                    <>
                                        <div
                                            style={{
                                                height: '1px',
                                                background: 'var(--line, #e2e8f0)',
                                                margin: '3px 0',
                                            }}
                                        />

                                        {/* Status: WAITING -> ACTIVATE (RUN) */}
                                        {isWaiting && (
                                            <button
                                                type="button"
                                                className="dropdown-action-btn"
                                                onClick={() => executeAction(() => onUpdateStatus(order.id, 'run'))}
                                                style={{
                                                    ...itemButtonStyle,
                                                    color: '#15803d',
                                                }}
                                                onMouseEnter={e => applyHover(e.currentTarget, true, '#dcfce7')}
                                                onMouseLeave={e => applyHover(e.currentTarget, false)}
                                            >
                                                <span style={iconWrapStyle}>▶️</span>
                                                <span style={{ fontWeight: 600, color: '#15803d' }}>
                                                    অর্ডার সচল করুন
                                                </span>
                                            </button>
                                        )}

                                        {/* Status: RUNNING -> MARK COMPLETE (DONE) */}
                                        {isRunning && (
                                            <button
                                                type="button"
                                                className="dropdown-action-btn"
                                                onClick={() => executeAction(() => onUpdateStatus(order.id, 'done'))}
                                                style={{
                                                    ...itemButtonStyle,
                                                    color: '#15803d',
                                                }}
                                                onMouseEnter={e => applyHover(e.currentTarget, true, '#dcfce7')}
                                                onMouseLeave={e => applyHover(e.currentTarget, false)}
                                            >
                                                <span style={iconWrapStyle}>✅</span>
                                                <span style={{ fontWeight: 600, color: '#15803d' }}>
                                                    সম্পন্ন হিসেবে চিহ্নিত করুন
                                                </span>
                                            </button>
                                        )}

                                        {/* Status: RUNNING -> PAUSE (WAIT) */}
                                        {isRunning && (
                                            <button
                                                type="button"
                                                className="dropdown-action-btn"
                                                onClick={() => executeAction(() => onUpdateStatus(order.id, 'wait'))}
                                                style={itemButtonStyle}
                                                onMouseEnter={e => applyHover(e.currentTarget, true)}
                                                onMouseLeave={e => applyHover(e.currentTarget, false)}
                                            >
                                                <span style={iconWrapStyle}>⏸️</span>
                                                <span style={{ fontWeight: 500, color: 'var(--ink, #1e293b)' }}>
                                                    অপেক্ষায় রাখুন (বিরতি)
                                                </span>
                                            </button>
                                        )}

                                        {/* Status: DONE -> RE-ACTIVATE (RUN) */}
                                        {isDone && (
                                            <button
                                                type="button"
                                                className="dropdown-action-btn"
                                                onClick={() => executeAction(() => onUpdateStatus(order.id, 'run'))}
                                                style={itemButtonStyle}
                                                onMouseEnter={e => applyHover(e.currentTarget, true)}
                                                onMouseLeave={e => applyHover(e.currentTarget, false)}
                                            >
                                                <span style={iconWrapStyle}>🔄</span>
                                                <span style={{ fontWeight: 500, color: 'var(--ink, #1e293b)' }}>
                                                    পুনরায় সচল করুন
                                                </span>
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* QC INSPECTION SHORTCUT */}
                                {onOpenQcModal && (
                                    <>
                                        <div
                                            style={{
                                                height: '1px',
                                                background: 'var(--line, #e2e8f0)',
                                                margin: '3px 0',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="dropdown-action-btn"
                                            onClick={() => executeAction(() => onOpenQcModal(order.id))}
                                            style={itemButtonStyle}
                                            onMouseEnter={e => applyHover(e.currentTarget, true)}
                                            onMouseLeave={e => applyHover(e.currentTarget, false)}
                                        >
                                            <span style={iconWrapStyle}>🔬</span>
                                            <span style={{ fontWeight: 500, color: 'var(--ink, #1e293b)' }}>
                                                নতুন QC পরিদর্শন
                                            </span>
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        {/* VENDOR ROLE SPECIFIC ACTIONS */}
                        {role === 'ven' && (
                            <>
                                {(order.quotations_count || 0) > 0 && !order.is_awarded && onViewQuotations && order.db_id && (
                                    <button
                                        type="button"
                                        className="dropdown-action-btn"
                                        onClick={() => executeAction(() => onViewQuotations(order.db_id!))}
                                        style={{
                                            ...itemButtonStyle,
                                            color: '#15803d',
                                        }}
                                        onMouseEnter={e => applyHover(e.currentTarget, true, '#dcfce7')}
                                        onMouseLeave={e => applyHover(e.currentTarget, false)}
                                    >
                                        <span style={iconWrapStyle}>📑</span>
                                        <span style={{ fontWeight: 600, color: '#15803d' }}>
                                            দরপত্রসমূহ তুলনা ও অনুমোদন
                                        </span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable micro-styles
const itemButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '7px 8px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s ease',
};

const iconWrapStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '5px',
    background: 'var(--surface2, #f1f5f9)',
    fontSize: '0.9rem',
    flexShrink: 0,
};

const applyHover = (el: HTMLElement, isHovered: boolean, customBg?: string) => {
    if (isHovered) {
        el.style.background = customBg || 'var(--surface2, #f1f5f9)';
    } else {
        el.style.background = customBg || 'transparent';
    }
};
