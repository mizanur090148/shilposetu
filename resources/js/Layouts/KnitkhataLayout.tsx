import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { KnitkhataViewTab, RoleMode } from '../Pages/Knitkhata/types';
import '../Pages/Knitkhata/knitkhata.css';

export interface KnitkhataLayoutProps {
    title?: string;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role?: string;
            factory?: {
                id: number;
                business_name?: string;
                is_verified?: boolean;
            };
        };
    };
    factory?: {
        id: number;
        business_name?: string;
    } | null;
    role: RoleMode;
    onRoleChange?: (role: RoleMode) => void;
    activeTab: KnitkhataViewTab;
    onNavigate?: (tab: KnitkhataViewTab) => void;
    toastMessage?: string | null;
    children: React.ReactNode;
}

export const TAB_HREFS: Record<string, string> = {
    dash: '/knitkhata',
    orders: '/knitkhata/orders',
    detail: '/knitkhata/orders',
    entry: '/knitkhata/production-entry',
    qc: '/knitkhata/qc',
    acc: '/knitkhata/accounts',
    att: '/knitkhata/attendance',
    machines: '/knitkhata/my-machines',
    users: '/knitkhata/users',
    wa: '/knitkhata/whatsapp',
    plan: '/knitkhata/planning',
    vorders: '/knitkhata/vendor/orders',
    vreport: '/knitkhata/vendor/report',
};

const renderIcon = (type: string) => {
    switch (type) {
        case 'dash': return <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" /></svg>;
        case 'ord': return <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>;
        case 'prod': return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>;
        case 'qc': return <svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" /><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" /></svg>;
        case 'acc': return <svg viewBox="0 0 24 24"><path d="M3 7h18v12H3z" /><path d="M3 11h18M7 15h3" /></svg>;
        case 'att': return <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M16 11l2 2 3-4" /></svg>;
        case 'mc': return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
        case 'usr': return <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>;
        case 'wa': return <svg viewBox="0 0 24 24"><path d="M4 20l1.5-4A8 8 0 1 1 9 19z" /><path d="M9 9c0 3 3 6 6 6" /></svg>;
        case 'plan': return <svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z" /><path d="M9 4v16" /><path d="M12 9h4M12 13h4" /></svg>;
        default: return null;
    }
};

const navFac: [string, string, string?][] = [
    ['grp', 'প্রতিদিনের কাজ'],
    ['dash', 'ড্যাশবোর্ড', 'dash'],
    ['orders', 'সাব-কন্ট্রাক্ট অর্ডার', 'ord'],
    ['entry', 'প্রোডাকশন এন্ট্রি', 'prod'],
    ['qc', 'QC ও কাপড়ের সমস্যা', 'qc'],
    ['grp', 'অফিস ও হিসাব'],
    ['acc', 'হিসাব-নিকাশ', 'acc'],
    ['att', 'হাজিরা ও বেতন', 'att'],
    ['grp', 'সেটিংস'],
    ['machines', 'আমার মেশিনগুলো', 'mc'],
    ['users', 'ইউজার ও পারমিশন', 'usr'],
    ['wa', 'WhatsApp রিপোর্ট', 'wa'],
    ['grp', 'প্রজেক্ট'],
    ['plan', 'কাজের পরিকল্পনা', 'plan']
];

const navVen: [string, string, string?][] = [
    ['grp', 'ABC Knit Composite (ভেন্ডর)'],
    ['orders', 'দেওয়া সাব-কন্ট্রাক্ট অর্ডার', 'ord'],
    ['vreport', 'দৈনিক রিপোর্ট ও Excel', 'wa']
];

export default function KnitkhataLayout({
    title = 'নিটখাতা প্রোটোটাইপ',
    auth,
    factory,
    role,
    onRoleChange,
    activeTab,
    onNavigate,
    toastMessage,
    children
}: KnitkhataLayoutProps) {
    const user = auth.user;
    const factoryDisplayName =
        factory?.business_name ||
        user.factory?.business_name ||
        'রহমান নিটিং ইন্ডাস্ট্রিজ (নমুনা ফ্যাক্টরি)';

    const navList = role === 'fac' ? navFac : navVen;

    return (
        <div className="kk-app">
            <Head title={`${title} - নিটখাতা`} />

            {/* HEADER.TOP - EXACT PROTOYPE MATCH */}
            <header className="top">
                <Link
                    href="/knitkhata"
                    className="brand"
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <div className="logo" title="নিটখাতা হোম">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth="2">
                            <path d="M4 8c4 0 4 8 8 8s4-8 8-8" />
                            <path d="M4 14c4 0 4 6 8 6s4-6 8-6" opacity="0.6" />
                            <path d="M4 3c4 0 4 7 8 7s4-7 8-7" opacity="0.35" />
                        </svg>
                    </div>
                    <div>
                        <b>নিটখাতা</b>
                        <small>{factoryDisplayName}</small>
                    </div>
                </Link>


                <div className="roleswitch" role="group" aria-label="কার চোখে দেখবেন">
                    <button
                        type="button"
                        id="r-fac"
                        className={role === 'fac' ? 'on' : ''}
                        onClick={() => onRoleChange && onRoleChange('fac')}
                    >
                        ফ্যাক্টরি ভিউ
                    </button>
                    <button
                        type="button"
                        id="r-ven"
                        className={role === 'ven' ? 'on' : ''}
                        onClick={() => onRoleChange && onRoleChange('ven')}
                    >
                        ভেন্ডর ভিউ (ABC)
                    </button>
                </div>

                {/* Seamless Platform Back Links */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link href={route('dashboard')} className="btn sm" style={{ textDecoration: 'none' }}>
                        ← মূল ড্যাশবোর্ড
                    </Link>
                    <Link href={route('home')} className="btn sm pri" style={{ textDecoration: 'none' }}>
                        হোম
                    </Link>
                </div>
            </header>

            {/* APP SHELL - EXACT MATCH */}
            <div className="shell">
                <nav className="rail" id="rail">
                    {navList.map((item, idx) => {
                        if (item[0] === 'grp') {
                            return (
                                <div key={idx} className="grp">
                                    {item[1]}
                                </div>
                            );
                        }

                        const tabId = item[0] as KnitkhataViewTab;
                        const label = item[1];
                        const iconKey = item[2] || 'dash';
                        const isOn =
                            activeTab === tabId ||
                            (activeTab === 'detail' && tabId === (role === 'fac' ? 'orders' : 'vorders'));
                        const href = TAB_HREFS[tabId] || '/knitkhata';

                        return (
                            <Link
                                key={tabId}
                                href={href}
                                className={isOn ? 'on' : ''}
                                preserveScroll
                                onClick={() => {
                                    if (onNavigate) {
                                        onNavigate(tabId);
                                    }
                                }}
                            >
                                {renderIcon(iconKey)}
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <main id="main">
                    {children}
                </main>
            </div>

            {/* TOAST - EXACT MATCH */}
            {toastMessage && (
                <div className="toast" id="toast">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
