import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { Factory, User, ShieldCheck, CheckCircle2, Phone, Mail, Lock, FileText, ArrowRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        account_type: 'factory', // factory vs buyer (Page 3)
        name: '',
        phone: '+880',
        email: '',
        business_name: '',
        district: 'Gazipur',
        nid_number: '',
        trade_license_no: '',
        tin_no: '',
        bin_no: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <ShilposetuLayout>
            <Head title="Factory & Buyer Registration | Shilposetu" />

            {/* Top Industrial Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white py-8 px-4 border-b border-slate-800">
                <div className="max-w-4xl mx-auto text-center space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-600/30 inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Industrial Accounts
                    </span> 
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Industry Account Registration
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                        Connect demand with factory capacity across Bangladesh. Choose factory or buyer profile to get started.
                    </p>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
                <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10">
                    {/* Account Type Selector (matching Page 3: Account Type Dropdown/Buttons) */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            Select Account Type (অ্যাকাউন্ট টাইপ নির্বাচন করুন)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setData('account_type', 'factory')}
                                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                                    data.account_type === 'factory'
                                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <Factory className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold">Vendor / Industry</p>
                                    <p className="text-[10px] text-slate-500">Garment, Knitting, Washing Mill</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setData('account_type', 'buyer')}
                                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                                    data.account_type === 'buyer'
                                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <User className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold">Buyer / Merchandiser</p>
                                    <p className="text-[10px] text-slate-500">Subcontract Contractor</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4 text-xs">
                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Rahim Uddin"
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    required
                                />
                                {errors.name && <p className="text-rose-600 text-[10px] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                    Phone Number (মোবাইল নম্বর) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+8801705123456"
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-mono"
                                    required
                                />
                                {errors.phone && <p className="text-rose-600 text-[10px] mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block font-bold text-slate-600 mb-1">
                                Email Address <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="name@factory.com"
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                required
                            />
                            {errors.email && <p className="text-rose-600 text-[10px] mt-1">{errors.email}</p>}
                        </div>

                        {/* FACTORY SPECIFIC KYC FIELDS (Page 3) */}
                        {data.account_type === 'factory' && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                                    Factory & KYC Legal Details (Page 3)
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-medium text-slate-600 mb-1">
                                            Business / Factory Name <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.business_name}
                                            onChange={(e) => setData('business_name', e.target.value)}
                                            placeholder="e.g. Dhaka Knitwear Ltd."
                                            className="w-full text-xs rounded-lg border-slate-300"
                                            required={data.account_type === 'factory'}
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-medium text-slate-600 mb-1">District (এলাকা)</label>
                                        <select
                                            value={data.district}
                                            onChange={(e) => setData('district', e.target.value)}
                                            className="w-full text-xs rounded-lg border-slate-300"
                                        >
                                            <option value="Gazipur">Gazipur (গাজীপুর)</option>
                                            <option value="Ashulia">Ashulia / Savar (আশুলিয়া)</option>
                                            <option value="Tongi">Tongi (টঙ্গী)</option>
                                            <option value="Narayanganj">Narayanganj (নারায়ণগঞ্জ)</option>
                                            <option value="Dhaka">Dhaka (ঢাকা)</option>
                                            <option value="Tangail">Tangail (টাঙ্গাইল)</option>
                                            <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-medium text-slate-600 mb-1">Trade Licence No.</label>
                                        <input
                                            type="text"
                                            value={data.trade_license_no}
                                            onChange={(e) => setData('trade_license_no', e.target.value)}
                                            placeholder="TRAD/2024/xxx"
                                            className="w-full text-xs rounded-lg border-slate-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-slate-600 mb-1">TIN Certificate</label>
                                        <input
                                            type="text"
                                            value={data.tin_no}
                                            onChange={(e) => setData('tin_no', e.target.value)}
                                            placeholder="12-digit TIN"
                                            className="w-full text-xs rounded-lg border-slate-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-slate-600 mb-1">BIN / VAT No.</label>
                                        <input
                                            type="text"
                                            value={data.bin_no}
                                            onChange={(e) => setData('bin_no', e.target.value)}
                                            placeholder="BIN/VAT Number"
                                            className="w-full text-xs rounded-lg border-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NID Number */}
                        <div>
                            <label className="block font-bold text-slate-600 mb-1">
                                National ID (NID Number)
                            </label>
                            <input
                                type="text"
                                value={data.nid_number}
                                onChange={(e) => setData('nid_number', e.target.value)}
                                placeholder="Smart NID or 10/17-digit number"
                                className="w-full text-xs rounded-xl border-slate-300"
                            />
                        </div>

                        {/* Password & Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                    Password <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    required
                                />
                                {errors.password && <p className="text-rose-600 text-[10px] mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                    Confirm Password <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                        >
                            {processing ? 'Processing Registration...' : 'Complete Registration & Get Customer ID'}
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-xs text-slate-500">
                                Already have an account?{' '}
                                <Link href={route('login')} className="text-blue-600 font-bold hover:underline">
                                    Log In here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </ShilposetuLayout>
    );
}
