import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { Factory, PageProps } from '@/types';
import { 
    Building2, 
    User, 
    ShieldCheck, 
    AlertCircle, 
    MapPin, 
    Cpu, 
    FileText, 
    Check, 
    Save, 
    ExternalLink, 
    Sparkles, 
    Layers, 
    Gauge, 
    Award
} from 'lucide-react';

const COMMON_CAPABILITIES = [
    'Circular Knitting',
    'Flatbed Knitting',
    'Fabric Dyeing',
    'Yarn Dyeing',
    'Sewing Production',
    'Garment Washing',
    'Enzyme / Stone Wash',
    'Screen Printing',
    'All-Over Printing (AOP)',
    'Computerized Embroidery',
    'Heat Transfer Printing',
    'Laser Cutting',
    'Finishing & Packing',
    'Needle Detection & QC Lab',
    'BSCI / Sedex Compliant',
    'OEKO-TEX Certified',
];

const DISTRICTS = [
    'Gazipur',
    'Ashulia',
    'Savar',
    'Tongi',
    'Narayanganj',
    'Dhaka',
    'Chittagong',
    'Tangail',
    'Mymensingh',
    'Cumilla',
    'Narsingdi',
    'Bhaluka',
    'Other',
];

const INDUSTRY_TYPES = [
    'Apparel & Garments',
    'Knitwear & Composite',
    'Woven Manufacturing',
    'Dyeing & Finishing Mill',
    'Denim & Washing Plant',
    'Yarn Spinning Mill',
    'Printing & Embroidery Unit',
    'Packaging & Accessories',
    'Textile Mill',
];

interface FactoryEditProps extends PageProps {
    factory: Factory;
    status?: string;
}

export default function FactoryEdit({ factory, status }: FactoryEditProps) {
    const initialCapabilities: string[] = Array.isArray(factory.capabilities) 
        ? factory.capabilities 
        : [];

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        business_name: factory.business_name || '',
        industry_type: factory.industry_type || 'Apparel & Garments',
        contact_person: factory.contact_person || '',
        phone: factory.phone || '',
        email: factory.email || '',
        district: factory.district || 'Gazipur',
        address: factory.address || '',
        total_lines: factory.total_lines ?? 0,
        total_machines: factory.total_machines ?? 0,
        daily_capacity: factory.daily_capacity || '',
        trade_license_no: factory.trade_license_no || '',
        tin_no: factory.tin_no || '',
        bin_no: factory.bin_no || '',
        capabilities: initialCapabilities,
    });

    const toggleCapability = (cap: string) => {
        const exists = data.capabilities.includes(cap);
        if (exists) {
            setData('capabilities', data.capabilities.filter((c) => c !== cap));
        } else {
            setData('capabilities', [...data.capabilities, cap]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('factory.update'));
    };

    return (
        <ShilposetuLayout>
            <Head title="Factory Profile & Information | Shilposetu" />

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white py-8 px-4 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-600/30 inline-flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    Factory Management
                                </span>
                                {factory.is_verified ? (
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/30 inline-flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" />
                                        Verified Unit
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-600/30 inline-flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Pending Verification
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Factory Profile & Capacity Details
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                                Add or edit your manufacturing capacity, production lines, machinery, and certifications visible to subcontract buyers.
                            </p>
                        </div>

                        {/* Navigation Tabs & Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/60 transition"
                                >
                                    <User className="w-3.5 h-3.5" />
                                    Personal Profile
                                </Link>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm">
                                    <Building2 className="w-3.5 h-3.5" />
                                    Factory Profile
                                </span>
                            </div>

                            {factory.id && (
                                <Link
                                    href={route('vendors.show', factory.id)}
                                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
                                    title="View how buyers see your factory"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Public Profile</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Feedback Messages */}
                    {status && (
                        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Section 1: Business Identity */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">General Factory Information</h2>
                                        <p className="text-[11px] text-slate-500">Legal business name, industrial classification, and key representatives.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Factory / Business Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.business_name}
                                        onChange={(e) => setData('business_name', e.target.value)}
                                        placeholder="e.g. Apex Textiles & Garments Ltd."
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                        required
                                    />
                                    {errors.business_name && <p className="text-rose-600 text-[10px] mt-1">{errors.business_name}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Industry Type / Sector <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.industry_type}
                                        onChange={(e) => setData('industry_type', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    >
                                        {INDUSTRY_TYPES.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.industry_type && <p className="text-rose-600 text-[10px] mt-1">{errors.industry_type}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Contact Person (Factory Representative)</label>
                                    <input
                                        type="text"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        placeholder="Name of Managing Director or Merchandiser"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    />
                                    {errors.contact_person && <p className="text-rose-600 text-[10px] mt-1">{errors.contact_person}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Official Phone / Hotline</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+8801700000000"
                                            className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-mono"
                                        />
                                        {errors.phone && <p className="text-rose-600 text-[10px] mt-1">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="info@factory.com"
                                            className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                        />
                                        {errors.email && <p className="text-rose-600 text-[10px] mt-1">{errors.email}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Location & Address */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">Plant Location & Address</h2>
                                        <p className="text-[11px] text-slate-500">Industrial cluster and exact physical address for logistics inspection.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Industrial District <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.district}
                                        onChange={(e) => setData('district', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    >
                                        {DISTRICTS.map((dist) => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                    {errors.district && <p className="text-rose-600 text-[10px] mt-1">{errors.district}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block font-bold text-slate-700 mb-1">Full Factory Physical Address</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Plot #, Road #, Industrial Zone, Area, Post Office"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    />
                                    {errors.address && <p className="text-rose-600 text-[10px] mt-1">{errors.address}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Production Capacity & Machinery */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Cpu className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">Production Capacity & Lines</h2>
                                        <p className="text-[11px] text-slate-500">Key manufacturing metrics used by buyers to evaluate order allocation.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Total Production Lines
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.total_lines}
                                            onChange={(e) => setData('total_lines', parseInt(e.target.value) || 0)}
                                            className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                        />
                                        <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-medium pointer-events-none">Lines</span>
                                    </div>
                                    {errors.total_lines && <p className="text-rose-600 text-[10px] mt-1">{errors.total_lines}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Total Machinery Units
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.total_machines}
                                            onChange={(e) => setData('total_machines', parseInt(e.target.value) || 0)}
                                            className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                        />
                                        <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-medium pointer-events-none">Machines</span>
                                    </div>
                                    {errors.total_machines && <p className="text-rose-600 text-[10px] mt-1">{errors.total_machines}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Daily Production Capacity
                                    </label>
                                    <input
                                        type="text"
                                        value={data.daily_capacity}
                                        onChange={(e) => setData('daily_capacity', e.target.value)}
                                        placeholder="e.g. 35,000 Pcs/Day or 12,000 Kg"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    />
                                    {errors.daily_capacity && <p className="text-rose-600 text-[10px] mt-1">{errors.daily_capacity}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Capabilities & Processes */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">Capabilities & Industrial Processes</h2>
                                        <p className="text-[11px] text-slate-500">Select all manufacturing capabilities and certifications that apply to your unit.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                    {COMMON_CAPABILITIES.map((cap) => {
                                        const selected = data.capabilities.includes(cap);
                                        return (
                                            <button
                                                key={cap}
                                                type="button"
                                                onClick={() => toggleCapability(cap)}
                                                className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition flex items-center justify-between gap-1.5 ${
                                                    selected 
                                                        ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-sm' 
                                                        : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/80'
                                                }`}
                                            >
                                                <span className="truncate">{cap}</span>
                                                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                                    selected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                                                }`}>
                                                    {selected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Legal & Tax Compliance */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">Legal, Tax & License Numbers</h2>
                                        <p className="text-[11px] text-slate-500">Used for verification of genuine manufacturing facilities.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Trade Licence No.</label>
                                    <input
                                        type="text"
                                        value={data.trade_license_no}
                                        onChange={(e) => setData('trade_license_no', e.target.value)}
                                        placeholder="TRAD/GAZ/2024/..."
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-mono"
                                    />
                                    {errors.trade_license_no && <p className="text-rose-600 text-[10px] mt-1">{errors.trade_license_no}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">TIN Certificate No.</label>
                                    <input
                                        type="text"
                                        value={data.tin_no}
                                        onChange={(e) => setData('tin_no', e.target.value)}
                                        placeholder="12-digit e-TIN"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-mono"
                                    />
                                    {errors.tin_no && <p className="text-rose-600 text-[10px] mt-1">{errors.tin_no}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">BIN / VAT Registration No.</label>
                                    <input
                                        type="text"
                                        value={data.bin_no}
                                        onChange={(e) => setData('bin_no', e.target.value)}
                                        placeholder="13-digit BIN"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-mono"
                                    />
                                    {errors.bin_no && <p className="text-rose-600 text-[10px] mt-1">{errors.bin_no}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions Bar */}
                        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-600" />
                                <span>Complete information increases buyer confidence and quotation awards.</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving Changes...' : 'Save Factory Information'}
                                </button>
                                {recentlySuccessful && (
                                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" />
                                        Saved!
                                    </span>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </ShilposetuLayout>
    );
}
