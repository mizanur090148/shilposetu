import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Factory,
    Layers,
    Phone,
    Search,
    PlusCircle,
    CheckCircle,
    ShieldCheck,
    LogIn,
    UserPlus,
    Menu,
    X,
    BarChart3,
    CreditCard,
    Building2,
    Clock,
    User,
    LogOut,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    Send,
    Handshake,
    Sparkles,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

interface ShilposetuLayoutProps {
    children: React.ReactNode;
    onCreatePostClick?: () => void;
}

export default function ShilposetuLayout({ children, onCreatePostClick }: ShilposetuLayoutProps) {
    const { auth, flash } = usePage<any>().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click or escape
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
            {/* Top Industrial Hotline & Stats Bar (matching Page 2) */}
            <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center space-x-4">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            শিল্পসেতু | SHILPOSETU
                        </span>
                        <span className="hidden sm:inline text-slate-500">|</span>
                        <a href="tel:+8801551200200" className="flex items-center gap-1 hover:text-white transition">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>+880 1733 714 009</span>
                        </a>
                    </div>
                    <div className="flex items-center space-x-6 text-slate-300">
                        <div className="hidden md:flex items-center gap-1">
                            <span className="text-slate-400">Registered Vendors:</span>
                            <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">10,00,000+</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                            <span className="text-slate-400">Industries & Mills:</span>
                            <span className="font-bold text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">50,000+</span>
                        </div>
                        {user ? (
                            <span className="text-slate-400">
                                ID: <strong className="text-amber-400">{user.customer_id || `S${user.id}`}</strong>
                            </span>
                        ) : (
                            <div className="flex items-center space-x-3 text-xs">
                                <Link href={route('login')} className="hover:text-white">Login</Link>
                                <span>/</span>
                                <Link href={route('register')} className="hover:text-emerald-400 font-medium">Registration</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header / Navigation */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Brand Logo */}
                        <div className="flex items-center gap-3">
                            <Link href={route('feed.index')} className="flex items-center gap-2.5 group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                                        SHILPO<span className="text-blue-600">SETU</span>
                                    </span>
                                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium -mt-1">
                                        Subcontract & Capacity
                                    </span>
                                </div>
                            </Link>

                            {/* Main Nav Links */}
                            <nav className="hidden lg:flex items-center ml-8 space-x-1">
                                <Link
                                    href={route('feed.index')}
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                                >
                                    <Layers className="w-4 h-4 text-blue-600" />
                                    Subcontracts
                                </Link>
                                <Link
                                    href={route('vendors.index')}
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                                >
                                    <Factory className="w-4 h-4 text-emerald-600" />
                                    Factories
                                </Link>
                                <Link
                                    href={route('subscription.index')}
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                                >
                                    <CreditCard className="w-4 h-4 text-amber-600" />
                                    Membership
                                </Link>
                                {user && (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                                    >
                                        <BarChart3 className="w-4 h-4 text-purple-600" />
                                        Dashboard
                                    </Link>
                                )}
                            </nav>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-3">
                            {onCreatePostClick && (
                                <button
                                    onClick={() => {
                                        if (user?.status === 'pending') {
                                            alert('আপনার ফ্যাক্টরি অ্যাকাউন্টটি বর্তমানে পর্যালোচনায় রয়েছে (Pending Approval)। অ্যাডমিন অনুমোদন দিলে আপনি সাব-কন্ট্রাক্ট পোস্ট করতে পারবেন।');
                                            return;
                                        }
                                        onCreatePostClick();
                                    }}
                                    className={`hidden sm:inline-flex items-center gap-2 font-medium px-4 py-2 rounded-xl text-sm shadow-sm transition transform active:scale-95 ${
                                        user?.status === 'pending'
                                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 shadow-none'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 hover:shadow'
                                    }`}
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Post Subcontract</span>
                                    {user?.status === 'pending' && (
                                        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">Pending</span>
                                    )}
                                </button>
                            )}

                            {user ? (
                                <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className={`group flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-2xl transition-all duration-200 text-left focus:outline-none ${
                                            profileDropdownOpen
                                                ? 'bg-blue-50/80 ring-2 ring-blue-500/30 shadow-sm'
                                                : 'hover:bg-slate-100/80'
                                        }`}
                                        aria-expanded={profileDropdownOpen}
                                        aria-haspopup="true"
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/20 ring-2 ring-white group-hover:scale-105 transition-transform">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <div className="flex items-center gap-1">
                                                <p className="text-xs font-bold text-slate-900 leading-tight max-w-[125px] truncate group-hover:text-blue-600 transition-colors">
                                                    {user.name}
                                                </p>
                                                {user.factory?.is_verified && (
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium mt-0.5">
                                                <span className="font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/70">
                                                    {user.customer_id || `S${user.id}`}
                                                </span>
                                                {/* <span className="text-slate-400 truncate max-w-[80px]">
                                                    {user.factory?.business_name || 'Member'}
                                                </span> */}
                                            </p>
                                        </div>
                                        <ChevronDown
                                            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-300 ${
                                                profileDropdownOpen ? 'rotate-180 text-blue-600' : ''
                                            }`}
                                        />
                                    </button>

                                    {/* Desktop Profile Dropdown Sub-Menu */}
                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2.5 w-80 sm:w-88 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.22)] border border-slate-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                                            {/* Hero User & Factory Card */}
                                            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-4 overflow-hidden">
                                                {/* Ambient decorative glow */}
                                                <div className="absolute -right-8 -top-8 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
                                                <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

                                                <div className="relative z-10">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <p className="text-sm font-black text-white truncate">{user.name}</p>
                                                                    {user.factory?.is_verified && (
                                                                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                                                                            <ShieldCheck className="w-2.5 h-2.5" />
                                                                            Verified
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-slate-300 truncate mt-0.5">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-lg shrink-0 shadow-inner">
                                                            {user.customer_id || `S${user.id}`}
                                                        </span>
                                                    </div>

                                                    {/* Quick Factory Card */}
                                                    {/* <div className="mt-3.5 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between gap-2 shadow-sm">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-8 h-8 rounded-xl bg-blue-500/25 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                                                                <Building2 className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-white truncate">
                                                                    {user.factory?.business_name || 'My Factory Profile'}
                                                                </p>
                                                                <p className="text-[10px] text-slate-300 truncate flex items-center gap-1">
                                                                    <span>{user.factory?.location_hub ? `${user.factory.location_hub} Hub` : 'Production Capacity'}</span>
                                                                    {user.factory?.sewing_lines_count ? (
                                                                        <span className="text-blue-300 font-semibold">• {user.factory.sewing_lines_count} Lines</span>
                                                                    ) : null}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={route('factory.edit')}
                                                            onClick={() => setProfileDropdownOpen(false)}
                                                            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[10px] transition shrink-0 flex items-center gap-1 shadow-sm active:scale-95"
                                                        >
                                                            <span>Edit</span>
                                                            <ChevronRight className="w-3 h-3" />
                                                        </Link>
                                                    </div> */}
                                                </div>
                                            </div>

                                            {/* Sub-Menu Navigation Items */}
                                            <div className="p-2 space-y-1 text-xs">
                                                {/* 1. Dashboard */}
                                                <Link
                                                    href={route('dashboard')}
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition duration-150"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                                                        <LayoutDashboard className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">Dashboard</p>
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 truncate">Manufacturing overview & order status</p>
                                                    </div>
                                                </Link>

                                                {/* 2. Section: Factory & Account */}
                                                <div className="px-3 pt-2 pb-1 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                        Factory & Account
                                                    </span>
                                                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                                        Settings
                                                    </span>
                                                </div>

                                                {/* Profile Settings */}
                                                <Link
                                                    href={route('profile.edit')}
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="group flex items-center gap-3 px-3 py-2 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition duration-150"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-700 group-hover:text-white transition-colors duration-200">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-bold text-slate-900 group-hover:text-slate-900 transition-colors">Profile Settings</p>
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 truncate">Name, email, phone & password</p>
                                                    </div>
                                                </Link>

                                                {/* Factory Profile & Capacity */}
                                                <Link
                                                    href={route('factory.edit')}
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="group flex items-center gap-3 px-3 py-2 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-indigo-50/60 transition duration-150"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Factory Profile & Capacity</p>
                                                            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full">Capacity</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 truncate">Sewing lines, machines & legal licenses</p>
                                                    </div>
                                                </Link>

                                                {/* 3. Section: Subcontract Operations & Others */}
                                                <div className="px-3 pt-2 pb-1 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                                        Subcontract Operations
                                                    </span>
                                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                        Orders
                                                    </span>
                                                </div>

                                                <Link
                                                    href={route('dashboard') + '?tab=posted'}
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="group flex items-center gap-3 px-3 py-2 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-blue-50/60 transition duration-150"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                                                        <Send className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Give Subcontract</p>
                                                            <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full">I Post</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 truncate">Orders you posted to outsource work</p>
                                                    </div>
                                                </Link>

                                                <Link
                                                    href={route('dashboard') + '?tab=taken'}
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="group flex items-center gap-3 px-3 py-2 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-emerald-50/60 transition duration-150"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                                                        <Handshake className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Take Subcontract</p>
                                                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">I Produce</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 truncate">Orders you bid on & active factory jobs</p>
                                                    </div>
                                                </Link>

                                                <Link
                                                    href={route('subscription.index')}
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="group flex items-center gap-3 px-3 py-2 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-amber-50/60 transition duration-150"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                                                        <CreditCard className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Subscription Plan</p>
                                                            <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-full">Active</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 truncate">100 Tk + 50 Tk/month billing</p>
                                                    </div>
                                                </Link>
                                            </div>

                                            {/* Footer Sign Out */}
                                            <div className="p-2 border-t border-slate-100 bg-slate-50/80">
                                                <Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="w-full flex items-center justify-between px-3 py-2 rounded-2xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition group font-bold text-xs text-left"
                                                >
                                                    <span className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                                            <LogOut className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span>Sign Out from Shilposetu</span>
                                                    </span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        href={route('login')}
                                        className="text-slate-700 hover:text-slate-900 font-medium px-3 py-2 text-sm rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-2 text-sm rounded-xl shadow-sm transition flex items-center gap-1.5"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Register
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
                        <Link
                            href={route('feed.index')}
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Subcontracts
                        </Link>
                        <Link
                            href={route('vendors.index')}
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Factories
                        </Link>
                        <Link
                            href={route('subscription.index')}
                            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            SaaS Membership (100 Tk + 50 Tk/mo)
                        </Link>

                        {user ? (
                            <div className="pt-3 border-t border-slate-200 space-y-1">
                                <div className="p-3 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl mb-3 shadow-sm border border-slate-800">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black flex items-center justify-center text-sm shadow">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">{user.name}</p>
                                                <p className="text-[10px] text-slate-300">{user.factory?.business_name || 'Factory Member'}</p>
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10px] bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded-lg border border-cyan-500/30">
                                            {user.customer_id || `S${user.id}`}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard className="w-4 h-4 text-purple-600" />
                                    <span>Dashboard Overview</span>
                                </Link>
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User className="w-4 h-4 text-slate-600" />
                                    <span>Profile Settings</span>
                                </Link>
                                <Link
                                    href={route('factory.edit')}
                                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Building2 className="w-4 h-4 text-indigo-600" />
                                        <span>Factory Profile & Capacity</span>
                                    </span>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">Lines</span>
                                </Link>
                                <Link
                                    href={route('dashboard') + '?tab=posted'}
                                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Send className="w-4 h-4 text-blue-600" />
                                        <span>Give Subcontract</span>
                                    </span>
                                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">I Post</span>
                                </Link>
                                <Link
                                    href={route('dashboard') + '?tab=taken'}
                                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <Handshake className="w-4 h-4 text-emerald-600" />
                                        <span>Take Subcontract</span>
                                    </span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">I Produce</span>
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 text-left transition"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-slate-100 flex gap-2">
                                <Link
                                    href={route('login')}
                                    className="flex-1 text-center py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="flex-1 text-center py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Flash message notification */}
            {flash?.success && (
                <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 text-emerald-800 text-sm flex items-center justify-between">
                    <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}

            {flash?.error && (
                <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 text-rose-800 text-sm flex items-center justify-between">
                    <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}

            {/* Pending Factory Approval Banner */}
            {user?.status === 'pending' && (
                <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border-b border-amber-300/80 px-4 py-3 text-amber-950 text-xs sm:text-sm shadow-inner">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-3 w-3 relative shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                            <div>
                                <span className="font-bold text-amber-900">ফ্যাক্টরি ভেরিফিকেশন অপেক্ষমান (Pending Approval):</span>{' '}
                                <span className="text-amber-800 font-medium">আপনার প্রোফাইলটি বর্তমানে পর্যালোচনায় রয়েছে। অ্যাডমিন অনুমোদন দিলে আপনি সাব-কন্ট্রাক্ট পোস্ট ও বিড করতে পারবেন।</span>
                            </div>
                        </div>
                        <span className="shrink-0 text-[11px] font-bold bg-amber-200/90 text-amber-900 px-3 py-1 rounded-full border border-amber-300/80 shadow-xs">
                            👀 ব্রাউজ ও ভিউ সুবিধা সক্রিয়
                        </span>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 text-sm py-10 border-t border-slate-800 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
                                <Building2 className="w-5 h-5 text-blue-400" />
                                <span>শিল্পসেতু | SHILPOSETU</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Digital Subcontracting & Smarter Manufacturing Platform for Ready-Made Garments (RMG), Knitting, Dyeing, and Washing in Bangladesh.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Major Industrial Hubs</h4>
                            <ul className="text-xs space-y-1.5">
                                <li>Gazipur Sadar & Tongi</li>
                                <li>Ashulia & Savar EPZ</li>
                                <li>Narayanganj & Fatullah</li>
                                <li>Maona & Sripur</li>
                                <li>Chittagong KEPZ</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Subcontract Sectors</h4>
                            <ul className="text-xs space-y-1.5">
                                <li>Circular & Flat Knitting</li>
                                <li>Fabric Dyeing & Yarn Dyeing</li>
                                <li>Sewing & CMT Production</li>
                                <li>Dry Process & Over Dyeing (Washing)</li>
                                <li>Plastisol & Rotary Screen Print</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Direct Support Hotline</h4>
                            <p className="text-xs text-slate-400 mb-2">Have extra capacity or urgent order requirements?</p>
                            <a href="tel:+8801551200200" className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm bg-slate-800 px-3 py-2 rounded-lg">
                                <Phone className="w-4 h-4" />
                                +880 1733 714 009
                            </a>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
                        <p>© {new Date().getFullYear()} Shilposetu.com. All rights reserved.</p>
                        <p>Subcontract দেওয়া ও নেওয়ার প্ল্যাটফর্ম (Like as Social Feed)</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
