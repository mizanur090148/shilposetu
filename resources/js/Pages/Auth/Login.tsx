import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { LogIn, Lock } from 'lucide-react';

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

    return (
        <ShilposetuLayout>
            <Head title="Factory Login | Shilposetu" />

            {/* Top Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white py-8 px-4 border-b border-slate-800">
                <div className="max-w-md mx-auto text-center space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-600/30 inline-flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Industrial Portal Access
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Welcome To SHILPOSETU
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                        Access your factory orders, tech packs, and quotation matrix.
                    </p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
                <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10 space-y-5">
                    {status && (
                        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
                            {status}
                        </div>
                    )}

                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base font-bold text-slate-900">Sign in to your account</h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Enter your registered email and password to access your dashboard.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-600 mb-1">Email Address</label>
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
                                Register Factory Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </ShilposetuLayout>
    );
}
