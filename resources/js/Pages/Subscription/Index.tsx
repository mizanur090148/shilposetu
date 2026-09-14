import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { 
    CheckCircle2, 
    CreditCard, 
    ShieldCheck, 
    ArrowRight, 
    Sparkles, 
    Lock, 
    AlertCircle, 
    Calendar,
    PhoneCall,
    FileCheck2
} from 'lucide-react';

interface SubscriptionIndexProps {
    subscription: any;
    plans: any[];
}

export default function SubscriptionIndex({ subscription, plans }: SubscriptionIndexProps) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'sslcommerz'>('bkash');
    const [showPaymentBox, setShowPaymentBox] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        billing_cycle: 'monthly',
        payment_method: 'bkash',
        transaction_id: '',
    });

    const handleSubscribeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('subscription.subscribe'), {
            onSuccess: () => setShowPaymentBox(false),
        });
    };

    const isSubscribed = Boolean(user && user.is_subscribed);

    return (
        <ShilposetuLayout>
            <Head title="SaaS Membership & Fee Structure | Shilposetu" />

            <div className="bg-slate-900 text-white py-12 px-4 border-b border-slate-800">
                <div className="max-w-4xl mx-auto text-center space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-600/30">
                        Shilposetu SaaS Monetization Model (Page 7 Specs)
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                        Transparent Factory & Buyer Subscription
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                        Low-friction membership designed for Bangladesh's RMG manufacturing sector. Connect demand with idle factory capacity without high broker commissions.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Active Membership Status Alert (if subscribed) */}
                {isSubscribed && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-emerald-900">Your Subscription is Active</h3>
                                <p className="text-xs text-emerald-700">
                                    Customer ID: <strong>{user?.customer_id}</strong> • Expires: {user?.subscription_expires_at ? new Date(user.subscription_expires_at).toLocaleDateString() : 'Active Member'}
                                </p>
                            </div>
                        </div>
                        <span className="bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1 rounded-lg">
                            Active (Page 7)
                        </span>
                    </div>
                )}

                {/* The Page 7 Fee Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-800">
                            Membership Schedule (Page 7 Reference)
                        </h3>
                        <span className="text-xs text-slate-500">Official Rate Card</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold text-[10px]">
                                <tr>
                                    <th className="p-4">Customer Status</th>
                                    <th className="p-4">One-Time Registration Fee</th>
                                    <th className="p-4">Recurring Monthly Fee</th>
                                    <th className="p-4">Included Access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="p-4 font-bold text-emerald-600">Active Member</td>
                                    <td className="p-4 font-black text-sm text-slate-900">100 BDT (Tk)</td>
                                    <td className="p-4 font-black text-sm text-blue-600">50 BDT / Month</td>
                                    <td className="p-4 text-slate-600">
                                        Unlimited Subcontract Posts, Direct Phone Numbers, Full Tech Packs, Direct Bidding
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Plan Card & Payment Checkout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left: What's Included */}
                    <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                    Factory Standard
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 mt-1">Full Factory Access</h3>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-slate-900">50 ৳</span>
                                <span className="text-xs text-slate-500"> / Month</span>
                                <p className="text-[10px] text-slate-400">+ 100 ৳ Registration</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            {plans[0].features.map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        {!isSubscribed && (
                            <button
                                onClick={() => setShowPaymentBox(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition"
                            >
                                Proceed to Activation via bKash / Nagad
                            </button>
                        )}
                    </div>

                    {/* Right: Payment Box / Gateway */}
                    <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-amber-400" />
                                <h3 className="font-bold text-base">Instant Mobile Payment</h3>
                            </div>

                            <p className="text-xs text-slate-300">
                                Pay using your personal or merchant bKash or Nagad wallet.
                            </p>

                            <div className="bg-white/10 rounded-xl p-3 text-xs space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-300">bKash Merchant:</span>
                                    <strong className="text-amber-300">01551 200 200</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-300">Reference:</span>
                                    <strong className="text-emerald-300">{user?.customer_id || 'SHILPOSETU'}</strong>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-1">
                                    <span className="text-slate-300">Total Payable:</span>
                                    <strong className="text-white font-bold">150 BDT (100 Reg + 50 Mo)</strong>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <form onSubmit={handleSubscribeSubmit} className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-slate-300 font-medium mb-1">Select Payment Gateway</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('payment_method', 'bkash')}
                                            className={`py-2 rounded-lg font-bold transition ${
                                                data.payment_method === 'bkash' ? 'bg-pink-600 text-white' : 'bg-white/10 text-slate-300'
                                            }`}
                                        >
                                            bKash
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('payment_method', 'nagad')}
                                            className={`py-2 rounded-lg font-bold transition ${
                                                data.payment_method === 'nagad' ? 'bg-amber-600 text-white' : 'bg-white/10 text-slate-300'
                                            }`}
                                        >
                                            Nagad
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-300 font-medium mb-1">Enter TrxID (ট্রানজেকশন আইডি)</label>
                                    <input
                                        type="text"
                                        value={data.transaction_id}
                                        onChange={(e) => setData('transaction_id', e.target.value)}
                                        placeholder="e.g. BKH98129038"
                                        className="w-full bg-white/10 border-white/20 text-white text-xs rounded-xl focus:ring-emerald-400"
                                        required
                                    />
                                    {errors.transaction_id && <p className="text-rose-400 text-[10px] mt-1">{errors.transaction_id}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
                                >
                                    {processing ? 'Verifying TrxID...' : 'Confirm Payment & Activate'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </ShilposetuLayout>
    );
}
