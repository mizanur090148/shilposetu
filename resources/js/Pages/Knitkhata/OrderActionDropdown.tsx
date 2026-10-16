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
    showToast,
    bn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]),
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuCoords, setMenuCoords] = useState<{ top?: number; bottom?: number; right: number }>({ right: 16 });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const calculatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const menuHeight = role === 'fac' ? 340 : 190;
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
            // Slight delay to allow animation to feel natural
            setTimeout(() => fn(), 10);
        }
    };

    const handleCopyId = () => {
        executeAction(() => {
            if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(order.id);
            }
            if (showToast) {
                showToast(`অর্ডার আইডি (${order.id}) কপি করা হয়েছে!`);
            }
        });
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
                title="অর্ডারের সব অপশন ও অ্যাকশন মেনু (Three Dots)"
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
                {/* Sleek SVG Vertical Three Dots */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2.2" />
                    <circle cx="12" cy="12" r="2.2" />
                    <circle cx="12" cy="19" r="2.2" />
                </svg>
            </button>

            {/* DROPDOWN POPOVER MENU (FIXED TO ESCAPE TABLE OVERFLOW CLIPPING) */}
            {isOpen && (
                <div
                    ref={menuRef}
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        top: menuCoords.top !== undefined ? `${menuCoords.top}px` : 'auto',
                        bottom: menuCoords.bottom !== undefined ? `${menuCoords.bottom}px` : 'auto',
                        right: `${menuCoords.right}px`,
                        width: '260px',
                        maxWidth: 'calc(100vw - 24px)',
                        maxHeight: 'calc(100vh - 40px)',
                        overflowY: 'auto',
                        background: 'var(--surface, #ffffff)',
                        border: '1px solid var(--line, #e2e8f0)',
                        borderRadius: '10px',
                        boxShadow: '0 14px 35px -4px rgba(0, 0, 0, 0.18), 0 8px 16px -6px rgba(0, 0, 0, 0.1)',
                        zIndex: 9999,
                        padding: '6px',
                        fontSize: '0.84rem',
                        animation: 'fadeInScale 0.14s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    {/* MENU HEADER: ORDER ID & STATUS BADGE */}
                    <div
                        style={{
                            padding: '8px 10px 10px',
                            borderBottom: '1px solid var(--line, #e2e8f0)',
                            marginBottom: '4px',
                            background: 'var(--surface2, #f8fafc)',
                            borderRadius: '6px 6px 0 0',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span
                                className="mono"
                                style={{
                                    fontWeight: 700,
                                    fontSize: '0.86rem',
                                    color: 'var(--accent, #16a34a)',
                                }}
                            >
                                {order.id}
                            </span>
                            <span
                                style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: isRunning ? '#dcfce7' : isWaiting ? '#fef9c3' : '#e0e7ff',
                                    color: isRunning ? '#15803d' : isWaiting ? '#a16207' : '#3730a3',
                                }}
                            >
                                {isRunning ? '🟢 চলমান' : isWaiting ? '🟡 অপেক্ষায়' : '🔵 সম্পন্ন'}
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: '0.76rem',
                                color: 'var(--muted, #64748b)',
                                marginTop: '3px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {order.title || order.fabric} · {bn(order.qty)} kg
                        </div>
                    </div>

                    {/* ACTION ITEMS */}
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
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                <span style={{ fontWeight: 600, color: 'var(--ink, #1e293b)' }}>বিস্তারিত দেখুন</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>উৎপাদন ও লাইভ অগ্রগতি</span>
                            </div>
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
                                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                            <span style={{ fontWeight: 600, color: 'var(--ink, #1e293b)' }}>
                                                মেশিন বরাদ্দ / পরিবর্তন
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
                                                {order.machines && order.machines.length > 0
                                                    ? `${bn(order.machines.length)}টি নিযুক্ত (${order.machines.join(', ')})`
                                                    : 'মেশিন সেট করুন'}
                                            </span>
                                        </div>
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
                                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                            <span style={{ fontWeight: 600, color: 'var(--ink, #1e293b)' }}>
                                                ডেলিভারি চালান তৈরি
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
                                                চালানপত্র ও গেটপাস প্রিন্ট
                                            </span>
                                        </div>
                                        {isRunning && (
                                            <span
                                                style={{
                                                    fontSize: '0.68rem',
                                                    padding: '1px 6px',
                                                    borderRadius: '4px',
                                                    background: '#dcfce7',
                                                    color: '#15803d',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                রানিং
                                            </span>
                                        )}
                                    </button>
                                )}

                                {/* DIVIDER: STATUS ACTIONS */}
                                {onUpdateStatus && (
                                    <>
                                        <div
                                            style={{
                                                height: '1px',
                                                background: 'var(--line, #e2e8f0)',
                                                margin: '4px 0',
                                            }}
                                        />
                                        <div
                                            style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                color: 'var(--muted, #94a3b8)',
                                                padding: '2px 10px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                            }}
                                        >
                                            অবস্থা পরিবর্তন
                                        </div>

                                        {/* Status: WAITING -> ACTIVATE (RUN) */}
                                        {isWaiting && (
                                            <button
                                                type="button"
                                                className="dropdown-action-btn"
                                                onClick={() => executeAction(() => onUpdateStatus(order.id, 'run'))}
                                                style={{
                                                    ...itemButtonStyle,
                                                    background: 'rgba(22, 163, 74, 0.05)',
                                                }}
                                                onMouseEnter={e => applyHover(e.currentTarget, true, '#dcfce7')}
                                                onMouseLeave={e => applyHover(e.currentTarget, false, 'rgba(22, 163, 74, 0.05)')}
                                            >
                                                <span style={iconWrapStyle}>▶️</span>
                                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                                    <span style={{ fontWeight: 600, color: '#15803d' }}>
                                                        অর্ডার সচল করুন
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>
                                                        উৎপাদন শুরু হিসেবে চিহ্নিত
                                                    </span>
                                                </div>
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
                                                    background: 'rgba(22, 163, 74, 0.05)',
                                                }}
                                                onMouseEnter={e => applyHover(e.currentTarget, true, '#dcfce7')}
                                                onMouseLeave={e => applyHover(e.currentTarget, false, 'rgba(22, 163, 74, 0.05)')}
                                            >
                                                <span style={iconWrapStyle}>✅</span>
                                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                                    <span style={{ fontWeight: 600, color: '#15803d' }}>
                                                        সম্পন্ন হিসেবে চিহ্নিত করুন
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>
                                                        সব ডেলিভারি ও কাজ শেষ
                                                    </span>
                                                </div>
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
                                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--ink, #1e293b)' }}>
                                                        অপেক্ষায় রাখুন (বিরতি)
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
                                                        সুতা বা কাজের সাময়িক বিরতি
                                                    </span>
                                                </div>
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
                                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--ink, #1e293b)' }}>
                                                        পুনরায় সচল করুন
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
                                                        অর্ডারে পুনরায় উৎপাদন শুরু
                                                    </span>
                                                </div>
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
                                                margin: '4px 0',
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
                                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                                <span style={{ fontWeight: 600, color: 'var(--ink, #1e293b)' }}>
                                                    নতুন QC পরিদর্শন
                                                </span>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>
                                                    এই অর্ডারের রোল চেক এন্ট্রি
                                                </span>
                                            </div>
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
                                            background: 'rgba(22, 163, 74, 0.05)',
                                        }}
                                        onMouseEnter={e => applyHover(e.currentTarget, true, '#dcfce7')}
                                        onMouseLeave={e => applyHover(e.currentTarget, false, 'rgba(22, 163, 74, 0.05)')}
                                    >
                                        <span style={iconWrapStyle}>📑</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                            <span style={{ fontWeight: 600, color: '#15803d' }}>
                                                দরপত্রসমূহ তুলনা ও অনুমোদন
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>
                                                {bn(order.quotations_count || 0)}টি দরপত্র জমা পড়েছে
                                            </span>
                                        </div>
                                    </button>
                                )}
                            </>
                        )}

                        {/* COPY ORDER ID UTILITY */}
                        <div
                            style={{
                                height: '1px',
                                background: 'var(--line, #e2e8f0)',
                                margin: '4px 0',
                            }}
                        />
                        <button
                            type="button"
                            className="dropdown-action-btn"
                            onClick={handleCopyId}
                            style={itemButtonStyle}
                            onMouseEnter={e => applyHover(e.currentTarget, true)}
                            onMouseLeave={e => applyHover(e.currentTarget, false)}
                        >
                            <span style={iconWrapStyle}>📋</span>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
                                <span style={{ fontWeight: 500, color: 'var(--ink, #1e293b)' }}>অর্ডার আইডি কপি করুন</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)' }}>{order.id}</span>
                            </div>
                        </button>
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
    gap: '10px',
    width: '100%',
    padding: '7px 10px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
};

const iconWrapStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'var(--surface2, #f1f5f9)',
    fontSize: '0.95rem',
    flexShrink: 0,
};

const applyHover = (el: HTMLElement, isHovered: boolean, customBg?: string) => {
    if (isHovered) {
        el.style.background = customBg || 'var(--surface2, #f1f5f9)';
    } else {
        el.style.background = customBg || 'transparent';
    }
};
