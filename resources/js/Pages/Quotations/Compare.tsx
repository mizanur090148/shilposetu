import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { 
    ArrowLeft, 
    CheckCircle2, 
    DollarSign, 
    Clock, 
    Star, 
    Building2, 
    ShieldCheck,
    Check,
    X,
    FileText,
    Phone,
    PhoneCall
} from 'lucide-react';

interface CompareProps {
    post: any;
    quotations: any[];
}

export default function CompareQuotations({ post, quotations }: CompareProps) {
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleUpdateStatus = (quotationId: number, status: 'accepted' | 'rejected' | 'pending') => {
        setProcessingId(quotationId);
        router.patch(
            route('quotations.status', quotationId),
            { status },
            {
                onFinish: () => setProcessingId(null),
                preserveScroll: true,
            }
        );
    };

    return (
        <ShilposetuLayout>
            <Head title={`Quotation Comparison - ${post.title} | Shilposetu`} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Link
                    href={route('feed.show', post.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Order Details
                </Link>

                {/* Header */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                                Side-by-Side Quotation Comparison
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                                {post.title}
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Order Quantity: <strong className="text-slate-800">{post.target_quantity.toLocaleString()} {post.unit}</strong> • Target Rate: <strong className="text-emerald-600">{post.target_rate ? `${post.target_rate} ৳` : 'Open'}</strong>
                            </p>
                        </div>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                            {quotations.length} Quotations Received
                        </span>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="p-4">Bidding Factory</th>
                                    <th className="p-4">Offered Unit Rate</th>
                                    <th className="p-4">Total Estimated Cost</th>
                                    <th className="p-4">Lead Time</th>
                                    <th className="p-4">Rating & Lines</th>
                                    <th className="p-4">Remarks</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {quotations.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-400">
                                            No quotations have been submitted for this order yet.
                                        </td>
                                    </tr>
                                ) : (
                                    quotations.map((q) => (
                                        <tr key={q.id} className={`transition ${q.status === 'accepted' ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50/80'}`}>
                                            <td className="p-4">
                                                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                                    {q.bidder_factory?.business_name || q.bidder_user?.name}
                                                    {q.bidder_factory?.is_verified && (
                                                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-slate-500">
                                                    ID: {q.bidder_user?.customer_id} • {q.bidder_factory?.district || 'Gazipur'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-extrabold text-sm text-emerald-600">
                                                    {q.offered_unit_price} ৳
                                                </span>
                                                <span className="text-[10px] text-slate-400 block">per {post.unit}</span>
                                            </td>
                                            <td className="p-4 font-bold text-slate-800">
                                                {q.offered_total_cost ? `${Number(q.offered_total_cost).toLocaleString()} ৳` : 'Calculated'}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {q.offered_lead_days} Days
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1 font-bold text-amber-600">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    {q.bidder_factory?.rating || '4.80'}
                                                </div>
                                                <span className="text-[10px] text-slate-500">
                                                    {q.bidder_factory?.total_lines || 10} Lines
                                                </span>
                                            </td>
                                            <td className="p-4 max-w-xs text-slate-600 truncate" title={q.note}>
                                                {q.note || 'Ready to produce immediately'}
                                            </td>
                                            <td className="p-4">
                                                {q.status === 'accepted' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        <Check className="w-3 h-3" />
                                                        Accepted
                                                    </span>
                                                ) : q.status === 'rejected' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <X className="w-3 h-3" />
                                                        Declined
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="inline-flex items-center justify-end gap-1.5">
                                                    {q.status === 'accepted' ? (
                                                        <>
                                                            {q.bidder_user?.phone && (
                                                                <a
                                                                    href={`tel:${q.bidder_user.phone}`}
                                                                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-xs"
                                                                >
                                                                    <PhoneCall className="w-3 h-3" />
                                                                    Call Factory
                                                                </a>
                                                            )}
                                                            <button
                                                                onClick={() => handleUpdateStatus(q.id, 'pending')}
                                                                disabled={processingId === q.id}
                                                                className="text-slate-400 hover:text-slate-600 text-[11px] font-medium px-2 py-1 transition disabled:opacity-50"
                                                            >
                                                                Revert
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(q.id, 'accepted')}
                                                                disabled={processingId === q.id}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm disabled:opacity-50 inline-flex items-center gap-1"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                                Accept Bid
                                                            </button>
                                                            {q.status !== 'rejected' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(q.id, 'rejected')}
                                                                    disabled={processingId === q.id}
                                                                    className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-medium px-2.5 py-1.5 rounded-lg text-xs transition disabled:opacity-50"
                                                                >
                                                                    Decline
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ShilposetuLayout>
    );
}
