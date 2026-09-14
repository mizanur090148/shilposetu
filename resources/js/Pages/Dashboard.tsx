import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import CreatePostModal from '@/Components/CreatePostModal';
import { 
    Factory, 
    Layers, 
    CheckCircle2, 
    PlusCircle, 
    TrendingUp, 
    BarChart3, 
    Clock, 
    Calendar, 
    MapPin, 
    DollarSign, 
    ShieldCheck, 
    ArrowUpRight,
    Building2,
    Users
} from 'lucide-react';

interface DashboardProps {
    factory: any;
    kpis: {
        active_rfqs: number;
        total_quotations_received: number;
        factory_lines: number;
        is_verified: boolean;
        is_subscribed: boolean;
        customer_id: string;
    };
    userPosts: any[];
    quotationsSubmitted: any[];
    categoryBreakdown: Array<{ name: string; value: number; color: string }>;
    auth: {
        user: any;
    };
}

export default function Dashboard({ 
    factory, 
    kpis, 
    userPosts, 
    quotationsSubmitted, 
    categoryBreakdown,
    auth 
}: DashboardProps) {
    const user = auth.user;
    const [createModalOpen, setCreateModalOpen] = useState(false);

    return (
        <ShilposetuLayout onCreatePostClick={() => setCreateModalOpen(true)}>
            <Head title="Factory Dashboard - Shilposetu" />

            {/* Top Industrial Greeting Bar (matching Page 1 Screen 2) */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                                    Good morning, {user.name}!
                                </h1>
                                {kpis.is_verified && (
                                    <span title="Verified Factory Unit">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Customer ID: <strong className="text-slate-800">{kpis.customer_id}</strong> • {factory?.business_name || 'Individual Manufacturer'} • {factory?.district || 'Bangladesh'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCreateModalOpen(true)}
                                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Create New RFQ / Post
                            </button>
                            <Link
                                href={route('subscription.index')}
                                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition"
                            >
                                Subscription Plan
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* 4 KPI Summary Cards (matching Page 1 Screen 2) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">My Active RFQs</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-blue-600">{kpis.active_rfqs}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Open subcontract orders</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Quotes Received</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-indigo-600">{kpis.total_quotations_received}</span>
                            <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">Bids</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Offers from other mills</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Factory Lines</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-emerald-600">{kpis.factory_lines}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Operational</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Dedicated sewing/knitting lines</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Membership Status</span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-lg font-black text-amber-500">
                                {kpis.is_subscribed ? 'Active' : 'Free / Pending'}
                            </span>
                            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Page 7</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">50 Tk/mo subscription</p>
                    </div>
                </div>

                {/* Middle Grid: Order Summary Breakdown & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: My Subcontract Orders Table */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Recent Subcontract Orders</h3>
                                <p className="text-xs text-slate-500">Orders you posted to find sub-contractors</p>
                            </div>
                            <button
                                onClick={() => setCreateModalOpen(true)}
                                className="text-xs text-blue-600 font-bold hover:underline"
                            >
                                + Post New
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                                    <tr>
                                        <th className="p-4">Order Title</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Quantity</th>
                                        <th className="p-4">Quotations</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {userPosts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400">
                                                You haven't posted any subcontract orders yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        userPosts.map((post) => (
                                            <tr key={post.id} className="hover:bg-slate-50 transition">
                                                <td className="p-4 font-bold text-slate-900 max-w-xs truncate">
                                                    {post.title}
                                                </td>
                                                <td className="p-4 capitalize text-slate-600">
                                                    {post.category.replace('_', ' ')}
                                                </td>
                                                <td className="p-4 font-semibold text-slate-800">
                                                    {post.target_quantity.toLocaleString()} {post.unit}
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                                                        {post.quotations_count} Bids
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Link
                                                        href={route('quotations.compare', post.id)}
                                                        className="text-blue-600 font-bold hover:underline"
                                                    >
                                                        Compare Quotes
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Order Summary Donut/Progress Breakdown (matching Page 1 Screen 2) */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Order Summary Breakdown</h3>
                            <p className="text-xs text-slate-500">Distribution by manufacturing sector</p>
                        </div>

                        {/* Visual Breakdown Bars */}
                        <div className="space-y-3 pt-2">
                            {categoryBreakdown.map((cat, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-700">{cat.name}</span>
                                        <span className="text-slate-900 font-bold">{cat.value} Orders</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ 
                                                width: `${Math.min(100, Math.max(15, cat.value * 25))}%`, 
                                                backgroundColor: cat.color 
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Action Box */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs space-y-2 mt-4">
                            <span className="font-bold text-slate-800 block">Need Idle Capacity Immediately?</span>
                            <p className="text-slate-500 text-[11px]">
                                Browse 50,000+ mills and industrial plants nationwide across the whole country.
                            </p>
                            <Link
                                href={route('vendors.index')}
                                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                            >
                                Open Factory Directory <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <CreatePostModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                user={user}
                onNeedAuth={() => {}}
            />
        </ShilposetuLayout>
    );
}
