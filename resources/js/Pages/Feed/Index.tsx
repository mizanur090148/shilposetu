import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import AuthGateModal from '@/Components/AuthGateModal';
import CreatePostModal from '@/Components/CreatePostModal';
import { formatDeadline } from '@/utils/date';
import {
    PlusCircle,
    Search,
    SlidersHorizontal,
    RotateCcw,
    X,
    MapPin,
    Calendar,
    Layers,
    CheckCircle2,
    ShieldCheck,
    Clock,
    Building2,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    ArrowUpRight,
    MessageSquare,
    Eye,
    Sparkles,
    Check,
    Flame,
    Handshake,
    ArrowUpDown,
    Filter
} from 'lucide-react';

import { KnittingType } from '@/types';

const SORT_OPTIONS = [
    {
        id: 'latest',
        label: 'Newest First',
        description: 'Recently posted subcontract orders',
        icon: Clock,
        iconColor: 'text-blue-600 bg-blue-50 border-blue-200/80',
    },
    {
        id: 'urgent',
        label: 'Most Urgent First',
        description: 'Orders with immediate production deadlines',
        icon: Flame,
        iconColor: 'text-amber-600 bg-amber-50 border-amber-200/80',
    },
    {
        id: 'quantity_desc',
        label: 'Quantity: High to Low',
        description: 'Largest volume production runs first',
        icon: Layers,
        iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
    },
    {
        id: 'quantity_asc',
        label: 'Quantity: Low to High',
        description: 'Smaller batches & sample runs',
        icon: ArrowUpDown,
        iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    },
];

interface SubcontractPostItem {
    id: number;
    title: string;
    post_type: 'DEMAND' | 'SUPPLY';
    category: string;
    target_quantity: number;
    unit: string;
    target_rate: string | null;
    rate_negotiable: boolean;
    deadline: string | null;
    district: string;
    description: string;
    specs: Record<string, any> | null;
    is_urgent: boolean;
    views_count: number;
    created_at: string;
    user: {
        id: number;
        name: string;
        customer_id: string;
        phone: string | null;
    };
    factory?: {
        id: number;
        business_name: string;
        district: string;
        total_lines: number;
        is_verified: boolean;
        rating: number;
        knitting_types?: KnittingType[];
    } | null;
    quotations?: any[];
}

interface FeedIndexProps {
    posts: {
        data: SubcontractPostItem[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        knitting_type?: string;
        category?: string;
        district?: string;
        search?: string;
        urgent_only?: boolean;
        negotiable_only?: boolean;
        verified_only?: boolean;
        quantity?: string;
        sort?: string;
    };
    knittingTypes?: KnittingType[];
    districts: string[];
    stats: {
        total_vendors: number;
        verified_vendors: number;
        active_orders: number;
        total_machines: number;
    };
    userCanViewFullDetails: boolean;
    auth: {
        user: any;
    };
}

export default function FeedIndex({
    posts,
    filters,
    districts,
    stats,
    knittingTypes = [],
    userCanViewFullDetails,
    auth
}: FeedIndexProps) {
    // Parse comma-separated or array of active knitting types
    const parseSelectedKnittingTypes = (raw: string | undefined): string[] => {
        if (!raw || raw === 'all') return [];
        return raw.split(',').map((s) => s.trim()).filter(Boolean);
    };

    const selectedKnittingTypes = parseSelectedKnittingTypes(filters.knitting_type || filters.category);
    const isAllSelected = selectedKnittingTypes.length === 0;

    const categoryItems = [
        { id: 'all', label: 'All Knitting Types' },
        ...(knittingTypes && knittingTypes.length > 0
            ? knittingTypes.map((kt) => ({ id: kt.slug, label: kt.name }))
            : [
                { id: 'single-jersey', label: 'Single Jersey' },
                { id: 'rib-knit', label: 'Rib Knit' },
                { id: 'interlock', label: 'Interlock' },
                { id: 'fleece', label: 'Fleece' },
                { id: 'pique-lacoste', label: 'Pique & Lacoste' },
                { id: 'french-terry', label: 'French Terry' },
                { id: 'flat-knit', label: 'Flat Knit' },
                { id: 'jacquard-auto-stripe', label: 'Jacquard & Auto Stripe' },
                { id: 'waffle-thermal', label: 'Waffle / Thermal' },
                { id: 'mesh-eyelet', label: 'Mesh & Eyelet' },
            ]),
    ];

    const INITIAL_LIMIT = 7;
    const [isExpanded, setIsExpanded] = useState(() => {
        return categoryItems.slice(INITIAL_LIMIT).some((c) => selectedKnittingTypes.includes(c.id));
    });

    useEffect(() => {
        if (categoryItems.slice(INITIAL_LIMIT).some((c) => selectedKnittingTypes.includes(c.id))) {
            setIsExpanded(true);
        }
    }, [filters.knitting_type]);

    const visibleCategories = isExpanded ? categoryItems : categoryItems.slice(0, INITIAL_LIMIT);
    const hiddenCount = categoryItems.length - INITIAL_LIMIT;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [activeGateTitle, setActiveGateTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setSortDropdownOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSortDropdownOpen(false);
            }
        };

        if (sortDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [sortDropdownOpen]);

    const currentSortOption = SORT_OPTIONS.find((opt) => opt.id === (filters.sort || 'latest')) || SORT_OPTIONS[0];
    const CurrentSortIcon = currentSortOption.icon;

    // Apply filters helper
    const applyFilters = (overrides: Partial<typeof filters>) => {
        const currentKnittingType = filters.knitting_type || filters.category || 'all';
        const params: Record<string, any> = {
            search: overrides.search !== undefined ? overrides.search : searchTerm,
            knitting_type: overrides.knitting_type !== undefined ? overrides.knitting_type : currentKnittingType,
            district: overrides.district !== undefined ? overrides.district : (filters.district || 'all'),
            urgent_only: overrides.urgent_only !== undefined ? overrides.urgent_only : (filters.urgent_only || false),
            negotiable_only: overrides.negotiable_only !== undefined ? overrides.negotiable_only : (filters.negotiable_only || false),
            verified_only: overrides.verified_only !== undefined ? overrides.verified_only : (filters.verified_only || false),
            quantity: overrides.quantity !== undefined ? overrides.quantity : (filters.quantity || 'all'),
            sort: overrides.sort !== undefined ? overrides.sort : (filters.sort || 'latest'),
        };

        // Remove default / empty values from URL
        const cleaned: Record<string, any> = {};
        Object.keys(params).forEach((k) => {
            if (params[k] !== 'all' && params[k] !== false && params[k] !== '' && params[k] !== undefined) {
                cleaned[k] = params[k];
            }
        });

        router.get(route('feed.index'), cleaned, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleKnittingType = (slug: string) => {
        if (slug === 'all') {
            applyFilters({ knitting_type: 'all' });
            return;
        }

        let nextSelected: string[];
        if (selectedKnittingTypes.includes(slug)) {
            nextSelected = selectedKnittingTypes.filter((s) => s !== slug);
        } else {
            nextSelected = [...selectedKnittingTypes, slug];
        }

        const nextVal = nextSelected.length > 0 ? nextSelected.join(',') : 'all';
        applyFilters({ knitting_type: nextVal });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        applyFilters({ search: '' });
    };

    const handleResetAll = () => {
        setSearchTerm('');
        router.get(route('feed.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Check if any filter is active
    const hasActiveFilters = 
        Boolean(filters.search) || 
        (filters.district && filters.district !== 'all') || 
        selectedKnittingTypes.length > 0 || 
        Boolean(filters.urgent_only) || 
        Boolean(filters.negotiable_only) || 
        Boolean(filters.verified_only) || 
        (filters.quantity && filters.quantity !== 'all') ||
        (filters.sort && filters.sort !== 'latest');

    const activeFilterCount = [
        Boolean(filters.search),
        filters.district && filters.district !== 'all',
        selectedKnittingTypes.length > 0,
        Boolean(filters.urgent_only),
        Boolean(filters.negotiable_only),
        Boolean(filters.verified_only),
        filters.quantity && filters.quantity !== 'all',
        filters.sort && filters.sort !== 'latest'
    ].filter(Boolean).length;

    const handleGatedAction = (title: string, postId: number) => {
        if (!auth.user || !userCanViewFullDetails) {
            setActiveGateTitle(title);
            setAuthModalOpen(true);
        } else {
            router.get(route('feed.show', postId));
        }
    };

    return (
        <ShilposetuLayout onCreatePostClick={() => setCreateModalOpen(true)}>
            <Head title="Shilposetu Subcontract Feed | Digital RMG Capacity Exchange" />

            {/* Sky Blue Hero Banner */}
            <section className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white py-7 sm:py-8 border-b border-sky-400/30 relative overflow-hidden shadow-xs">
                {/* Subtle Luminous Grid Background Accent */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Connecting Extra Orders with Verified Factories • Smart Subcontracting</span>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white text-center drop-shadow-xs">
                            Digital <span className="text-yellow-300">Subcontracting</span> & Extra Orders Board
                        </h1>
                        
                        <p className="text-sky-50 text-xs sm:text-sm leading-relaxed max-w-2xl text-center font-medium">
                            Have extra orders beyond factory capacity? Post your demand for specialized Knitting and connect directly with verified industrial units across the country.
                        </p>

                        <div className="pt-1 flex flex-wrap items-center justify-center gap-3 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-semibold bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 rounded-full text-white shadow-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                100% Verified Factories
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-semibold bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 rounded-full text-white shadow-xs">
                                <ShieldCheck className="w-4 h-4 text-sky-100" />
                                Zero Broker Commission
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-semibold bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 rounded-full text-white shadow-xs">
                                <Clock className="w-4 h-4 text-amber-200" />
                                Real-time Capacity Bidding
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Workspace: Left Sidebar + Feed */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Mobile Filter Toggle Button */}
                <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs mb-6">
                    <button
                        type="button"
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                        <span>Filter & Search</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>Post Demand</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ======================================================== */}
                    {/* LEFT SIDEBAR: Comprehensive Search, Facets & Filters     */}
                    {/* ======================================================== */}
                    <aside className={`lg:col-span-4 xl:col-span-3.5 space-y-5 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                        <div className="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 pb-6">

                            {/* Sidebar Header & Reset */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <SlidersHorizontal className="w-3.5 h-3.5" />
                                        </div>
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                            Search & Filters
                                        </h2>
                                    </div>

                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={handleResetAll}
                                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            <span>Reset All</span>
                                        </button>
                                    )}
                                </div>

                                {/* Keyword Search Input */}
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search order, fabric, mill..."
                                        className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-blue-500 placeholder-slate-400 font-medium"
                                    />
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                            title="Clear search"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* Quick Attribute Toggles */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                                    Order Badges
                                </span>

                                <div className="space-y-1.5">
                                    {/* Urgent Only */}
                                    <button
                                        type="button"
                                        onClick={() => applyFilters({ urgent_only: !filters.urgent_only })}
                                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                            filters.urgent_only
                                                ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs font-bold'
                                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <Flame className={`w-3.5 h-3.5 ${filters.urgent_only ? 'text-rose-600' : 'text-slate-400'}`} />
                                            <span>Urgent Orders Only</span>
                                        </span>
                                        <span className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                                            filters.urgent_only ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                                        }`}>
                                            {filters.urgent_only && <Check className="w-3 h-3 stroke-[3]" />}
                                        </span>
                                    </button>

                                    {/* Negotiable Rate */}
                                    <button
                                        type="button"
                                        onClick={() => applyFilters({ negotiable_only: !filters.negotiable_only })}
                                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                            filters.negotiable_only
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs font-bold'
                                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <Handshake className={`w-3.5 h-3.5 ${filters.negotiable_only ? 'text-emerald-600' : 'text-slate-400'}`} />
                                            <span>Negotiable Rate Only</span>
                                        </span>
                                        <span className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                                            filters.negotiable_only ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                                        }`}>
                                            {filters.negotiable_only && <Check className="w-3 h-3 stroke-[3]" />}
                                        </span>
                                    </button>

                                    {/* Verified Mill Only */}
                                    <button
                                        type="button"
                                        onClick={() => applyFilters({ verified_only: !filters.verified_only })}
                                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                                            filters.verified_only
                                                ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs font-bold'
                                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <ShieldCheck className={`w-3.5 h-3.5 ${filters.verified_only ? 'text-blue-600' : 'text-slate-400'}`} />
                                            <span>Verified Mills Only</span>
                                        </span>
                                        <span className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] ${
                                            filters.verified_only ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                                        }`}>
                                            {filters.verified_only && <Check className="w-3 h-3 stroke-[3]" />}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Category: Specialized Knitting Types */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Knitting Categories
                                    </span>
                                    {selectedKnittingTypes.length > 0 && (
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                            {selectedKnittingTypes.length} active
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {visibleCategories.map((cat) => {
                                        const isAllPill = cat.id === 'all';
                                        const isSelected = isAllPill ? isAllSelected : selectedKnittingTypes.includes(cat.id);

                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => handleToggleKnittingType(cat.id)}
                                                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer text-left ${
                                                    isSelected
                                                        ? 'bg-blue-50 border border-blue-200 font-bold text-blue-900'
                                                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                                                }`}
                                            >
                                                <span className="truncate pr-1">{cat.label}</span>
                                                <div className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                                                    isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : 'border-slate-300 bg-white'
                                                }`}>
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {hiddenCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 pt-1 flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                        <span>{isExpanded ? 'Show Less' : `+ Show More (${hiddenCount})`}</span>
                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                )}
                            </div>

                            {/* Location: Industrial Districts */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                                    Industrial Hub / District
                                </span>

                                <select
                                    value={filters.district || 'all'}
                                    onChange={(e) => applyFilters({ district: e.target.value })}
                                    className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-blue-500 font-medium text-slate-700 bg-white"
                                >
                                    <option value="all">All Industrial Hubs</option>
                                    <option value="Gazipur">Gazipur</option>
                                    <option value="Ashulia">Ashulia / Savar</option>
                                    <option value="Tongi">Tongi</option>
                                    <option value="Narayanganj">Narayanganj</option>
                                    <option value="Tangail">Tangail / Mirzapur</option>
                                    <option value="Dhaka">Dhaka</option>
                                    <option value="Chittagong">Chittagong</option>
                                    {districts?.filter(d => !['Gazipur', 'Ashulia', 'Tongi', 'Narayanganj', 'Tangail', 'Dhaka', 'Chittagong'].includes(d)).map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Order Quantity / Volume Range */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                                    Order Volume (Kg / Pcs)
                                </span>

                                <div className="space-y-1">
                                    {[
                                        { key: 'all', label: 'Any Volume' },
                                        { key: 'under_5k', label: 'Sample (< 5,000)' },
                                        { key: '5k_20k', label: 'Medium (5,000 – 20,000)' },
                                        { key: '20k_50k', label: 'Bulk (20,000 – 50,000)' },
                                        { key: '50k_plus', label: 'Mega Order (50,000+)' },
                                    ].map((opt) => {
                                        const isSelected = (filters.quantity || 'all') === opt.key;
                                        return (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => applyFilters({ quantity: opt.key })}
                                                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer text-left ${
                                                    isSelected
                                                        ? 'bg-blue-50 border border-blue-200 font-bold text-blue-900'
                                                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                                }`}>
                                                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </aside>

                    {/* ======================================================== */}
                    {/* MAIN COLUMN: Subcontract Feed, Sorting & Live Orders     */}
                    {/* ======================================================== */}
                    <main className="lg:col-span-8 xl:col-span-8.5 space-y-4">
                        
                        {/* Feed Header with Live Stats & Sorting Toolbar */}
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-slate-900">
                                            Subcontract Live Feed
                                        </h2>
                                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                                            {posts.total} Orders
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Have extra production capacity? Bid and connect directly with order posters.
                                    </p>
                                </div>
                            </div>

                            {/* Custom Sort Dropdown */}
                            <div className="relative self-start sm:self-auto" ref={sortDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setSortDropdownOpen((prev) => !prev)}
                                    aria-expanded={sortDropdownOpen}
                                    aria-haspopup="listbox"
                                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-150 shadow-2xs cursor-pointer ${
                                        sortDropdownOpen
                                            ? 'bg-blue-50/80 border-blue-300 text-blue-900 ring-2 ring-blue-500/20'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="flex items-center gap-1.5 text-slate-400">
                                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[11px] font-medium text-slate-400">Sort:</span>
                                    </span>
                                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <CurrentSortIcon className="w-3.5 h-3.5 text-blue-600" />
                                        <span>{currentSortOption.label}</span>
                                    </span>
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                            sortDropdownOpen ? 'rotate-180 text-blue-600' : ''
                                        }`}
                                    />
                                </button>

                                {/* Dropdown Menu Popover */}
                                {sortDropdownOpen && (
                                    <div
                                        role="listbox"
                                        aria-label="Sort subcontract orders"
                                        className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 z-30 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                                    >
                                        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                Sort Subcontract Feed
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full">
                                                4 Options
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            {SORT_OPTIONS.map((opt) => {
                                                const isSelected = (filters.sort || 'latest') === opt.id;
                                                const Icon = opt.icon;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={isSelected}
                                                        onClick={() => {
                                                            applyFilters({ sort: opt.id });
                                                            setSortDropdownOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-blue-50/90 text-blue-900 ring-1 ring-blue-500/20 shadow-2xs'
                                                                : 'hover:bg-slate-50 text-slate-700'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                                                                isSelected
                                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                                    : `${opt.iconColor}`
                                                            }`}
                                                        >
                                                            <Icon className="w-4 h-4" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span
                                                                    className={`text-xs font-bold leading-none ${
                                                                        isSelected ? 'text-blue-950 font-extrabold' : 'text-slate-800'
                                                                    }`}
                                                                >
                                                                    {opt.label}
                                                                </span>
                                                                {isSelected && (
                                                                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-1.5 shadow-2xs">
                                                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-1">
                                                                {opt.description}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Active Filter Tags Bar */}
                        {hasActiveFilters && (
                            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                                        Active Filters:
                                    </span>

                                    {filters.search && (
                                        <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-lg text-xs font-medium">
                                            <span>"{filters.search}"</span>
                                            <button onClick={handleClearSearch} className="text-slate-400 hover:text-slate-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}

                                    {selectedKnittingTypes.map((st) => (
                                        <span key={st} className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-lg text-xs font-semibold">
                                            <span>{st.replace(/[-_]/g, ' ')}</span>
                                            <button onClick={() => handleToggleKnittingType(st)} className="text-blue-400 hover:text-blue-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}

                                    {filters.district && filters.district !== 'all' && (
                                        <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-lg text-xs font-medium">
                                            <span>District: {filters.district}</span>
                                            <button onClick={() => applyFilters({ district: 'all' })} className="text-slate-400 hover:text-slate-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}

                                    {filters.quantity && filters.quantity !== 'all' && (
                                        <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-lg text-xs font-medium">
                                            <span>Qty: {filters.quantity.replace(/_/g, ' ')}</span>
                                            <button onClick={() => applyFilters({ quantity: 'all' })} className="text-slate-400 hover:text-slate-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}

                                    {filters.urgent_only && (
                                        <span className="inline-flex items-center gap-1 bg-rose-100 border border-rose-200 text-rose-800 px-2 py-0.5 rounded-lg text-xs font-semibold">
                                            <span>Urgent Orders</span>
                                            <button onClick={() => applyFilters({ urgent_only: false })} className="text-rose-400 hover:text-rose-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}

                                    {filters.negotiable_only && (
                                        <span className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-lg text-xs font-semibold">
                                            <span>Negotiable Rates</span>
                                            <button onClick={() => applyFilters({ negotiable_only: false })} className="text-emerald-400 hover:text-emerald-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}

                                    {filters.verified_only && (
                                        <span className="inline-flex items-center gap-1 bg-blue-100 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-lg text-xs font-semibold">
                                            <span>Verified Mills</span>
                                            <button onClick={() => applyFilters({ verified_only: false })} className="text-blue-400 hover:text-blue-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}

                                    {filters.sort && filters.sort !== 'latest' && (
                                        <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-lg text-xs font-medium">
                                            <span>Sort: {currentSortOption.label}</span>
                                            <button onClick={() => applyFilters({ sort: 'latest' })} className="text-slate-400 hover:text-slate-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={handleResetAll}
                                    className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer shrink-0"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}

                        {/* Order Posts List */}
                        {posts?.data?.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="text-base font-bold text-slate-800">No Extra Orders Found</h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    No subcontract orders match your active filter criteria. Try resetting filters or post an order requirement!
                                </p>
                                <div className="pt-2 flex items-center justify-center gap-3">
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleResetAll}
                                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            Reset Filters
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setCreateModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        Create Subcontract Post
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts?.data?.map((post) => (
                                    <article
                                        key={post.id}
                                        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden group"
                                    >
                                        {/* Card Header */}
                                        <div className="px-4 py-3 sm:px-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs shrink-0">
                                                    {post.factory?.business_name ? post.factory.business_name.charAt(0) : post.user.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight truncate group-hover:text-blue-600 transition-colors">
                                                            {post.factory?.business_name || post.user.name}
                                                        </h3>
                                                        {post.factory?.is_verified && (
                                                            <span title="Verified Bangladesh Factory" className="shrink-0">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                                                        <span className="flex items-center gap-0.5 text-slate-500">
                                                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                            {post.district}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Header Badges */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {post.is_urgent && (
                                                    <span className="bg-rose-50 text-rose-700 border border-rose-200/80 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 animate-pulse">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        URGENT
                                                    </span>
                                                )}
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                                    Need Subcontract
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="px-4 py-3.5 sm:px-5 space-y-2.5">
                                            {/* Category & Title */}
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md shrink-0">
                                                    {post.category.replace(/[-_]/g, ' ')}
                                                </span>
                                                <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                    {post.title}
                                                </h4>
                                            </div>

                                            {/* Compact Key Order Metrics Strip */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 px-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Qty:</span>
                                                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                                                        {post.target_quantity.toLocaleString()} {post.unit}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate:</span>
                                                    <span className="font-black text-emerald-600 text-xs sm:text-sm">
                                                        {post.target_rate ? `${post.target_rate} ৳/${post.unit}` : 'Negotiable'}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-1.5 min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Area:</span>
                                                    <span className="font-semibold text-slate-700 truncate text-xs">
                                                        {post.district}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-1.5 min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadline:</span>
                                                    <span className="font-semibold text-slate-700 text-xs flex items-center gap-1 truncate">
                                                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                                        {formatDeadline(post.deadline)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Specs */}
                                            {post.specs && (post.specs.machine_type || post.specs.no_of_lines || post.specs.total_capacity || post.specs.item_type || post.specs.process_capability) && (
                                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5 flex items-center gap-1">
                                                        <Layers className="w-3 h-3 text-indigo-500" />
                                                        Specs:
                                                    </span>
                                                    {post.specs.machine_type && (
                                                        <span className="inline-flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/70">
                                                            <span className="text-slate-400">Machine:</span>
                                                            <strong className="font-semibold text-slate-800">{post.specs.machine_type}</strong>
                                                            {post.specs.machine_qty ? <span className="text-indigo-600 font-medium">({post.specs.machine_qty} Sets)</span> : null}
                                                        </span>
                                                    )}
                                                    {post.specs.total_capacity && (
                                                        <span className="inline-flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/70">
                                                            <span className="text-slate-400">Capacity:</span>
                                                            <strong className="font-semibold text-slate-800">{post.specs.total_capacity}</strong>
                                                        </span>
                                                    )}
                                                    {post.specs.item_type && (
                                                        <span className="inline-flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/70">
                                                            <span className="text-slate-400">Item:</span>
                                                            <strong className="font-semibold text-slate-800">{post.specs.item_type}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {post.description && (
                                                <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                                                    {post.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-4 py-2.5 sm:px-5 bg-slate-50/60 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5 text-xs text-slate-400">
                                                <span className="flex items-center gap-1 font-medium text-slate-600">
                                                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                                    <strong>{post.quotations?.length || 0}</strong> Bids
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                    {post.views_count} Views
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleGatedAction(post.title, post.id)}
                                                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition transform active:scale-95 cursor-pointer"
                                                >
                                                    <span>View Details & Bid</span>
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="flex items-center justify-between pt-4 pb-8 text-xs">
                                <span className="text-slate-500 font-medium">
                                    Page {posts.current_page} of {posts.last_page} ({posts.total} total orders)
                                </span>
                                <div className="flex gap-2">
                                    {posts.prev_page_url ? (
                                        <Link
                                            href={posts.prev_page_url}
                                            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                                        >
                                            Previous
                                        </Link>
                                    ) : (
                                        <span className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-400 cursor-not-allowed">
                                            Previous
                                        </span>
                                    )}
                                    {posts.next_page_url ? (
                                        <Link
                                            href={posts.next_page_url}
                                            className="px-3.5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xs transition"
                                        >
                                            Next Page
                                        </Link>
                                    ) : (
                                        <span className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-400 cursor-not-allowed">
                                            Next Page
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>

                </div>
            </div>

            {/* Auth Gate Modal (Freemium Paywall) */}
            <AuthGateModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                postTitle={activeGateTitle}
                isLoggedIn={!!auth.user}
            />

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                user={auth.user}
                knittingTypes={knittingTypes}
                onNeedAuth={() => {
                    setActiveGateTitle('Create Subcontract Order');
                    setAuthModalOpen(true);
                }}
            />
        </ShilposetuLayout>
    );
}
