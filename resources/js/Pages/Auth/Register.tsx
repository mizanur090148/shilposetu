import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { ArrowRight, Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { KnittingType } from '@/types';

interface RegisterProps {
    knittingTypes?: KnittingType[];
}

export default function Register({ knittingTypes = [] }: RegisterProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        phone: string;
        email: string;
        business_name: string;
        logo: File | null;
        knitting_types: number[];
        password: string;
        password_confirmation: string;
    }>({
        name: '',
        phone: '+880',
        email: '',
        business_name: '',
        logo: null,
        knitting_types: [],
        password: '',
        password_confirmation: '',
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setData('logo', null);
            setLogoPreview(null);
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
                        {/* Contact Person Name & Phone Number */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                    Contact person name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter contact person name"
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

                        {/* Factory Logo (Optional / Not Mandatory) */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block font-bold text-slate-600">
                                    Factory Logo <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                                </label>
                                {logoPreview && (
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                        Remove
                                    </button>
                                )}
                            </div>

                            {!logoPreview ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30 rounded-xl p-3 text-center cursor-pointer transition flex items-center justify-center gap-3 group"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                                        <Upload className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-600">
                                            Click to upload factory logo
                                        </p>
                                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP, SVG up to 4MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                                    <img
                                        src={logoPreview}
                                        alt="Factory logo preview"
                                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-white"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-800 truncate">
                                            {data.logo?.name || 'Uploaded Logo'}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {data.logo ? `${(data.logo.size / 1024).toFixed(1)} KB` : ''}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                            {errors.logo && <p className="text-rose-600 text-[10px] mt-1">{errors.logo}</p>}
                        </div>

                        {/* Manufacturing Sector: Knitting (Default) */}
                        <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                    <span className="font-bold text-slate-800 text-xs">Sector: Knitting (Default)</span>
                                </div>
                                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                    Pre-configured
                                </span>
                            </div>

                            {knittingTypes && knittingTypes.length > 0 && (
                                <div className="pt-1.5 border-t border-blue-100">
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                                        Specialized Knitting Types <span className="text-slate-400 font-normal">(Optional - Select what you produce)</span>
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {knittingTypes.map((kt) => {
                                            const isSelected = data.knitting_types.includes(kt.id);
                                            return (
                                                <button
                                                    key={kt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setData('knitting_types', data.knitting_types.filter(id => id !== kt.id));
                                                        } else {
                                                            setData('knitting_types', [...data.knitting_types, kt.id]);
                                                        }
                                                    }}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white shadow-xs'
                                                            : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                    <span>{kt.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer"
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
