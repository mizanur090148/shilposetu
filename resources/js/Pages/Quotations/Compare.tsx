import React from 'react';
import { Head, Link } from '@inertiajs/react';
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
    FileText
} from 'lucide-react';

interface CompareProps {
    post: any;
    quotations: any[];
}

export default function CompareQuotations({ post, quotations }: CompareProps) {
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

                {/* Header (matching Page 1 Screen 6) */}
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
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {quotations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400">
                                            No quotations have been submitted for this order yet.
                                        </td>
                                    </tr>
                                ) : (
                                    quotations.map((q) => (
                                        <tr key={q.id} className="hover:bg-slate-50/80 transition">
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
                                            <td className="p-4 text-right">
                                                <div className="inline-flex gap-1.5">
                                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm">
                                                        Accept Bid
                                                    </button>
                                                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg text-xs transition">
                                                        Message
                                                    </button>
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
