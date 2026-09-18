import React, { useState } from 'react';
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
    LogOut
} from 'lucide-react';

interface ShilposetuLayoutProps {
    children: React.ReactNode;
    onCreatePostClick?: () => void;
}

export default function ShilposetuLayout({ children, onCreatePostClick }: ShilposetuLayoutProps) {
    const { auth, flash } = usePage<any>().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                                    onClick={onCreatePostClick}
                                    className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm shadow-sm shadow-blue-500/25 hover:shadow transition transform active:scale-95"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Post Subcontract (অর্ডার দিন)
                                </button>
                            )}

                            {user ? (
                                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                                    <Link
                                        href={route('dashboard')}
                                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition text-left"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="hidden md:block">
                                            <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                                            <p className="text-[10px] text-slate-500">{user.customer_id || 'Member'}</p>
                                        </div>
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Link>
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
                            <Link
                                href={route('dashboard')}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
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
