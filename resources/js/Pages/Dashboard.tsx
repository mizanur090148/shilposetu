import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import CreatePostModal from '@/Components/CreatePostModal';
import { formatDeadline } from '@/utils/date';
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
    Users,
    Send,
    Handshake,
    Phone,
    ArrowRight,
    ExternalLink
} from 'lucide-react';

interface DashboardProps {
    factory: any;
    kpis: {
        active_rfqs: number;
        total_quotations_received: number;
        bids_submitted?: number;
        bids_accepted?: number;
        factory_lines: number;
        is_verified: boolean;
        is_subscribed: boolean;
        customer_id: string;
    };
    userPosts: any[];
    quotationsSubmitted: any[];
    categoryBreakdown: Array<{ name: string; value: number; color: string }>;
    initialTab?: string;
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
    initialTab = 'posted',
    auth 
}: DashboardProps) {
    const user = auth.user;
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Track active tab (either 'posted' = Give Subcontract, or 'taken' = Take Subcontract)
    const [activeTab, setActiveTab] = useState<'posted' | 'taken'>(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'taken' || tabParam === 'posted') return tabParam;
        }
        return initialTab === 'taken' ? 'taken' : 'posted';
    });

    const switchTab = (tab: 'posted' | 'taken') => {
        setActiveTab(tab);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const bidsSubmittedCount = kpis.bids_submitted ?? quotationsSubmitted.length;
    const bidsAcceptedCount = kpis.bids_accepted ?? quotationsSubmitted.filter(q => q.status === 'accepted').length;

    return (
        <ShilposetuLayout onCreatePostClick={() => setCreateModalOpen(true)}>
            <Head title="Factory Dashboard - Shilposetu" />

            {/* Top Industrial Greeting Bar */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                                    Good day, {user.name}!
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
                            <Link
                                href={route('factory.edit')}
                                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition"
                            >
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Factory Profile</span>
                            </Link>
                            <Link
                                href={route('subscription.index')}
                                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition"
                            >
                                <span>Subscription Plan</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* 4 KPI Summary Cards for Dual Roles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Role 1: Orders Posted (Give Subcontract) */}
                    <div 
                        onClick={() => switchTab('posted')}
                        className={`bg-white p-5 rounded-2xl border transition cursor-pointer shadow-sm ${
                            activeTab === 'posted' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Give Subcontract</span>
                            <Send className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-blue-600">{userPosts.length}</span>
                            <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">My Posts</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Orders you posted to find mills</p>
                    </div>

                    {/* Bids Received on Posted Orders */}
                    <div 
                        onClick={() => switchTab('posted')}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Quotes Received</span>
                            <BarChart3 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-indigo-600">{kpis.total_quotations_received}</span>
                            <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">Bids In</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Offers from other factories</p>
                    </div>

                    {/* Role 2: Orders Taken / Bids Submitted (Take Subcontract) */}
                    <div 
                        onClick={() => switchTab('taken')}
                        className={`bg-white p-5 rounded-2xl border transition cursor-pointer shadow-sm ${
                            activeTab === 'taken' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Take Subcontract</span>
                            <Handshake className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-emerald-600">{bidsSubmittedCount}</span>
                            {bidsAcceptedCount > 0 ? (
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {bidsAcceptedCount} Won
                                </span>
                            ) : (
                                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">My Bids</span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Orders you applied to manufacture</p>
                    </div>

                    {/* Factory Lines & Status */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase">Factory Capacity</span>
                            <Building2 className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-800">{kpis.factory_lines}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                                {kpis.is_verified ? 'Verified' : 'Lines'}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {kpis.is_subscribed ? 'SaaS Member (Active)' : 'Free Membership Plan'}
                        </p>
                    </div>
                </div>

                {/* Middle Grid: Dual-Role Subcontract Tables & Order Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Dual Role Orders Table */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Dual Role Tab Switcher Header */}
                        <div className="border-b border-slate-200 bg-slate-50/70 px-4 pt-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => switchTab('posted')}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 -mb-px ${
                                        activeTab === 'posted'
                                            ? 'bg-white border-blue-600 text-blue-600 shadow-sm'
                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Give Subcontract (Orders I Posted)</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                        activeTab === 'posted' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {userPosts.length}
                                    </span>
                                </button>

                                <button
                                    onClick={() => switchTab('taken')}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-b-2 -mb-px ${
                                        activeTab === 'taken'
                                            ? 'bg-white border-emerald-600 text-emerald-600 shadow-sm'
                                            : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <Handshake className="w-3.5 h-3.5" />
                                    <span>Take Subcontract (Orders I Bid / Taken)</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                        activeTab === 'taken' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {quotationsSubmitted.length}
                                    </span>
                                </button>
                            </div>

                            {/* {activeTab === 'posted' ? (
                                <button
                                    onClick={() => setCreateModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition mb-2"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>Post Subcontract</span>
                                </button>
                            ) : (
                                <Link
                                    href={route('feed.index')}
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition mb-2"
                                >
                                    <span>Browse Live Orders to Take</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            )} */}
                        </div>

                        {/* TAB 1: Orders I Posted (Give Subcontract) */}
                        {activeTab === 'posted' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                                        <tr>
                                            <th className="p-4">Order Details</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Target Quantity</th>
                                            <th className="p-4">Delivery Deadline</th>
                                            <th className="p-4">Bids Received</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {userPosts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-10 text-center text-slate-400 space-y-3">
                                                    <Send className="w-8 h-8 text-slate-300 mx-auto" />
                                                    <p className="font-semibold text-slate-600">You haven't posted any subcontract demands yet.</p>
                                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                                        Have extra orders beyond your capacity? Post your demand to connect with verified factories.
                                                    </p>
                                                    <button
                                                        onClick={() => setCreateModalOpen(true)}
                                                        className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-blue-700 transition"
                                                    >
                                                        <PlusCircle className="w-4 h-4" />
                                                        Post Subcontract Order
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : (
                                            userPosts.map((post) => (
                                                <tr key={post.id} className="hover:bg-slate-50 transition">
                                                    <td className="p-4">
                                                        <Link 
                                                            href={route('feed.show', post.id)} 
                                                            className="font-bold text-slate-900 hover:text-blue-600 block max-w-xs truncate"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <MapPin className="w-3 h-3" />
                                                            {post.district || 'Bangladesh'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 capitalize text-slate-600">
                                                        <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                                                            {post.category?.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 font-semibold text-slate-800">
                                                        {post.target_quantity?.toLocaleString()} {post.unit}
                                                    </td>
                                                    <td className="p-4 text-slate-500">
                                                        {formatDeadline(post.deadline)}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                                                            post.quotations_count > 0 
                                                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60' 
                                                                : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            {post.quotations_count} Bids
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {post.quotations_count > 0 ? (
                                                            <Link
                                                                href={route('quotations.compare', post.id)}
                                                                className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-lg transition"
                                                            >
                                                                Compare ({post.quotations_count})
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                href={route('feed.show', post.id)}
                                                                className="text-slate-400 hover:text-blue-600 font-medium"
                                                            >
                                                                View Order
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 2: Orders I've Taken / Bids (Take Subcontract) */}
                        {activeTab === 'taken' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                                        <tr>
                                            <th className="p-4">Order Title & Buyer</th>
                                            <th className="p-4">Category & Volume</th>
                                            <th className="p-4">My Offered Rate</th>
                                            <th className="p-4">Lead Time</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {quotationsSubmitted.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-10 text-center text-slate-400 space-y-3">
                                                    <Handshake className="w-8 h-8 text-slate-300 mx-auto" />
                                                    <p className="font-semibold text-slate-600">You haven't submitted any quotations or taken subcontract orders yet.</p>
                                                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                                        Have idle production capacity? Browse open subcontract demands posted by other mills and place your quotations.
                                                    </p>
                                                    <Link
                                                        href={route('feed.index')}
                                                        className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-700 transition"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                        Browse Live Orders to Take
                                                    </Link>
                                                </td>
                                            </tr>
                                        ) : (
                                            quotationsSubmitted.map((quote) => {
                                                const post = quote.post;
                                                const buyerName = post?.factory?.business_name || post?.user?.name || 'Buyer Factory';
                                                const buyerPhone = post?.user?.phone;
                                                const isAccepted = quote.status === 'accepted';

                                                return (
                                                    <tr key={quote.id} className={`hover:bg-slate-50 transition ${isAccepted ? 'bg-emerald-50/30' : ''}`}>
                                                        <td className="p-4">
                                                            {post ? (
                                                                <Link 
                                                                    href={route('feed.show', post.id)} 
                                                                    className="font-bold text-slate-900 hover:text-blue-600 block max-w-xs truncate"
                                                                >
                                                                    {post.title}
                                                                </Link>
                                                            ) : (
                                                                <span className="font-bold text-slate-400">Order #{quote.subcontract_post_id}</span>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                                                <span className="font-semibold text-slate-700">{buyerName}</span>
                                                                {post?.district && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-0.5">
                                                                            <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                                                            {post.district}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="p-4">
                                                            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px] block w-max capitalize">
                                                                {post?.category?.replace('_', ' ') || 'General'}
                                                            </span>
                                                            <span className="text-[11px] text-slate-600 font-medium mt-0.5 block">
                                                                {post?.target_quantity?.toLocaleString()} {post?.unit}
                                                            </span>
                                                        </td>

                                                        <td className="p-4 font-mono font-bold text-slate-900">
                                                            ৳{parseFloat(quote.offered_unit_price).toFixed(2)}
                                                            <span className="text-[10px] font-sans font-normal text-slate-400 block">
                                                                per {post?.unit || 'pc'}
                                                            </span>
                                                        </td>

                                                        <td className="p-4 font-semibold text-slate-700">
                                                            {quote.offered_lead_days} Days
                                                        </td>

                                                        <td className="p-4">
                                                            {isAccepted ? (
                                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Awarded / Won!
                                                                </span>
                                                            ) : quote.status === 'rejected' ? (
                                                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                    Not Selected
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200/60">
                                                                    <Clock className="w-3 h-3 text-amber-600" />
                                                                    Under Review
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="p-4 text-right">
                                                            <div className="flex flex-col items-end gap-1">
                                                                {post && (
                                                                    <Link
                                                                        href={route('feed.show', post.id)}
                                                                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                                                                    >
                                                                        <span>View Order</span>
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </Link>
                                                                )}
                                                                {isAccepted && buyerPhone && (
                                                                    <a
                                                                        href={`tel:${buyerPhone}`}
                                                                        className="inline-flex items-center gap-1 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-sm hover:bg-emerald-700 transition"
                                                                        title="Call Buyer"
                                                                    >
                                                                        <Phone className="w-2.5 h-2.5" />
                                                                        <span>Call Buyer</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right: Order Summary Donut/Progress Breakdown */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">National Subcontract Breakdown</h3>
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
                            <span className="font-bold text-slate-800 block">Take More Subcontract Orders</span>
                            <p className="text-slate-500 text-[11px]">
                                Have free machine hours? Browse live extra orders from buyers across Bangladesh and submit your quotation directly.
                            </p>
                            <Link
                                href={route('feed.index')}
                                className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                            >
                                <span>Browse Live Subcontracts</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
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
