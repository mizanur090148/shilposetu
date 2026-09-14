import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import {
    Factory,
    MapPin,
    CheckCircle2,
    Star,
    Phone,
    Mail,
    ArrowLeft,
    ShieldCheck,
    Layers,
    Building2,
    Calendar,
    ArrowUpRight
} from 'lucide-react';

interface VendorShowProps {
    factory: any;
}

export default function VendorShow({ factory }: VendorShowProps) {
    return (
        <ShilposetuLayout>
            <Head title={`${factory.business_name} - Factory Profile | Shilposetu`} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Link
                    href={route('vendors.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Factory Directory
                </Link>

                {/* Hero Header Card (matching Page 1 Screen 5) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                                {factory.business_name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                                        {factory.business_name}
                                    </h1>
                                    {factory.is_verified && (
                                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                    <span>ID: <strong className="text-slate-700">{factory.user?.customer_id}</strong></span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {factory.district}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                {factory.rating} Rating
                            </span>
                        </div>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                        <div>
                            <span className="text-slate-400 uppercase font-bold text-[10px] block">Total Production Lines</span>
                            <strong className="text-slate-900 text-base">{factory.total_lines} Lines</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase font-bold text-[10px] block">Sewing & Knitting Machines</span>
                            <strong className="text-slate-900 text-base">{factory.total_machines || 200}+ Sets</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase font-bold text-[10px] block">Daily Production Output</span>
                            <strong className="text-emerald-600 text-base">{factory.daily_capacity || '30,000 Pcs/Day'}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase font-bold text-[10px] block">Trade License</span>
                            <strong className="text-slate-700 text-sm">{factory.trade_license_no || 'Verified'}</strong>
                        </div>
                    </div>

                    {/* About & Address */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Factory Address & Facility Overview
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            {factory.address}
                        </p>
                    </div>

                    {/* Capabilities & Machinery */}
                    {factory.capabilities && factory.capabilities.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Industrial Capabilities & Processes
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {factory.capabilities.map((cap: string, i: number) => (
                                    <span key={i} className="text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100 px-3 py-1 rounded-lg">
                                        {cap}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact details */}
                    <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="text-xs text-slate-400">Direct Factory Contact</p>
                            <p className="text-base font-bold text-white">{factory.contact_person || factory.user?.name}</p>
                            <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                {factory.phone || factory.user?.phone || '+880 1733 714 009'}
                            </p>
                        </div>
                        <a
                            href={`tel:${factory.phone || factory.user?.phone}`}
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                        >
                            <Phone className="w-4 h-4" />
                            Call Factory Representative
                        </a>
                    </div>
                </div>

                {/* Subcontract Posts by this Factory */}
                {factory.subcontract_posts && factory.subcontract_posts.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-base font-bold text-slate-900">
                            Active Orders & Capacity Posts from {factory.business_name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {factory.subcontract_posts.map((p: any) => (
                                <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                            {p.category.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">
                                            {p.target_quantity.toLocaleString()} {p.unit}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2">{p.title}</h4>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                                        <span className="text-slate-500">{p.district}</span>
                                        <Link href={route('feed.show', p.id)} className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                                            View Order <ArrowUpRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ShilposetuLayout>
    );
}
