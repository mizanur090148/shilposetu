import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, LogIn, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fillDemoUser = () => {
        setData({
            email: 'rahim@shilposetu.com',
            password: 'password',
            remember: true,
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Factory & Buyer Login | Shilposetu" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
                <Link href={route('feed.index')} className="inline-flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                        SHILPO<span className="text-blue-600">SETU</span>
                    </span>
                </Link>
                <h2 className="text-xl font-bold text-slate-900">
                    Welcome Back (লগইন)
                </h2>
                <p className="text-xs text-slate-500">
                    Access your factory orders, tech packs, and quotation matrix.
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10 space-y-5">
                    {status && (
                        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
                            {status}
                        </div>
                    )}

                    {/* Quick Demo Login Preset Button */}
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-blue-950 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                Demo Factory Account
                            </p>
                            <p className="text-[10px] text-blue-700">Rahim Uddin (Dhaka Knitwear)</p>
                        </div>
                        <button
                            type="button"
                            onClick={fillDemoUser}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg transition"
                        >
                            Fill Details
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-600 mb-1">Email / Phone</label>
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

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block font-bold text-slate-600">Password</label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-slate-400 hover:text-blue-600">
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                required
                            />
                            {errors.password && <p className="text-rose-600 text-[10px] mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="remember" className="ml-2 text-slate-600">
                                Remember this device
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            {processing ? 'Logging In...' : 'Log In to Account'}
                        </button>
                    </form>

                    <div className="pt-3 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500">
                            Don't have an account yet?{' '}
                            <Link href={route('register')} className="text-blue-600 font-bold hover:underline">
                                Register as Factory or Buyer
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
