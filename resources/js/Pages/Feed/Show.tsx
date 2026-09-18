import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import AuthGateModal from '@/Components/AuthGateModal';
import { formatDeadline } from '@/utils/date';
import { 
    MapPin, 
    Calendar, 
    Phone, 
    Lock, 
    Layers, 
    CheckCircle2, 
    AlertTriangle, 
    Building2, 
    ArrowLeft, 
    FileText, 
    Send,
    DollarSign,
    Clock,
    UserCheck,
    BarChart3
} from 'lucide-react';

interface PostShowProps {
    post: any;
    userCanViewFullDetails: boolean;
    isOwner: boolean;
    auth: {
        user: any;
    };
}

export default function PostShow({ post, userCanViewFullDetails, isOwner, auth }: PostShowProps) {
    const [authModalOpen, setAuthModalOpen] = useState(false);

    // Quotation bid form
    const { data, setData, post: submitBid, processing, errors, reset } = useForm({
        offered_unit_price: post.target_rate || '',
        offered_lead_days: 14,
        note: '',
    });

    const handleBidSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitBid(route('quotations.store', post.id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <ShilposetuLayout>
            <Head title={`${post.title} - Shilposetu`} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button */}
                <Link
                    href={route('feed.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Subcontract Feed
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Post Details */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                            {/* Badges & Category */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        post.post_type === 'DEMAND' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {post.post_type === 'DEMAND' ? 'Have Extra Orders (Need Subcontract)' : 'Available Capacity'}
                                    </span>
                                    <span className="text-xs font-semibold uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                                        {post.category.replace('_', ' ')}
                                    </span>
                                </div>
                                {post.is_urgent && (
                                    <span className="bg-rose-100 text-rose-700 font-bold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1 animate-pulse">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Urgent Order
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl font-black text-slate-900 leading-tight">
                                {post.title}
                            </h1>

                            {/* Author & Factory info */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                                    {post.factory?.business_name?.charAt(0) || post.user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-bold text-sm text-slate-900">
                                            {post.factory?.business_name || post.user?.name}
                                        </p>
                                        {post.factory?.is_verified && (
                                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Customer ID: <strong className="text-slate-700">{post.user?.customer_id}</strong> • Location: {post.district}
                                    </p>
                                </div>
                            </div>

                            {/* Key Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                                <div>
                                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Total Quantity</span>
                                    <span className="font-black text-slate-900 text-base">{post.target_quantity.toLocaleString()} {post.unit}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Target Rate</span>
                                    <span className="font-black text-emerald-600 text-base">
                                        {post.target_rate ? `${post.target_rate} ৳` : 'Negotiable'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Delivery Deadline</span>
                                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        {formatDeadline(post.deadline)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Factory Lines</span>
                                    <span className="font-bold text-slate-800 text-base">
                                        {post.factory?.total_lines ? `${post.factory.total_lines} Lines` : 'Open'}
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic Category Specifications */}
                            {post.specs && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-blue-600" />
                                        Manufacturing Specifications ({post.category.replace('_', ' ')})
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                                        {Object.entries(post.specs).map(([key, val]) => (
                                            <div key={key} className="flex justify-between py-1 border-b border-blue-100/60 last:border-none">
                                                <span className="font-medium text-slate-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                <span className="font-bold text-slate-900">{String(val)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Detailed Order Requirements
                                </h3>
                                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                    {post.description}
                                </p>
                            </div>

                            {/* GATED SECTION: Tech Pack & Direct Contacts */}
                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                    Garment Tech Pack & Direct Contacts
                                </h3>

                                {userCanViewFullDetails ? (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4">
                                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                                            <UserCheck className="w-4 h-4 text-emerald-600" />
                                            <span>Full Access Unlocked (Subscribed Member)</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-slate-500 block">Contact Person:</span>
                                                <strong className="text-slate-900 text-sm">{post.user.name}</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">Phone / WhatsApp:</span>
                                                <a href={`tel:${post.user.phone}`} className="text-emerald-700 font-bold text-sm hover:underline flex items-center gap-1">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {post.user.phone || '+880 1705 123456'}
                                                </a>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">Email Address:</span>
                                                <strong className="text-slate-800">{post.user.email}</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">Factory Address:</span>
                                                <strong className="text-slate-800">{post.address || post.district}</strong>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-base font-bold">Contact & Tech Pack are Protected</h4>
                                        <p className="text-xs text-slate-300 max-w-md mx-auto">
                                            Direct phone numbers, WhatsApp links, and garment measurement sheets are available to registered and subscribed members.
                                        </p>
                                        <button
                                            onClick={() => setAuthModalOpen(true)}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition"
                                        >
                                            {auth.user ? 'Upgrade Subscription (50 Tk/mo)' : 'Log In or Register to Unlock'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quotation Submission or Comparison */}
                    <div className="lg:col-span-4 space-y-6">
                        {isOwner ? (
                            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                    Received Quotations ({post.quotations?.length || 0})
                                </h3>
                                <p className="text-xs text-slate-500">
                                    You are the creator of this subcontract order. Compare offers submitted by factories.
                                </p>
                                <Link
                                    href={route('quotations.compare', post.id)}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
                                >
                                    Open Side-by-Side Comparison Matrix
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    Submit Quotation / Bid
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Offer your factory's unit rate and execution lead time for this order.
                                </p>

                                {userCanViewFullDetails ? (
                                    <form onSubmit={handleBidSubmit} className="space-y-3 text-xs">
                                        <div>
                                            <label className="block font-bold text-slate-600 mb-1">Offered Unit Rate (BDT / {post.unit})</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={data.offered_unit_price}
                                                onChange={(e) => setData('offered_unit_price', e.target.value)}
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-600 mb-1">Lead Time (Days to Complete)</label>
                                            <input
                                                type="number"
                                                value={data.offered_lead_days}
                                                onChange={(e) => setData('offered_lead_days', parseInt(e.target.value) || 1)}
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-600 mb-1">Remarks & Capacity Commitment</label>
                                            <textarea
                                                rows={2}
                                                value={data.note}
                                                onChange={(e) => setData('note', e.target.value)}
                                                placeholder="e.g. Can allocate 3 lines starting next Monday..."
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition disabled:opacity-50"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            {processing ? 'Submitting...' : 'Send Quotation to Factory'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2">
                                        <Lock className="w-5 h-5 text-slate-400 mx-auto" />
                                        <p className="text-xs text-slate-600">
                                            Only verified subscribers can bid directly on this order.
                                        </p>
                                        <button
                                            onClick={() => setAuthModalOpen(true)}
                                            className="text-xs text-blue-600 font-bold hover:underline"
                                        >
                                            Unlock Bidding Access
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AuthGateModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                postTitle={post.title}
                isLoggedIn={!!auth.user}
            />
        </ShilposetuLayout>
    );
}
