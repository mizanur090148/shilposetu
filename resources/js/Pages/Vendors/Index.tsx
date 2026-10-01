import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { 
    Factory, 
    Search, 
    MapPin, 
    CheckCircle2, 
    Star, 
    Layers, 
    ArrowRight, 
    ShieldCheck, 
    SlidersHorizontal,
    RotateCcw,
    X,
    Building2,
    Sliders,
    Award,
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Sparkles
} from 'lucide-react';

import { KnittingType } from '@/types';

interface VendorItem {
    id: number;
    business_name: string;
    logo?: string | null;
    industry_type: string;
    contact_person: string;
    district: string;
    address: string;
    total_lines: number;
    total_machines: number;
    daily_capacity: string;
    is_verified: boolean;
    rating: number;
    capabilities: string[] | null;
    knitting_types?: KnittingType[];
    user: {
        id: number;
        name: string;
        customer_id: string;
        phone: string | null;
        email: string;
    };
}

interface VendorsIndexProps {
    factories: {
        data: VendorItem[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        search: string;
        district: string;
        knitting_type?: string;
        industry?: string;
        lines: string;
        verified_only: boolean;
        sort: string;
    };
    districts: string[];
    knittingTypes?: KnittingType[];
    stats: {
        total: number;
        verified: number;
        total_lines: number;
    };
}

export default function VendorsIndex({ 
    factories, 
    filters, 
    districts, 
    knittingTypes = [], 
    stats 
}: VendorsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    // Parse comma-separated or array of active knitting types
    const parseSelectedKnittingTypes = (raw: string | undefined): string[] => {
        if (!raw || raw === 'all') return [];
        return raw.split(',').map((s) => s.trim()).filter(Boolean);
    };

    const selectedKnittingTypes = parseSelectedKnittingTypes(filters.knitting_type || filters.industry);
    const isAllSelected = selectedKnittingTypes.length === 0;

    const knittingTypePills = [
        { key: 'all', label: 'All Knitting Types' },
        ...(knittingTypes && knittingTypes.length > 0
            ? knittingTypes.map((kt) => ({ key: kt.slug, label: kt.name }))
            : [
                { key: 'single-jersey', label: 'Single Jersey' },
                { key: 'rib-knit', label: 'Rib Knit' },
                { key: 'interlock', label: 'Interlock' },
                { key: 'fleece', label: 'Fleece' },
                { key: 'pique-lacoste', label: 'Pique & Lacoste' },
                { key: 'french-terry', label: 'French Terry' },
                { key: 'flat-knit', label: 'Flat Knit' },
                { key: 'jacquard-auto-stripe', label: 'Jacquard & Auto Stripe' },
            ]),
    ];

    const INITIAL_LIMIT = 8;
    const [isKnittingExpanded, setIsKnittingExpanded] = useState(() => {
        return knittingTypePills.slice(INITIAL_LIMIT).some((p) => selectedKnittingTypes.includes(p.key));
    });

    useEffect(() => {
        if (knittingTypePills.slice(INITIAL_LIMIT).some((p) => selectedKnittingTypes.includes(p.key))) {
            setIsKnittingExpanded(true);
        }
    }, [filters.knitting_type]);

    const visibleKnittingPills = isKnittingExpanded ? knittingTypePills : knittingTypePills.slice(0, INITIAL_LIMIT);
    const hiddenKnittingCount = knittingTypePills.length - INITIAL_LIMIT;

    const applyFilters = (overrides: Partial<typeof filters>) => {
        const currentKnittingType = filters.knitting_type || filters.industry || 'all';
        router.get(
            route('factories.index'),
            {
                search: overrides.search !== undefined ? overrides.search : search,
                district: overrides.district !== undefined ? overrides.district : filters.district,
                knitting_type: overrides.knitting_type !== undefined ? overrides.knitting_type : currentKnittingType,
                industry: overrides.industry !== undefined ? overrides.industry : currentKnittingType,
                lines: overrides.lines !== undefined ? overrides.lines : filters.lines,
                verified_only: overrides.verified_only !== undefined ? overrides.verified_only : filters.verified_only,
                sort: overrides.sort !== undefined ? overrides.sort : filters.sort,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleToggleKnittingType = (slug: string) => {
        if (slug === 'all') {
            applyFilters({ knitting_type: 'all', industry: 'all' });
            return;
        }

        let nextSelected: string[];
        if (selectedKnittingTypes.includes(slug)) {
            nextSelected = selectedKnittingTypes.filter((s) => s !== slug);
        } else {
            nextSelected = [...selectedKnittingTypes, slug];
        }

        const nextVal = nextSelected.length > 0 ? nextSelected.join(',') : 'all';
        applyFilters({ knitting_type: nextVal, industry: nextVal });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleClearSearch = () => {
        setSearch('');
        applyFilters({ search: '' });
    };

    const handleResetAll = () => {
        setSearch('');
        router.get(
            route('factories.index'),
            {
                search: '',
                district: 'all',
                knitting_type: 'all',
                industry: 'all',
                lines: 'all',
                verified_only: false,
                sort: 'latest',
            },
            {
                preserveState: true,
            }
        );
    };

    // Determine if any non-default filter is currently active
    const hasActiveFilters = 
        Boolean(filters.search) || 
        (filters.district && filters.district !== 'all') || 
        selectedKnittingTypes.length > 0 || 
        (filters.lines && filters.lines !== 'all') || 
        Boolean(filters.verified_only) ||
        (filters.sort && filters.sort !== 'latest');

    return (
        <ShilposetuLayout>
            <Head title="Verified Factory & Industrial Directory | Shilposetu" />

            {/* Sky Blue Industrial Header Banner */}
            <section className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white py-10 border-b border-sky-400/30 relative overflow-hidden shadow-xs">
                {/* Subtle Luminous Grid Background Accent */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                    <div className="space-y-2.5">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Government-Verified Manufacturing Directory</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-xs">
                            Nationwide Industrial & Factory <span className="text-yellow-300">Directory</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-sky-50 max-w-2xl leading-relaxed font-medium">
                            Discover compliant apparel manufacturing plants, washing units, and knitting mills with verified production lines across Bangladesh.
                        </p>
                    </div>

                    {/* KPI Counter Cards */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-3.5 min-w-[130px] text-center shadow-xs">
                            <span className="block text-2xl font-black text-white drop-shadow-xs">{stats?.total ?? factories.total}</span>
                            <span className="text-[11px] text-sky-100 font-semibold tracking-wide uppercase">Total Factories</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Quick Knitting Type Filter Pills (Multi-Select) */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap uppercase tracking-wider pl-1 mr-1">
                        Knitting Types:
                    </span>
                    {visibleKnittingPills.map((pill) => {
                        const isAllPill = pill.key === 'all';
                        const isSelected = isAllPill ? isAllSelected : selectedKnittingTypes.includes(pill.key);

                        return (
                            <button
                                key={pill.key}
                                type="button"
                                onClick={() => handleToggleKnittingType(pill.key)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isSelected
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {isSelected && !isAllPill && (
                                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                                )}
                                <span>{pill.label}</span>
                                {isAllPill && selectedKnittingTypes.length > 0 && (
                                    <span className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.2">Reset</span>
                                )}
                            </button>
                        );
                    })}

                    {hiddenKnittingCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsKnittingExpanded(!isKnittingExpanded)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 transition-all cursor-pointer shadow-xs"
                        >
                            <span>{isKnittingExpanded ? 'Show Less' : `+ More (${hiddenKnittingCount})`}</span>
                            {isKnittingExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>
                    )}
                </div>

                {/* Main Filter Toolbar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                        
                        {/* Search Input (5 cols) */}
                        <form onSubmit={handleSearch} className="lg:col-span-4 relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, machinery, process..."
                                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>

                        {/* District Filter (2 cols) */}
                        <div className="lg:col-span-2">
                            <select
                                value={filters.district || 'all'}
                                onChange={(e) => applyFilters({ district: e.target.value })}
                                className="w-full text-xs py-2 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 font-medium text-slate-700"
                            >
                                <option value="all">All Districts (সমগ্র বাংলাদেশ)</option>
                                {districts.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        {/* Production Lines Filter (2 cols) */}
                        <div className="lg:col-span-2">
                            <select
                                value={filters.lines || 'all'}
                                onChange={(e) => applyFilters({ lines: e.target.value })}
                                className="w-full text-xs py-2 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 font-medium text-slate-700"
                            >
                                <option value="all">Any Line Capacity</option>
                                <option value="1-10">Small (1 – 10 Lines)</option>
                                <option value="11-25">Medium (11 – 25 Lines)</option>
                                <option value="25+">Large (25+ Lines)</option>
                            </select>
                        </div>

                        {/* Sort By Filter (2 cols) */}
                        <div className="lg:col-span-2">
                            <select
                                value={filters.sort || 'latest'}
                                onChange={(e) => applyFilters({ sort: e.target.value })}
                                className="w-full text-xs py-2 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 font-medium text-slate-700"
                            >
                                <option value="latest">Newest Registered</option>
                                <option value="rating_desc">Highest Rated</option>
                                <option value="lines_desc">Most Production Lines</option>
                                <option value="name_asc">Factory Name (A - Z)</option>
                            </select>
                        </div>

                        {/* Verified Only Toggle (2 cols) */}
                        <div className="lg:col-span-2 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => applyFilters({ verified_only: !filters.verified_only })}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                                    filters.verified_only 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                <CheckCircle2 className={`w-3.5 h-3.5 ${filters.verified_only ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span>Verified Only</span>
                            </button>
                        </div>

                    </div>

                    {/* Active Filter Tags & Reset Bar */}
                    {hasActiveFilters && (
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                                <span className="font-semibold text-slate-400 mr-1">Active Filters:</span>
                                
                                {filters.search && (
                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
                                        "{filters.search}"
                                        <button onClick={handleClearSearch}><X className="w-3 h-3 text-slate-400 hover:text-slate-600" /></button>
                                    </span>
                                )}

                                {filters.district && filters.district !== 'all' && (
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg font-medium">
                                        District: {filters.district}
                                        <button onClick={() => applyFilters({ district: 'all' })}><X className="w-3 h-3 text-blue-500 hover:text-blue-700" /></button>
                                    </span>
                                )}

                                {selectedKnittingTypes.length > 0 && (
                                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg font-medium">
                                        Knitting ({selectedKnittingTypes.length}): {selectedKnittingTypes.map((k) => {
                                            const match = knittingTypePills.find((p) => p.key === k);
                                            return match ? match.label : k;
                                        }).join(', ')}
                                        <button onClick={() => applyFilters({ knitting_type: 'all', industry: 'all' })}><X className="w-3 h-3 text-indigo-500 hover:text-indigo-700" /></button>
                                    </span>
                                )}

                                {filters.lines && filters.lines !== 'all' && (
                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg font-medium">
                                        Capacity: {filters.lines === '25+' ? '25+ Lines' : `${filters.lines} Lines`}
                                        <button onClick={() => applyFilters({ lines: 'all' })}><X className="w-3 h-3 text-amber-600 hover:text-amber-800" /></button>
                                    </span>
                                )}

                                {filters.verified_only && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg font-medium">
                                        Verified Only
                                        <button onClick={() => applyFilters({ verified_only: false })}><X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" /></button>
                                    </span>
                                )}

                                {filters.sort && filters.sort !== 'latest' && (
                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg font-medium">
                                        Sorted
                                        <button onClick={() => applyFilters({ sort: 'latest' })}><X className="w-3 h-3 text-purple-500 hover:text-purple-700" /></button>
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={handleResetAll}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Filter Result Count Bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>
                        Showing <strong className="text-slate-800 font-bold">{factories.data.length}</strong> of{' '}
                        <strong className="text-slate-800 font-bold">{factories.total}</strong> factories
                    </span>
                    {factories.last_page > 1 && (
                        <span>
                            Page <strong className="text-slate-800">{factories.current_page}</strong> of{' '}
                            <strong className="text-slate-800">{factories.last_page}</strong>
                        </span>
                    )}
                </div>

                {/* Empty State */}
                {factories.data.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                            <Factory className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900">No factories found</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                No industrial plants matched your exact filter combination. Try adjusting your district or capacity filters.
                            </p>
                        </div>
                        <button
                            onClick={handleResetAll}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    /* Factories Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {factories.data.map((factory) => (
                            <div 
                                key={factory.id}
                                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            {factory.logo ? (
                                                <img
                                                    src={`/storage/${factory.logo}`}
                                                    alt={factory.business_name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-base flex-shrink-0">
                                                    {factory.business_name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                                                        {factory.business_name}
                                                    </h3>
                                                    {factory.is_verified && (
                                                        <span title="Government Verified Factory Unit">
                                                            <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50 flex-shrink-0" />
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                    <span>{factory.district}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                                                        Knitting
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg flex-shrink-0">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            {factory.rating}
                                        </span>
                                    </div>

                                    {/* Specialized Knitting Types */}
                                    {factory.knitting_types && factory.knitting_types.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">
                                                Types:
                                            </span>
                                            {factory.knitting_types.slice(0, 3).map((kt) => (
                                                <span
                                                    key={kt.id}
                                                    className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80 px-2 py-0.5 rounded-full"
                                                >
                                                    {kt.name}
                                                </span>
                                            ))}
                                            {factory.knitting_types.length > 3 && (
                                                <span className="text-[10px] text-slate-400 font-medium px-1 py-0.5">
                                                    +{factory.knitting_types.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                        {factory.address || 'Industrial plant address verified by platform.'}
                                    </p>

                                    {/* Capacity Stats */}
                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Production Lines</span>
                                            <strong className="text-slate-900 text-sm">{factory.total_lines} Lines</strong>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Daily Capacity</span>
                                            <strong className="text-emerald-700 text-sm">{factory.daily_capacity || 'Inquire'}</strong>
                                        </div>
                                    </div>

                                    {/* Capabilities Chips */}
                                    {factory.capabilities && factory.capabilities.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {factory.capabilities.slice(0, 4).map((cap, i) => (
                                                <span 
                                                    key={i}
                                                    className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                                                >
                                                    {cap}
                                                </span>
                                            ))}
                                            {factory.capabilities.length > 4 && (
                                                <span className="text-[10px] font-medium bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md">
                                                    +{factory.capabilities.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-end">
                                    <Link
                                        href={route('factories.show', factory.id)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl transition"
                                    >
                                        View Full Profile
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {factories.last_page > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-6 pb-4">
                        {factories.prev_page_url ? (
                            <Link
                                href={factories.prev_page_url}
                                className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                        )}

                        <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl">
                            Page {factories.current_page} of {factories.last_page}
                        </span>

                        {factories.next_page_url ? (
                            <Link
                                href={factories.next_page_url}
                                className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

            </div>
        </ShilposetuLayout>
    );
}
