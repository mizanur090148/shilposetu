import React, { useState } from 'react';
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
    Phone,
    Building2
} from 'lucide-react';

interface VendorItem {
    id: number;
    business_name: string;
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
    };
    districts: string[];
}

export default function VendorsIndex({ factories, filters, districts }: VendorsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('vendors.index'), {
            search,
            district: filters.district,
        }, {
            preserveState: true,
        });
    };

    const handleDistrictChange = (district: string) => {
        router.get(route('vendors.index'), {
            search: filters.search,
            district,
        }, {
            preserveState: true,
        });
    };

    return (
        <ShilposetuLayout>
            <Head title="Verified Factory & Industrial Directory | Shilposetu" />

            <div className="bg-slate-900 text-white py-10 px-4 border-b border-slate-800">
                <div className="max-w-7xl mx-auto space-y-2">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                        Bangladesh Industrial Ecosystem
                    </span>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Verified Apparel & Textile Factory Directory
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                        Discover compliant manufacturing plants, washing units, and knitting mills with verified production line capacities and legal credentials.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search factory by name, machinery or process..."
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </form>

                    <div className="w-full md:w-64">
                        <select
                            value={filters.district}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="w-full text-sm py-2 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="all">All Industrial Districts</option>
                            {districts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Factories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {factories.data.map((factory) => (
                        <div 
                            key={factory.id}
                            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-base">
                                            {factory.business_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                                                    {factory.business_name}
                                                </h3>
                                                {factory.is_verified && (
                                                    <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                {factory.district}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        {factory.rating}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                    {factory.address}
                                </p>

                                {/* Capacity Stats */}
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Production Lines</span>
                                        <strong className="text-slate-900 text-sm">{factory.total_lines} Lines</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Daily Capacity</span>
                                        <strong className="text-emerald-700 text-sm">{factory.daily_capacity || 'N/A'}</strong>
                                    </div>
                                </div>

                                {/* Capabilities Chips */}
                                {factory.capabilities && factory.capabilities.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {factory.capabilities.map((cap, i) => (
                                            <span 
                                                key={i}
                                                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                                            >
                                                {cap}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                    ID: <strong className="text-slate-600">{factory.user?.customer_id}</strong>
                                </span>
                                <Link
                                    href={route('vendors.show', factory.id)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl transition"
                                >
                                    View Full Profile
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ShilposetuLayout>
    );
}
