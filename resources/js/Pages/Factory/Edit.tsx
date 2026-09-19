import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { 
    Factory, 
    MachineType, 
    NonSewingMachineRow, 
    PageProps, 
    ProductionCapacities, 
    SewingCapacity 
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
    Gauge, 
    Award,
    Scissors,
    Plus,
    Trash2,
    Calculator,
    CheckCircle2,
    Info,
    ChevronRight,
    HelpCircle
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

type DepartmentKey = 'sewing' | 'knitting' | 'yarn_dyeing' | 'fabric_dyeing' | 'print' | 'embroidery';
type NonSewingCategory = 'knitting' | 'yarn_dyeing' | 'fabric_dyeing' | 'print' | 'embroidery';

interface DepartmentMeta {
    key: DepartmentKey;
    label: string;
    sublabel: string;
    isSewing: boolean;
    icon: React.ElementType;
    color: string;
    activeBorder: string;
    activeBg: string;
    defaultUnit: string;
}

const DEPARTMENTS: DepartmentMeta[] = [
    {
        key: 'sewing',
        label: 'Sewing',
        sublabel: 'Assembly lines & capacity',
        isSewing: true,
        icon: Scissors,
        color: 'text-blue-600',
        activeBorder: 'border-blue-500',
        activeBg: 'bg-blue-50',
        defaultUnit: 'Pcs',
    },
    {
        key: 'knitting',
        label: 'Knitting',
        sublabel: 'Circular & flatbed knitting machinery',
        isSewing: false,
        icon: Cpu,
        color: 'text-purple-600',
        activeBorder: 'border-purple-500',
        activeBg: 'bg-purple-50/80',
        defaultUnit: 'Kg',
    },
    {
        key: 'yarn_dyeing',
        label: 'Yarn Dyeing',
        sublabel: 'Cone, package, hank & space dyeing',
        isSewing: false,
        icon: Sparkles,
        color: 'text-amber-600',
        activeBorder: 'border-amber-500',
        activeBg: 'bg-amber-50/80',
        defaultUnit: 'Kg',
    },
    {
        key: 'fabric_dyeing',
        label: 'Fabric Dyeing',
        sublabel: 'Soft flow, jet dyeing & finishing',
        isSewing: false,
        icon: Layers,
        color: 'text-emerald-600',
        activeBorder: 'border-emerald-500',
        activeBg: 'bg-emerald-50/80',
        defaultUnit: 'Kg',
    },
    {
        key: 'print',
        label: 'Print',
        sublabel: 'Oval, rotary, DTG & sublimation',
        isSewing: false,
        icon: FileText,
        color: 'text-rose-600',
        activeBorder: 'border-rose-500',
        activeBg: 'bg-rose-50/80',
        defaultUnit: 'Pcs',
    },
    {
        key: 'embroidery',
        label: 'Embroidery',
        sublabel: 'Multi-head, sequin & cording units',
        isSewing: false,
        icon: Award,
        color: 'text-indigo-600',
        activeBorder: 'border-indigo-500',
        activeBg: 'bg-indigo-50/80',
        defaultUnit: 'Pcs',
    },
];

const STANDARD_UNITS = [
    'Kg',
    'Pcs',
    'Yards',
    'Meter',
    'Lbs',
    'Dozen',
    'Set',
    'Rolls',
    'Cones',
];

interface FactoryEditProps extends PageProps {
    factory: Factory;
    machineTypes?: MachineType[];
    status?: string;
}

export default function FactoryEdit({ factory, machineTypes = [], status }: FactoryEditProps) {
    const [activeDept, setActiveDept] = useState<DepartmentKey>('sewing');

    const initialCapabilities: string[] = Array.isArray(factory.capabilities) 
        ? factory.capabilities 
        : [];

    const initialSewing: SewingCapacity = factory.production_capacities?.sewing || {
        no_of_lines: factory.total_lines || 0,
        per_line_capacity: factory.total_lines && factory.daily_capacity && parseInt(factory.daily_capacity)
            ? Math.round(parseInt(factory.daily_capacity.replace(/,/g, '')) / Math.max(factory.total_lines, 1))
            : 1000,
        total_capacity_per_day: (factory.total_lines || 0) * 1000,
        rate: '',
        unit: 'Pcs',
    };

    const initialCapacities: ProductionCapacities = {
        sewing: initialSewing,
        knitting: factory.production_capacities?.knitting || [],
        yarn_dyeing: factory.production_capacities?.yarn_dyeing || [],
        fabric_dyeing: factory.production_capacities?.fabric_dyeing || [],
        print: factory.production_capacities?.print || [],
        embroidery: factory.production_capacities?.embroidery || [],
    };

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        business_name: factory.business_name || '',
        industry_type: factory.industry_type || 'Apparel & Garments',
        contact_person: factory.contact_person || '',
        phone: factory.phone || '',
        email: factory.email || '',
        district: factory.district || 'Gazipur',
        address: factory.address || '',
        total_lines: factory.total_lines ?? initialSewing.no_of_lines ?? 0,
        total_machines: factory.total_machines ?? 0,
        daily_capacity: factory.daily_capacity || '',
        production_capacities: initialCapacities,
        trade_license_no: factory.trade_license_no || '',
        tin_no: factory.tin_no || '',
        bin_no: factory.bin_no || '',
        capabilities: initialCapabilities,
    });

    // Helper: update Sewing capacity fields
    const updateSewingField = <K extends keyof SewingCapacity>(field: K, value: SewingCapacity[K]) => {
        setData((prev) => {
            const currentSewing = prev.production_capacities?.sewing || {
                no_of_lines: 0,
                per_line_capacity: 0,
                total_capacity_per_day: 0,
                rate: '',
                unit: 'Pcs',
            };

            const updatedSewing = {
                ...currentSewing,
                [field]: value,
            };

            const lines = field === 'no_of_lines' ? (Number(value) || 0) : (Number(updatedSewing.no_of_lines) || 0);
            const perLine = field === 'per_line_capacity' ? (Number(value) || 0) : (Number(updatedSewing.per_line_capacity) || 0);
            updatedSewing.total_capacity_per_day = lines * perLine;

            return {
                ...prev,
                total_lines: lines,
                production_capacities: {
                    ...prev.production_capacities,
                    sewing: updatedSewing,
                },
            };
        });
    };

    // Helper: add machine row in non-sewing department
    const addMachineRow = (category: NonSewingCategory) => {
        const availableTypes = machineTypes.filter((m) => m.category === category);
        const defaultType = availableTypes[0];

        const newRow: NonSewingMachineRow = {
            id: 'mach_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            machine_type: defaultType ? defaultType.name : '',
            machine_type_id: defaultType ? defaultType.id : null,
            no_of_machine: 1,
            capacity_per_machine: category === 'print' ? 2500 : (category === 'embroidery' ? 1200 : 500),
            total_capacity_per_day: category === 'print' ? 2500 : (category === 'embroidery' ? 1200 : 500),
            rate: '',
            unit_type: defaultType ? defaultType.default_unit : (category === 'print' || category === 'embroidery' ? 'Pcs' : 'Kg'),
        };

        setData((prev) => {
            const existingList = prev.production_capacities?.[category] || [];
            const nextList = [...existingList, newRow];
            const nextCapacities = {
                ...prev.production_capacities,
                [category]: nextList,
            };

            // Recalculate total machines across all non-sewing categories
            const nonSewingCats: NonSewingCategory[] = ['knitting', 'yarn_dyeing', 'fabric_dyeing', 'print', 'embroidery'];
            let totalMach = 0;
            nonSewingCats.forEach((cat) => {
                const rows = cat === category ? nextList : (prev.production_capacities?.[cat] || []);
                rows.forEach((r) => {
                    totalMach += Number(r.no_of_machine) || 0;
                });
            });

            return {
                ...prev,
                total_machines: totalMach,
                production_capacities: nextCapacities,
            };
        });
    };

    // Helper: update machine row in non-sewing department
    const updateMachineRow = (
        category: NonSewingCategory,
        index: number,
        field: keyof NonSewingMachineRow,
        val: any
    ) => {
        setData((prev) => {
            const existingList = [...(prev.production_capacities?.[category] || [])];
            if (!existingList[index]) return prev;

            const row = { ...existingList[index], [field]: val };

            if (field === 'machine_type') {
                const matched = machineTypes.find((m) => m.name === val && m.category === category);
                if (matched) {
                    row.machine_type_id = matched.id;
                    if (!row.unit_type || row.unit_type === 'Kg' || row.unit_type === 'Pcs') {
                        row.unit_type = matched.default_unit;
                    }
                }
            }

            if (field === 'no_of_machine' || field === 'capacity_per_machine') {
                const count = field === 'no_of_machine' ? (Number(val) || 0) : (Number(row.no_of_machine) || 0);
                const cap = field === 'capacity_per_machine' ? (Number(val) || 0) : (Number(row.capacity_per_machine) || 0);
                row.total_capacity_per_day = count * cap;
            }

            existingList[index] = row;
            const nextCapacities = {
                ...prev.production_capacities,
                [category]: existingList,
            };

            const nonSewingCats: NonSewingCategory[] = ['knitting', 'yarn_dyeing', 'fabric_dyeing', 'print', 'embroidery'];
            let totalMach = 0;
            nonSewingCats.forEach((cat) => {
                const rows = cat === category ? existingList : (prev.production_capacities?.[cat] || []);
                rows.forEach((r) => {
                    totalMach += Number(r.no_of_machine) || 0;
                });
            });

            return {
                ...prev,
                total_machines: totalMach,
                production_capacities: nextCapacities,
            };
        });
    };

    // Helper: remove machine row
    const removeMachineRow = (category: NonSewingCategory, index: number) => {
        setData((prev) => {
            const existingList = [...(prev.production_capacities?.[category] || [])];
            existingList.splice(index, 1);
            const nextCapacities = {
                ...prev.production_capacities,
                [category]: existingList,
            };

            const nonSewingCats: NonSewingCategory[] = ['knitting', 'yarn_dyeing', 'fabric_dyeing', 'print', 'embroidery'];
            let totalMach = 0;
            nonSewingCats.forEach((cat) => {
                const rows = cat === category ? existingList : (prev.production_capacities?.[cat] || []);
                rows.forEach((r) => {
                    totalMach += Number(r.no_of_machine) || 0;
                });
            });

            return {
                ...prev,
                total_machines: totalMach,
                production_capacities: nextCapacities,
            };
        });
    };

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

    // Compute department configured counts
    const getDeptCount = (dept: DepartmentMeta): number => {
        if (dept.isSewing) {
            return Number(data.production_capacities?.sewing?.no_of_lines || data.total_lines) || 0;
        }
        const rows = data.production_capacities?.[dept.key as NonSewingCategory] || [];
        return rows.reduce((acc, r) => acc + (Number(r.no_of_machine) || 0), 0);
    };

    const currentSewing = data.production_capacities?.sewing || {
        no_of_lines: data.total_lines || 0,
        per_line_capacity: 1000,
        total_capacity_per_day: (data.total_lines || 0) * 1000,
        rate: '',
        unit: 'Pcs',
    };

    const activeDeptConfig = DEPARTMENTS.find((d) => d.key === activeDept) || DEPARTMENTS[0];
    const nonSewingRows = activeDept !== 'sewing' 
        ? (data.production_capacities?.[activeDept as NonSewingCategory] || [])
        : [];
    const availableCategoryMachines = activeDept !== 'sewing'
        ? machineTypes.filter((m) => m.category === activeDept)
        : [];

    const activeDeptTotalMachines = nonSewingRows.reduce((acc, r) => acc + (Number(r.no_of_machine) || 0), 0);
    const activeDeptTotalCapacity = nonSewingRows.reduce((acc, r) => acc + (Number(r.total_capacity_per_day) || 0), 0);

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
                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                            <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/70 shadow-lg shadow-black/20 gap-1">
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition group"
                                >
                                    <User className="w-3.5 h-3.5 text-slate-400 group-hover:scale-110 transition-transform" />
                                    <span>Personal Profile</span>
                                </Link>
                                <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>Factory Profile</span>
                                </span>
                            </div>

                            {factory.id && (
                                <Link
                                    href={route('vendors.show', factory.id)}
                                    className="inline-flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 hover:text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-slate-700/70 shadow-lg shadow-black/20 transition group"
                                    title="View how buyers see your factory"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                                    <span>Public View</span>
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
                                        <h2 className="text-sm font-bold text-slate-900">Factory Location & Address</h2>
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

                        {/* Section 3: Production Capacity & Machinery Lines */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            {/* Section Header */}
                            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                        <Cpu className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                                            Production Capacity & Lines
                                        </h2>
                                        <p className="text-[11px] text-slate-500">
                                            Manage sewing assembly lines and specialized machinery outputs across production departments.
                                        </p>
                                    </div>
                                </div>

                                {/* Live Factory Summary Badges */}
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-600 self-start sm:self-auto">
                                    <span className="flex items-center gap-1.5 font-bold text-slate-800">
                                        <Scissors className="w-3.5 h-3.5 text-blue-600" />
                                        {data.total_lines || 0} Lines
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="flex items-center gap-1.5 font-bold text-slate-800">
                                        <Cpu className="w-3.5 h-3.5 text-purple-600" />
                                        {data.total_machines || 0} Machines
                                    </span>
                                </div>
                            </div>

                            {/* Sleek Department Navigation Tabs Bar */}
                            <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                    {DEPARTMENTS.map((dept) => {
                                        const Icon = dept.icon;
                                        const isActive = activeDept === dept.key;
                                        const count = getDeptCount(dept);

                                        return (
                                            <button
                                                key={dept.key}
                                                type="button"
                                                onClick={() => setActiveDept(dept.key)}
                                                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                                    isActive
                                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70 font-bold'
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                                                    isActive
                                                        ? `${dept.activeBg} ${dept.color}`
                                                        : 'text-slate-400'
                                                }`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span>{dept.label}</span>
                                                {count > 0 && (
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                                                        isActive
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-slate-200/80 text-slate-600'
                                                    }`}>
                                                        {count} {dept.isSewing ? 'Lines' : 'M/C'}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active Department Content */}
                            {activeDept === 'sewing' ? (
                                /* ==================== SEWING DEPARTMENT ==================== */
                                <div className="space-y-5 bg-gradient-to-br from-blue-50/30 via-white to-slate-50/50 p-5 sm:p-6 rounded-2xl border border-blue-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100/60 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                <Scissors className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                                    Sewing Production Configuration
                                                </h3>
                                                <p className="text-[11px] text-slate-500">
                                                    Garment stitching lines, per-line target efficiency, and make-through CM rates.
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                                            Line Assembly Model
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                                        {/* No. of Line */}
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                No. of Line <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={currentSewing.no_of_lines || ''}
                                                    onChange={(e) => updateSewingField('no_of_lines', parseInt(e.target.value) || 0)}
                                                    placeholder="e.g. 16"
                                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-bold"
                                                />
                                                <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-medium pointer-events-none">
                                                    Lines
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Total active sewing lines</p>
                                        </div>

                                        {/* Per Line Capacity */}
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Per Line Capacity <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={currentSewing.per_line_capacity || ''}
                                                    onChange={(e) => updateSewingField('per_line_capacity', parseInt(e.target.value) || 0)}
                                                    placeholder="e.g. 1200"
                                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-bold"
                                                />
                                                <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-medium pointer-events-none">
                                                    / Line
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Output per 10-hour shift</p>
                                        </div>

                                        {/* Total Capacity / Day (Auto Calculated) */}
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                                                <span>Total Capacity/Day</span>
                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-200">
                                                    Auto
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={
                                                        currentSewing.total_capacity_per_day
                                                            ? Number(currentSewing.total_capacity_per_day).toLocaleString()
                                                            : '0'
                                                    }
                                                    className="w-full text-xs rounded-xl border-slate-200 bg-slate-100/90 text-slate-800 font-black cursor-not-allowed"
                                                />
                                                <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-semibold pointer-events-none">
                                                    {currentSewing.unit || 'Pcs'}/Day
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Lines × Per Line Capacity
                                            </p>
                                        </div>

                                        {/* Rate */}
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Rate (Approx. CM / Unit)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={currentSewing.rate ?? ''}
                                                    onChange={(e) => updateSewingField('rate', e.target.value)}
                                                    placeholder="e.g. 35.00"
                                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-mono"
                                                />
                                                <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-medium pointer-events-none">
                                                    BDT
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Average CM or unit charge</p>
                                        </div>

                                        {/* Unit */}
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                Unit
                                            </label>
                                            <select
                                                value={currentSewing.unit || 'Pcs'}
                                                onChange={(e) => updateSewingField('unit', e.target.value)}
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-medium"
                                            >
                                                <option value="Pcs">Pcs (Pieces)</option>
                                                <option value="Dozen">Dozen (12 Pcs)</option>
                                                <option value="Set">Set</option>
                                                <option value="Pack">Pack</option>
                                            </select>
                                            <p className="text-[10px] text-slate-400 mt-1">Garment counting metric</p>
                                        </div>
                                    </div>

                                    {/* Real-time Calculation Summary Box */}
                                    <div className="bg-white p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Calculator className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">
                                                    {Number(currentSewing.no_of_lines || 0)} Lines &times; {Number(currentSewing.per_line_capacity || 0).toLocaleString()} {currentSewing.unit || 'Pcs'} = <span className="text-blue-600 font-black">{Number(currentSewing.total_capacity_per_day || 0).toLocaleString()} {currentSewing.unit || 'Pcs'}/Day</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">
                                                    Projected monthly output: ~{((currentSewing.total_capacity_per_day || 0) * 26).toLocaleString()} {currentSewing.unit || 'Pcs'} (calculated on 26 standard industrial working days).
                                                </div>
                                            </div>
                                        </div>

                                        {currentSewing.rate && Number(currentSewing.rate) > 0 && (
                                            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 text-right shrink-0">
                                                <span className="text-[10px] text-slate-500 block">Estimated Daily CM Turnover</span>
                                                <span className="text-xs font-black text-slate-900 font-mono">
                                                    BDT {((currentSewing.total_capacity_per_day || 0) * Number(currentSewing.rate)).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* ==================== NON-SEWING DEPARTMENTS ==================== */
                                <div className="space-y-4 bg-slate-50/50 p-5 sm:p-6 rounded-2xl border border-slate-200">
                                    {/* Department Header & Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${activeDeptConfig.activeBg} ${activeDeptConfig.color}`}>
                                                <activeDeptConfig.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                                    {activeDeptConfig.label} Machinery Details
                                                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                                        {nonSewingRows.length} {nonSewingRows.length === 1 ? 'Row' : 'Rows'}
                                                    </span>
                                                </h3>
                                                <p className="text-[11px] text-slate-500">
                                                    Dynamic machinery specification: Select machine type, machine quantity, daily capacity per machine, rate, and unit.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => addMachineRow(activeDept as NonSewingCategory)}
                                            className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition self-start sm:self-auto"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add More Row</span>
                                        </button>
                                    </div>

                                    {/* Machine Rows Table or Empty State */}
                                    {nonSewingRows.length === 0 ? (
                                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-3">
                                            <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${activeDeptConfig.activeBg} ${activeDeptConfig.color}`}>
                                                <activeDeptConfig.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">
                                                    No {activeDeptConfig.label} machinery added yet
                                                </h4>
                                                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                                                    Add your {activeDeptConfig.label} machine types, quantities, and production capacities to attract relevant subcontract buyers.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => addMachineRow(activeDept as NonSewingCategory)}
                                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add First {activeDeptConfig.label} Machine Row
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Responsive Table for Desktop & Tablet */}
                                            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                                        <tr>
                                                            <th className="py-3 px-3 min-w-[220px]">Machine Type</th>
                                                            <th className="py-3 px-2 min-w-[100px]">No. of Machine</th>
                                                            <th className="py-3 px-2 min-w-[130px]">Capacity / Machine</th>
                                                            <th className="py-3 px-2 min-w-[130px]">
                                                                <span className="flex items-center gap-1">
                                                                    Total Capacity/Day
                                                                    <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 py-0.2 rounded font-black">AUTO</span>
                                                                </span>
                                                            </th>
                                                            <th className="py-3 px-2 min-w-[100px]">Rate</th>
                                                            <th className="py-3 px-2 min-w-[90px]">Unit Type</th>
                                                            <th className="py-3 px-2 text-center w-12">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 font-normal">
                                                        {nonSewingRows.map((row, index) => {
                                                            const isCustomMachine = !availableCategoryMachines.some(
                                                                (m) => m.name === row.machine_type
                                                            ) && row.machine_type !== '';

                                                            return (
                                                                <tr key={row.id || index} className="hover:bg-blue-50/20 transition group">
                                                                    {/* 1. Machine Type */}
                                                                    <td className="py-2.5 px-3">
                                                                        <div className="space-y-1">
                                                                            <select
                                                                                value={
                                                                                    availableCategoryMachines.some((m) => m.name === row.machine_type)
                                                                                        ? row.machine_type
                                                                                        : (row.machine_type ? '_custom' : '')
                                                                                }
                                                                                onChange={(e) => {
                                                                                    if (e.target.value === '_custom') {
                                                                                        updateMachineRow(activeDept as NonSewingCategory, index, 'machine_type', 'Custom Machine');
                                                                                    } else {
                                                                                        updateMachineRow(activeDept as NonSewingCategory, index, 'machine_type', e.target.value);
                                                                                    }
                                                                                }}
                                                                                className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 font-medium py-1.5"
                                                                            >
                                                                                <option value="">Select Machine Type...</option>
                                                                                {availableCategoryMachines.map((m) => (
                                                                                    <option key={m.id} value={m.name}>
                                                                                        {m.name} {m.brand_or_model ? `(${m.brand_or_model})` : ''}
                                                                                    </option>
                                                                                ))}
                                                                                <option value="_custom">+ Other / Custom Machine Type</option>
                                                                            </select>

                                                                            {/* Custom machine text entry if needed */}
                                                                            {isCustomMachine && (
                                                                                <input
                                                                                    type="text"
                                                                                    value={row.machine_type}
                                                                                    onChange={(e) => updateMachineRow(activeDept as NonSewingCategory, index, 'machine_type', e.target.value)}
                                                                                    placeholder="Enter custom machine model / name"
                                                                                    className="w-full text-[11px] rounded-lg border-amber-300 bg-amber-50/50 focus:border-blue-500 py-1"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </td>

                                                                    {/* 2. No. of Machine */}
                                                                    <td className="py-2.5 px-2">
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            value={row.no_of_machine || ''}
                                                                            onChange={(e) => updateMachineRow(activeDept as NonSewingCategory, index, 'no_of_machine', parseInt(e.target.value) || 0)}
                                                                            placeholder="1"
                                                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 font-bold py-1.5"
                                                                        />
                                                                    </td>

                                                                    {/* 3. Capacity Per Machine */}
                                                                    <td className="py-2.5 px-2">
                                                                        <div className="relative">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={row.capacity_per_machine || ''}
                                                                                onChange={(e) => updateMachineRow(activeDept as NonSewingCategory, index, 'capacity_per_machine', parseFloat(e.target.value) || 0)}
                                                                                placeholder="500"
                                                                                className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 font-bold py-1.5 pr-10"
                                                                            />
                                                                            <span className="absolute right-2 top-1.5 text-[9px] text-slate-400 font-medium pointer-events-none">
                                                                                {row.unit_type || 'Unit'}
                                                                            </span>
                                                                        </div>
                                                                    </td>

                                                                    {/* 4. Total Capacity/Day (Auto) */}
                                                                    <td className="py-2.5 px-2">
                                                                        <div className="bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-black text-slate-800 border border-slate-200/80 flex items-center justify-between">
                                                                            <span>
                                                                                {row.total_capacity_per_day
                                                                                    ? Number(row.total_capacity_per_day).toLocaleString()
                                                                                    : '0'}
                                                                            </span>
                                                                            <span className="text-[9px] text-slate-500 font-normal ml-1">
                                                                                {row.unit_type || 'Unit'}/Day
                                                                            </span>
                                                                        </div>
                                                                    </td>

                                                                    {/* 5. Rate */}
                                                                    <td className="py-2.5 px-2">
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            value={row.rate ?? ''}
                                                                            onChange={(e) => updateMachineRow(activeDept as NonSewingCategory, index, 'rate', e.target.value)}
                                                                            placeholder="Rate"
                                                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 font-mono py-1.5"
                                                                        />
                                                                    </td>

                                                                    {/* 6. Unit Type */}
                                                                    <td className="py-2.5 px-2">
                                                                        <select
                                                                            value={row.unit_type || 'Kg'}
                                                                            onChange={(e) => updateMachineRow(activeDept as NonSewingCategory, index, 'unit_type', e.target.value)}
                                                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 font-semibold py-1.5"
                                                                        >
                                                                            {STANDARD_UNITS.map((u) => (
                                                                                <option key={u} value={u}>{u}</option>
                                                                            ))}
                                                                        </select>
                                                                    </td>

                                                                    {/* 7. Action (Delete) */}
                                                                    <td className="py-2.5 px-2 text-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeMachineRow(activeDept as NonSewingCategory, index)}
                                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                                            title="Delete machine row"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Department Summary & Add More Row Button */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => addMachineRow(activeDept as NonSewingCategory)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-4 py-2 rounded-xl transition border border-blue-200/60 self-start"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add More Row
                                                </button>

                                                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                                    <div>
                                                        <span className="text-slate-400 font-normal">Total Machines:</span>{' '}
                                                        <span className="font-black text-slate-900">{activeDeptTotalMachines}</span>
                                                    </div>
                                                    <div className="w-px h-3.5 bg-slate-200" />
                                                    <div>
                                                        <span className="text-slate-400 font-normal">Combined Daily Capacity:</span>{' '}
                                                        <span className="font-black text-blue-600">{activeDeptTotalCapacity.toLocaleString()}</span>{' '}
                                                        <span className="text-[11px] text-slate-500">{activeDeptConfig.defaultUnit}/Day</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Additional High-Level Metric Fields (Optional Fine-tuning) */}
                            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                                    <span>
                                        Total lines ({data.total_lines || 0}) and machinery ({data.total_machines || 0}) are automatically synchronized with your department entries.
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
                                        placeholder="e.g. 25,000 Pcs/Day or 12,000 Kg"
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
                                <Award className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>Complete manufacturing and machinery capacity details increase subcontract matching and quotation awards.</span>
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
