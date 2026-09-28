import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { 
    Factory, 
    MachineType, 
    KnittingType,
    NonSewingMachineRow, 
    PageProps 
} from '@/types';
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
    Award,
    Plus,
    Trash2,
    CheckCircle2,
    Info,
    ChevronRight,
    HelpCircle
} from 'lucide-react';

const COMMON_CAPABILITIES = [
    'Circular Knitting',
    'Flatbed Knitting',
    'Single Jersey Fabrics',
    'Rib & Interlock Production',
    'Fleece & Terry Fabrics',
    'Auto Stripe & Jacquard',
    'Yarn Sourcing & Testing',
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

interface EditProps extends PageProps {
    factory: Factory;
    knittingTypes?: KnittingType[];
    machineTypes?: MachineType[];
    status?: string;
}

export default function Edit({ 
    auth, 
    factory, 
    knittingTypes = [], 
    machineTypes = [], 
    status 
}: EditProps) {
    const initialCapabilities: string[] = Array.isArray(factory.capabilities) 
        ? factory.capabilities 
        : [];

    const initialKnittingMachines: NonSewingMachineRow[] = factory.production_capacities?.knitting || [];

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        business_name: factory.business_name || '',
        industry_type: 'Knitting',
        contact_person: factory.contact_person || '',
        phone: factory.phone || '',
        email: factory.email || '',
        district: factory.district || 'Gazipur',
        address: factory.address || '',
        total_machines: factory.total_machines ?? initialKnittingMachines.reduce((a, b) => a + (Number(b.no_of_machine) || 0), 0),
        daily_capacity: factory.daily_capacity || '',
        production_capacities: {
            knitting: initialKnittingMachines,
        },
        trade_license_no: factory.trade_license_no || '',
        tin_no: factory.tin_no || '',
        bin_no: factory.bin_no || '',
        capabilities: initialCapabilities,
        knitting_types: (factory as any)?.knitting_types 
            ? (factory as any).knitting_types.map((k: any) => typeof k === 'object' ? k.id : k) 
            : [],
    });

    const toggleKnittingType = (id: number) => {
        const current = data.knitting_types || [];
        if (current.includes(id)) {
            setData('knitting_types', current.filter((item: number) => item !== id));
        } else {
            setData('knitting_types', [...current, id]);
        }
    };

    const addMachineRow = () => {
        const defaultType = machineTypes && machineTypes.length > 0 ? machineTypes[0] : null;
        const newRow: NonSewingMachineRow = {
            id: 'mach_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            machine_type: defaultType ? defaultType.name : 'Circular Single Jersey Knitting Machine',
            machine_type_id: defaultType ? defaultType.id : null,
            no_of_machine: 1,
            capacity_per_machine: 500,
            total_capacity_per_day: 500,
            unit_type: defaultType?.default_unit || 'Kg',
        };

        const nextList = [...(data.production_capacities?.knitting || []), newRow];
        const totalMach = nextList.reduce((acc, r) => acc + (Number(r.no_of_machine) || 0), 0);
        const totalCap = nextList.reduce((acc, r) => acc + (Number(r.total_capacity_per_day) || 0), 0);

        setData((prev) => ({
            ...prev,
            total_machines: totalMach,
            daily_capacity: totalCap > 0 ? `${totalCap.toLocaleString()} Kg/Day` : prev.daily_capacity,
            production_capacities: {
                ...prev.production_capacities,
                knitting: nextList,
            },
        }));
    };

    const updateMachineRow = (index: number, field: keyof NonSewingMachineRow, val: any) => {
        const existingList = [...(data.production_capacities?.knitting || [])];
        if (!existingList[index]) return;

        const row = { ...existingList[index], [field]: val };

        if (field === 'machine_type') {
            const matched = machineTypes?.find((m) => m.name === val);
            if (matched) {
                row.machine_type_id = matched.id;
                row.unit_type = matched.default_unit || 'Kg';
            }
        }

        if (field === 'no_of_machine' || field === 'capacity_per_machine') {
            const count = field === 'no_of_machine' ? (Number(val) || 0) : (Number(row.no_of_machine) || 0);
            const cap = field === 'capacity_per_machine' ? (Number(val) || 0) : (Number(row.capacity_per_machine) || 0);
            row.total_capacity_per_day = count * cap;
        }

        existingList[index] = row;
        const totalMach = existingList.reduce((acc, r) => acc + (Number(r.no_of_machine) || 0), 0);
        const totalCap = existingList.reduce((acc, r) => acc + (Number(r.total_capacity_per_day) || 0), 0);

        setData((prev) => ({
            ...prev,
            total_machines: totalMach,
            daily_capacity: totalCap > 0 ? `${totalCap.toLocaleString()} Kg/Day` : prev.daily_capacity,
            production_capacities: {
                ...prev.production_capacities,
                knitting: existingList,
            },
        }));
    };

    const removeMachineRow = (index: number) => {
        const existingList = [...(data.production_capacities?.knitting || [])];
        existingList.splice(index, 1);
        const totalMach = existingList.reduce((acc, r) => acc + (Number(r.no_of_machine) || 0), 0);
        const totalCap = existingList.reduce((acc, r) => acc + (Number(r.total_capacity_per_day) || 0), 0);

        setData((prev) => ({
            ...prev,
            total_machines: totalMach,
            daily_capacity: totalCap > 0 ? `${totalCap.toLocaleString()} Kg/Day` : prev.daily_capacity,
            production_capacities: {
                ...prev.production_capacities,
                knitting: existingList,
            },
        }));
    };

    const toggleCapability = (cap: string) => {
        const exists = data.capabilities.includes(cap);
        if (exists) {
            setData('capabilities', data.capabilities.filter((c) => c !== cap));
        } else {
            setData('capabilities', [...data.capabilities, cap]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('factory.update'));
    };

    const knittingRows = data.production_capacities?.knitting || [];
    const totalDailyCapacity = knittingRows.reduce((acc, r) => acc + (Number(r.total_capacity_per_day) || 0), 0);

    return (
        <ShilposetuLayout>
            <Head title="Factory Profile & Capacity Management - Shilposetu" />

            {/* Sky Blue Hero Banner */}
            <div className="relative bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white py-8 border-b border-sky-400/30 overflow-hidden shadow-xs">
                {/* Subtle Luminous Grid Background Accent */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                    <Building2 className="w-3 h-3 text-sky-100" />
                                    <span>Industrial Unit Profile</span>
                                </span>
                                {factory.is_verified ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500/25 text-emerald-100 border border-emerald-300/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                                        Verified Unit
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 bg-amber-500/25 text-amber-100 border border-amber-300/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                                        <ShieldCheck className="w-3 h-3 text-amber-300" />
                                        Verification Pending
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                                Factory Capacity & Profile Management
                            </h1>
                            <p className="text-xs sm:text-sm text-sky-50 mt-1 max-w-2xl font-medium">
                                Configure production machinery, daily capacity, legal licenses, and specialized knitting capabilities.
                            </p>
                        </div>

                        {/* Navigation Tabs Bar */}
                        <div className="flex items-center bg-white/15 backdrop-blur-md p-1.5 rounded-2xl border border-white/25 shadow-xs self-start sm:self-auto gap-1">
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white hover:bg-white/15 transition group"
                            >
                                <User className="w-3.5 h-3.5 text-sky-200 group-hover:scale-110 transition-transform" />
                                <span>Personal Profile</span>
                            </Link>
                            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-blue-700 shadow-xs">
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Factory Profile</span>
                            </span>
                            {factory.id && (
                                <Link
                                    href={route('factories.show', factory.id)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white hover:bg-white/15 transition"
                                    title="View how buyers see your factory"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-sky-200" />
                                    <span>Public View</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {status && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Section 1: Business Identity & Overview */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">1. Factory Identity & Industry</h2>
                                        <p className="text-[11px] text-slate-500">Official registered industrial unit title and operating sector.</p>
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
                                        required
                                        value={data.business_name}
                                        onChange={(e) => setData('business_name', e.target.value)}
                                        placeholder="e.g. Apex Knitting & Composite Ltd"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-semibold"
                                    />
                                    {errors.business_name && <p className="text-rose-600 text-[10px] mt-1">{errors.business_name}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Operating Industry</label>
                                    <input
                                        type="text"
                                        disabled
                                        value="Knitting (Specialized Fabric & Machinery Unit)"
                                        className="w-full text-xs rounded-xl border-slate-200 bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Platform focused on specialized knitting industrial units</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact Person & Location */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">2. Plant Location & Communications</h2>
                                        <p className="text-[11px] text-slate-500">Contact manager and physical factory address for order inspections.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Factory Manager / Contact Person</label>
                                    <input
                                        type="text"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        placeholder="Full name of factory in-charge"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    />
                                    {errors.contact_person && <p className="text-rose-600 text-[10px] mt-1">{errors.contact_person}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Factory Direct Phone</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+880 1700 000 000"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    />
                                    {errors.phone && <p className="text-rose-600 text-[10px] mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Factory Official Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="factory@company.com"
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                    />
                                    {errors.email && <p className="text-rose-600 text-[10px] mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Industrial District</label>
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

                        {/* Section 3: Knitting Types & Machines (Matching Admin Panel) */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                            {/* Section Header */}
                            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                        <Cpu className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                                            3. Knitting Types & Machines
                                        </h2>
                                        <p className="text-[11px] text-slate-500">
                                            Configure specialized knitting types and machinery records.
                                        </p>
                                    </div>
                                </div>

                                {/* Live Factory Summary Badges */}
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-600 self-start sm:self-auto">
                                    <span className="flex items-center gap-1.5 font-bold text-slate-800">
                                        <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                                        {data.total_machines || 0} Machines
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="flex items-center gap-1.5 font-bold text-blue-700">
                                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                                        {(data.knitting_types || []).length} Types Selected
                                    </span>
                                </div>
                            </div>

                            {/* Specialized Knitting Types Selection */}
                            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                                            Specialized Knitting Types
                                        </span>
                                        <p className="text-[11px] text-slate-500">
                                            Select the knitting fabric types and capabilities your factory produces.
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                        {(data.knitting_types || []).length} Selected
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                                    {(knittingTypes || []).map((kt) => {
                                        const isSelected = (data.knitting_types || []).includes(kt.id);
                                        return (
                                            <button
                                                type="button"
                                                key={kt.id}
                                                onClick={() => toggleKnittingType(kt.id)}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-xs'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition ${
                                                    isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : 'border-slate-300 bg-slate-50'
                                                }`}>
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="truncate block text-xs">{kt.name}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Knitting Machinery Content Area */}
                            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-slate-900">
                                            Knitting Machines
                                        </span>
                                        <p className="text-[11px] text-slate-500">
                                            {knittingRows.length} machinery records registered
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addMachineRow}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Machine Row</span>
                                    </button>
                                </div>

                                {knittingRows.length === 0 ? (
                                    <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                                        No machines registered under knitting yet. Click "Add Machine Row" to register machine units.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {knittingRows.map((row, idx) => (
                                            <div key={row.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-xs">
                                                <div className="sm:col-span-2">
                                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Machine Type</label>
                                                    <select
                                                        value={row.machine_type}
                                                        onChange={(e) => updateMachineRow(idx, 'machine_type', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                                                    >
                                                        {machineTypes.map((m) => (
                                                            <option key={m.id} value={m.name}>{m.name}</option>
                                                        ))}
                                                        <option value="Circular Single Jersey Knitting Machine">Circular Single Jersey Knitting Machine</option>
                                                        <option value="Circular Rib Knitting Machine">Circular Rib Knitting Machine</option>
                                                        <option value="Circular Interlock Knitting Machine">Circular Interlock Knitting Machine</option>
                                                        <option value="Circular Fleece Knitting Machine">Circular Fleece Knitting Machine</option>
                                                        <option value="Computerized Flat Knitting Machine">Computerized Flat Knitting Machine</option>
                                                        <option value="Jacquard Circular Knitting Machine">Jacquard Circular Knitting Machine</option>
                                                        <option value="Other">Other / Custom Machinery</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">No. of Machines</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={row.no_of_machine || ''}
                                                        onChange={(e) => updateMachineRow(idx, 'no_of_machine', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Daily Cap. / Machine</label>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={row.capacity_per_machine || ''}
                                                            onChange={(e) => updateMachineRow(idx, 'capacity_per_machine', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                                                        />
                                                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{row.unit_type || 'Kg'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0">
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-slate-400 block">Total Capacity</span>
                                                        <span className="font-bold text-blue-600 text-xs">
                                                            {row.total_capacity_per_day} {row.unit_type || 'Kg'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMachineRow(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                        title="Delete row"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Additional High-Level Metric Fields */}
                            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span>
                                        Total machinery ({data.total_machines || 0}) is automatically synchronized with your knitting entries.
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <label className="font-semibold text-slate-700 whitespace-nowrap">
                                        Custom Daily Capacity Label:
                                    </label>
                                    <input
                                        type="text"
                                        value={data.daily_capacity}
                                        onChange={(e) => setData('daily_capacity', e.target.value)}
                                        placeholder="e.g. 15,000 Kg/Day"
                                        className="text-xs rounded-xl border-slate-300 focus:border-blue-500 py-1.5 w-full sm:w-60"
                                    />
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
                                        <h2 className="text-sm font-bold text-slate-900">4. Capabilities & Industrial Processes</h2>
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
                                        <h2 className="text-sm font-bold text-slate-900">5. Legal, Tax & License Numbers</h2>
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
                                <Award className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>Complete manufacturing and machinery capacity details increase subcontract matching and quotation awards.</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
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
