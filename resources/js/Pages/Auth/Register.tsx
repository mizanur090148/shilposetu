import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '+880',
        email: '',
        business_name: '',
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
            <Head title="Factory Registration | Shilposetu" />

            {/* Top Industrial Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white py-8 px-4 border-b border-slate-800">
                <div className="max-w-4xl mx-auto text-center space-y-2">
                    {/* <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-600/30 inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Industrial Accounts
                    </span>  */}
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Industry Account Registration
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                        One unified account to both give subcontract orders and take subcontract capacity across Bangladesh.
                    </p>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
                <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10 space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base font-bold text-slate-900">Create your account</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Enter your information below to register your factory and access the platform.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4 text-xs">
                        {/* Full Name & Phone Number */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    required
                                />
                                {errors.name && <p className="text-rose-600 text-[10px] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                    Phone Number <span className="text-rose-500">*</span>
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

                        {/* Email Address */}
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

                        {/* Factory Name */}
                        <div>
                            <label className="block font-bold text-slate-600 mb-1">
                                Factory Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                                placeholder="Enter factory or business name"
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                required
                            />
                            {errors.business_name && <p className="text-rose-600 text-[10px] mt-1">{errors.business_name}</p>}
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
                            {processing ? 'Processing Registration...' : 'Register'}
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
