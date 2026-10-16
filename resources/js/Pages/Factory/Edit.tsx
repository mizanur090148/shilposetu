import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { 
    Factory, 
    MachineType, 
    KnittingType,
    NonSewingMachineRow, 
    FactoryShift,
    PageProps 
} from '@/types';
import { 
    Building2, 
    User, 
    ShieldCheck, 
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
    Clock,
    ChevronLeft,
    ChevronRight,
    Settings2,
    ShieldAlert
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

type TabKey = 'general' | 'machinery' | 'shifts' | 'compliance';

interface EditProps extends PageProps {
    factory: Factory;
    knittingTypes?: KnittingType[];
    machineTypes?: MachineType[];
    factoryShifts?: FactoryShift[];
    status?: string;
}

export default function Edit({ 
    auth, 
    factory, 
    knittingTypes = [], 
    machineTypes = [], 
    factoryShifts = [],
    status 
}: EditProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('general');

    const initialCapabilities: string[] = Array.isArray(factory.capabilities) 
        ? factory.capabilities 
        : [];

    const initialKnittingMachines: NonSewingMachineRow[] = factory.production_capacities?.knitting || [];

    const initialShifts: FactoryShift[] = factoryShifts && factoryShifts.length > 0
        ? factoryShifts
        : (factory.factory_shifts && factory.factory_shifts.length > 0 ? factory.factory_shifts : [
            {
                name: 'Day Shift (ডে শিফট)',
                code: 'DAY',
                start_time: '08:00',
                end_time: '20:00',
                duration_hours: 12,
                in_charge: factory.contact_person || '',
                target_output_kg: 1200,
                is_active: true,
                notes: '১২ ঘণ্টার ডে প্রোডাকশন শিফট'
            },
            {
                name: 'Night Shift (নাইট শিফট)',
                code: 'NIGHT',
                start_time: '20:00',
                end_time: '08:00',
                duration_hours: 12,
                in_charge: factory.contact_person || '',
                target_output_kg: 1000,
                is_active: true,
                notes: '১২ ঘণ্টার নাইট প্রোডাকশন শিফট'
            }
        ]);

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
        shifts: initialShifts,
        trade_license_no: factory.trade_license_no || '',
        tin_no: factory.tin_no || '',
        bin_no: factory.bin_no || '',
        capabilities: initialCapabilities,
        knitting_types: (factory as any)?.knitting_types 
            ? (factory as any).knitting_types.map((k: any) => typeof k === 'object' ? k.id : k) 
            : [],
    });

    // Check URL query param on mount (e.g. ?tab=shifts)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as TabKey;
        if (tabParam && ['general', 'machinery', 'shifts', 'compliance'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, []);

    const switchTab = (tab: TabKey) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
    };

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

    // Calculate shift duration in hours
    const calculateShiftHours = (start: string, end: string): number => {
        if (!start || !end) return 8;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        let startMin = (sh || 0) * 60 + (sm || 0);
        let endMin = (eh || 0) * 60 + (em || 0);
        if (endMin <= startMin) {
            endMin += 24 * 60; // passes midnight
        }
        const diff = (endMin - startMin) / 60;
        return Math.round(diff * 10) / 10;
    };

    // Apply quick presets
    const applyShiftPreset = (presetCount: 1 | 2 | 3) => {
        const defaultPerson = data.contact_person || factory.contact_person || '';
        if (presetCount === 1) {
            setData('shifts', [
                {
                    name: 'Day Shift (ডে শিফট)',
                    code: 'DAY',
                    start_time: '08:00',
                    end_time: '20:00',
                    duration_hours: 12,
                    in_charge: defaultPerson,
                    target_output_kg: 1200,
                    is_active: true,
                    notes: '১২ ঘণ্টার ডে প্রোডাকশন শিফট'
                }
            ]);
        } else if (presetCount === 2) {
            setData('shifts', [
                {
                    name: 'Day Shift (ডে শিফট)',
                    code: 'DAY',
                    start_time: '08:00',
                    end_time: '20:00',
                    duration_hours: 12,
                    in_charge: defaultPerson,
                    target_output_kg: 1200,
                    is_active: true,
                    notes: 'সকাল ৮:০০ - রাত ৮:০০ (ডে শিফট)'
                },
                {
                    name: 'Night Shift (নাইট শিফট)',
                    code: 'NIGHT',
                    start_time: '20:00',
                    end_time: '08:00',
                    duration_hours: 12,
                    in_charge: defaultPerson,
                    target_output_kg: 1000,
                    is_active: true,
                    notes: 'রাত ৮:০০ - সকাল ৮:০০ (নাইট শিফট)'
                }
            ]);
        } else {
            setData('shifts', [
                {
                    name: 'শিফট A (মর্নিং)',
                    code: 'A',
                    start_time: '06:00',
                    end_time: '14:00',
                    duration_hours: 8,
                    in_charge: defaultPerson,
                    target_output_kg: 800,
                    is_active: true,
                    notes: 'সকাল ৬:০০ - দুপুর ২:০০ (মর্নিং শিফট)'
                },
                {
                    name: 'শিফট B (ইভনিং)',
                    code: 'B',
                    start_time: '14:00',
                    end_time: '22:00',
                    duration_hours: 8,
                    in_charge: defaultPerson,
                    target_output_kg: 800,
                    is_active: true,
                    notes: 'দুপুর ২:০০ - রাত ১০:০০ (ইভনিং শিফট)'
                },
                {
                    name: 'শিফট C (নাইট)',
                    code: 'C',
                    start_time: '22:00',
                    end_time: '06:00',
                    duration_hours: 8,
                    in_charge: defaultPerson,
                    target_output_kg: 700,
                    is_active: true,
                    notes: 'রাত ১০:০০ - সকাল ৬:০০ (নাইট শিফট)'
                }
            ]);
        }
    };

    const addShiftRow = () => {
        const nextIdx = (data.shifts || []).length + 1;
        const newShift: FactoryShift = {
            name: `শিফট ${String.fromCharCode(64 + nextIdx)}`,
            code: String.fromCharCode(64 + nextIdx),
            start_time: '08:00',
            end_time: '16:00',
            duration_hours: 8,
            in_charge: data.contact_person || '',
            target_output_kg: 800,
            is_active: true,
            notes: ''
        };
        setData('shifts', [...(data.shifts || []), newShift]);
    };

    const updateShiftRow = (index: number, field: keyof FactoryShift, val: any) => {
        const list = [...(data.shifts || [])];
        if (!list[index]) return;
        const updated = { ...list[index], [field]: val };

        if (field === 'start_time' || field === 'end_time') {
            const start = field === 'start_time' ? val : updated.start_time;
            const end = field === 'end_time' ? val : updated.end_time;
            updated.duration_hours = calculateShiftHours(start, end);
        }

        list[index] = updated;
        setData('shifts', list);
    };

    const removeShiftRow = (index: number) => {
        const list = [...(data.shifts || [])];
        list.splice(index, 1);
        setData('shifts', list);
    };

    const toggleShiftActive = (index: number) => {
        const list = [...(data.shifts || [])];
        if (!list[index]) return;
        list[index] = { ...list[index], is_active: !list[index].is_active };
        setData('shifts', list);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('factory.update'));
    };

    const knittingRows = data.production_capacities?.knitting || [];
    const totalDailyCapacity = knittingRows.reduce((acc, r) => acc + (Number(r.total_capacity_per_day) || 0), 0);
    const activeShifts = (data.shifts || []).filter((s) => s.is_active);
    const totalShiftHours = activeShifts.reduce((acc, s) => acc + (Number(s.duration_hours) || 0), 0);

    const tabsConfig = [
        {
            key: 'general' as TabKey,
            title: 'সাধারণ ও যোগাযোগ',
            enTitle: 'General & Contact',
            icon: Building2,
            badge: data.district || 'বাংলাদেশ'
        },
        {
            key: 'machinery' as TabKey,
            title: 'মেশিন ও সক্ষমতা',
            enTitle: 'Machinery & Capacity',
            icon: Cpu,
            badge: `${data.total_machines || 0}টি মেশিন`
        },
        {
            key: 'shifts' as TabKey,
            title: 'কাজের শিফট',
            enTitle: 'Factory Shifts',
            icon: Clock,
            badge: `${activeShifts.length}টি শিফট (${totalShiftHours}h)`
        },
        {
            key: 'compliance' as TabKey,
            title: 'লাইসেন্স ও কমপ্লায়েন্স',
            enTitle: 'Legal & Tax',
            icon: FileText,
            badge: data.trade_license_no ? 'নথিভুক্ত' : 'বাকি'
        }
    ];

    const currentTabIdx = tabsConfig.findIndex(t => t.key === activeTab);

    return (
        <ShilposetuLayout>
            <Head title="Factory Profile & Capacity Management - Shilposetu" />

            {/* TOP REFINED INDUSTRIAL HERO HEADER */}
            <div className="bg-slate-900 border-b border-slate-800 text-white py-6 sm:py-8 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        
                        {/* Title & Identity Info */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Manufacturing Unit</span>
                                </span>
                                {factory.is_verified ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        Verified Factory
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                        Verification Pending
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                {data.business_name || 'Industrial Factory Unit'}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 flex-wrap">
                                <span>📍 {data.district || 'Gazipur'}, Bangladesh</span>
                                <span>•</span>
                                <span>👤 {data.contact_person || 'Unit Head'}</span>
                                {data.phone && (
                                    <>
                                        <span>•</span>
                                        <span>📞 {data.phone}</span>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Top Quick Action & Navigation Links */}
                        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
                            {factory.id && (
                                <Link
                                    href={route('factories.show', factory.id)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition shadow-xs"
                                    title="View public factory profile"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                                    <span>পাবলিক ভিউ</span>
                                </Link>
                            )}

                            <Link
                                href={route('profile.edit')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition shadow-xs"
                            >
                                <User className="w-3.5 h-3.5 text-emerald-400" />
                                <span>ব্যক্তিগত প্রোফাইল</span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 sm:px-5 py-2 rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>{processing ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Live KPI Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
                        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                                <Cpu className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">নিটিং মেশিন</span>
                                <b className="text-white text-sm font-bold">{data.total_machines || 0} টি ইউনিট</b>
                            </div>
                        </div>

                        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                <Award className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">দৈনিক সক্ষমতা</span>
                                <b className="text-white text-sm font-bold">
                                    {totalDailyCapacity > 0 ? `${totalDailyCapacity.toLocaleString()} kg/দিন` : (data.daily_capacity || '০ kg')}
                                </b>
                            </div>
                        </div>

                        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">শিফট সময়সূচী</span>
                                <b className="text-white text-sm font-bold">{activeShifts.length} টি শিফট ({totalShiftHours}h)</b>
                            </div>
                        </div>

                        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">ফেব্রিক টাইপস</span>
                                <b className="text-white text-sm font-bold">{(data.knitting_types || []).length} টি সিলেক্টেড</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA WITH CLEAN TAB NAVIGATION */}
            <div className="bg-slate-100/70 min-h-screen py-6 pb-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {status && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    {recentlySuccessful && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>কারখানার প্রোফাইল ও ক্যাপাসিটি সফলভাবে আপডেট হয়েছে!</span>
                        </div>
                    )}

                    {/* HORIZONTAL TAB BAR */}
                    <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {tabsConfig.map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => switchTab(tab.key)}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                    }`}
                                >
                                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                    <span>{tab.title}</span>
                                    <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${
                                            isActive
                                                ? 'bg-blue-700/80 text-blue-100'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {tab.badge}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* ======================================================== */}
                        {/* TAB 1: GENERAL & CONTACT DETAILS                         */}
                        {/* ======================================================== */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Section 1: Business Identity & Overview */}
                                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
                                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-900">১. কারখানার পরিচিতি ও ক্যাটাগরি</h2>
                                            <p className="text-[11px] text-slate-500">Official registered industrial unit title and operating sector.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">
                                                কারখানা / প্রতিষ্ঠানের নাম <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={data.business_name}
                                                onChange={(e) => setData('business_name', e.target.value)}
                                                placeholder="e.g. Apex Knitting & Composite Ltd"
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 font-semibold"
                                            />
                                            {errors.business_name && <p className="text-rose-600 text-[10px] mt-1">{errors.business_name}</p>}
                                        </div>

                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">শিল্প ক্যাটাগরি (Operating Industry)</label>
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
                                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
                                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-900">২. প্ল্যান্টের অবস্থান ও যোগাযোগকারী কর্মকর্তা</h2>
                                            <p className="text-[11px] text-slate-500">Contact manager and physical factory address for order inspections.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">দায়িত্বপ্রাপ্ত কর্মকর্তা / Contact Person</label>
                                            <input
                                                type="text"
                                                value={data.contact_person}
                                                onChange={(e) => setData('contact_person', e.target.value)}
                                                placeholder="e.g. Md. Jahangir Alam"
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                            />
                                            {errors.contact_person && <p className="text-rose-600 text-[10px] mt-1">{errors.contact_person}</p>}
                                        </div>

                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">ফোন নম্বর / Mobile</label>
                                            <input
                                                type="text"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="01711XXXXXX"
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-mono"
                                            />
                                            {errors.phone && <p className="text-rose-600 text-[10px] mt-1">{errors.phone}</p>}
                                        </div>

                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">ইমেইল ঠিকানা / Email</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="factory@company.com"
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                            />
                                            {errors.email && <p className="text-rose-600 text-[10px] mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">শিল্প জোন / জেলা (Industrial District)</label>
                                            <select
                                                value={data.district}
                                                onChange={(e) => setData('district', e.target.value)}
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 font-semibold"
                                            >
                                                {DISTRICTS.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                            {errors.district && <p className="text-rose-600 text-[10px] mt-1">{errors.district}</p>}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block font-bold text-slate-700 mb-1">কারখানার পূর্ণ ঠিকানা (Plant Physical Address)</label>
                                            <input
                                                type="text"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="e.g. Plot #12, Road #4, Vogra, Gazipur Sadar, Gazipur"
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500"
                                            />
                                            {errors.address && <p className="text-rose-600 text-[10px] mt-1">{errors.address}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* TAB 2: MACHINERY & CAPACITY                              */}
                        {/* ======================================================== */}
                        {activeTab === 'machinery' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Section 3: Knitting Types & Machines */}
                                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
                                    <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                                <Cpu className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                                                    ৩. নিটিং ফেব্রিক টাইপ ও মেশিন তালিকা
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
                                                    উৎপাদনযোগ্য নিটিং ফেব্রিক টাইপসমূহ
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
                                                                ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
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
                                                    নিটিং মেশিন তালিকা (Knitting Machinery)
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
                                                <span>+ মেশিন যোগ করুন</span>
                                            </button>
                                        </div>

                                        {knittingRows.length === 0 ? (
                                            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                                                No machines registered under knitting yet. Click "মেশিন যোগ করুন" to register machine units.
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
                                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">মেশিন সংখ্যা (Qty)</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={row.no_of_machine || ''}
                                                                onChange={(e) => updateMachineRow(idx, 'no_of_machine', e.target.value)}
                                                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">দৈনিক ক্যাপাসিটি / মেশিন</label>
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
                                                                <span className="text-[10px] text-slate-400 block">মোট ক্যাপাসিটি</span>
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
                                                কাস্টম ক্যাপাসিটি লেবেল:
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

                                {/* Section 5: Capabilities & Processes */}
                                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
                                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-900">৪. বিশেষ সক্ষমতা ও সার্টিফিকেশন</h2>
                                                <p className="text-[11px] text-slate-500">Highlight your plant's compliance, fabric specializations, and lab services.</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                            {data.capabilities.length} Capabilities Active
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1 text-xs">
                                        {COMMON_CAPABILITIES.map((cap) => {
                                            const selected = data.capabilities.includes(cap);
                                            return (
                                                <button
                                                    type="button"
                                                    key={cap}
                                                    onClick={() => toggleCapability(cap)}
                                                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                                                        selected
                                                            ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-2xs'
                                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <span className="truncate">{cap}</span>
                                                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                                        selected ? 'bg-purple-600 text-white' : 'border border-slate-300 bg-white'
                                                    }`}>
                                                        {selected && <Check className="w-3 h-3 stroke-[3]" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* TAB 3: WORKING SHIFTS                                    */}
                        {/* ======================================================== */}
                        {activeTab === 'shifts' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Section 4: Factory Working Shifts & Operating Hours */}
                                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
                                    {/* Section Header */}
                                    <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                    <span>কারখানার শিফট ব্যবস্থা ও কর্মঘণ্টা (Shifts Roster)</span>
                                                </h2>
                                                <p className="text-[11px] text-slate-500">
                                                    Configure daily work shifts, shift timings, in-charge supervisors, and production targets. These shifts sync with Knitkhata production logging.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Live Shift Summary Badges */}
                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-600 self-start sm:self-auto">
                                            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                                                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                                {totalShiftHours} Hours / Day
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="flex items-center gap-1.5 font-bold text-blue-700">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                                {activeShifts.length} Active Shifts
                                            </span>
                                        </div>
                                    </div>

                                    {/* Preset Buttons & Add Action */}
                                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                    দ্রুত শিফট টেমপ্লেট:
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => applyShiftPreset(1)}
                                                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 rounded-lg shadow-2xs transition cursor-pointer"
                                                >
                                                    ১টি শিফট (Day 12h)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyShiftPreset(2)}
                                                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 rounded-lg shadow-2xs transition cursor-pointer"
                                                >
                                                    ২টি শিফট (Day/Night 12h)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyShiftPreset(3)}
                                                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 rounded-lg shadow-2xs transition cursor-pointer"
                                                >
                                                    ৩টি শিফট (A, B, C 8h)
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addShiftRow}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer self-start sm:self-auto"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>+ নতুন শিফট যোগ</span>
                                            </button>
                                        </div>

                                        {/* Shift Roster Cards */}
                                        {(data.shifts || []).length === 0 ? (
                                            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                                                No shifts configured yet. Choose a quick template above or click "+ নতুন শিফট যোগ".
                                            </div>
                                        ) : (
                                            <div className="space-y-3 pt-1">
                                                {(data.shifts || []).map((shift, idx) => (
                                                    <div
                                                        key={shift.id || idx}
                                                        className={`p-4 rounded-xl border transition ${
                                                            shift.is_active
                                                                ? 'bg-white border-slate-200 shadow-2xs'
                                                                : 'bg-slate-100/70 border-slate-200 opacity-60'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center font-mono">
                                                                    {shift.code || (idx + 1)}
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={shift.name}
                                                                    onChange={(e) => updateShiftRow(idx, 'name', e.target.value)}
                                                                    placeholder="শিফটের নাম (e.g. শিফট A / Day Shift)"
                                                                    className="text-xs font-bold text-slate-800 bg-transparent border-0 border-b border-dashed border-slate-300 focus:border-emerald-500 focus:ring-0 px-1 py-0.5 w-48 sm:w-64"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2 self-end lg:self-auto">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleShiftActive(idx)}
                                                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                                                                        shift.is_active
                                                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                                                            : 'bg-slate-200 border-slate-300 text-slate-600'
                                                                    }`}
                                                                >
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${shift.is_active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                                                                    <span>{shift.is_active ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}</span>
                                                                </button>

                                                                {(data.shifts || []).length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeShiftRow(idx)}
                                                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                                        title="Delete shift"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 text-xs">
                                                            <div>
                                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                                    শিফট কোড (Code)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={shift.code}
                                                                    onChange={(e) => updateShiftRow(idx, 'code', e.target.value.toUpperCase())}
                                                                    placeholder="A / B / DAY"
                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:border-emerald-500 uppercase"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                                    শুরুর সময় (Start)
                                                                </label>
                                                                <input
                                                                    type="time"
                                                                    value={shift.start_time}
                                                                    onChange={(e) => updateShiftRow(idx, 'start_time', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold focus:border-emerald-500"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                                    শেষের সময় (End)
                                                                </label>
                                                                <input
                                                                    type="time"
                                                                    value={shift.end_time}
                                                                    onChange={(e) => updateShiftRow(idx, 'end_time', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold focus:border-emerald-500"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                                    কর্মঘণ্টা (Hours)
                                                                </label>
                                                                <div className="flex items-center gap-1">
                                                                    <input
                                                                        type="number"
                                                                        step="0.5"
                                                                        min="1"
                                                                        max="24"
                                                                        value={shift.duration_hours || ''}
                                                                        onChange={(e) => updateShiftRow(idx, 'duration_hours', Number(e.target.value))}
                                                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-emerald-700 focus:border-emerald-500"
                                                                    />
                                                                    <span className="text-[10px] text-slate-400">h</span>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                                    ইন-চার্জ / সুপারভাইজার
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={shift.in_charge || ''}
                                                                    onChange={(e) => updateShiftRow(idx, 'in_charge', e.target.value)}
                                                                    placeholder="ইন-চার্জ নাম"
                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:border-emerald-500"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                                    টার্গেট উৎপাদন (kg)
                                                                </label>
                                                                <div className="flex items-center gap-1">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={shift.target_output_kg || ''}
                                                                        onChange={(e) => updateShiftRow(idx, 'target_output_kg', Number(e.target.value))}
                                                                        placeholder="৯০০"
                                                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:border-emerald-500"
                                                                    />
                                                                    <span className="text-[10px] text-slate-400">kg</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                                                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">নোট / বিবরণ:</span>
                                                            <input
                                                                type="text"
                                                                value={shift.notes || ''}
                                                                onChange={(e) => updateShiftRow(idx, 'notes', e.target.value)}
                                                                placeholder="যেমন: সকাল ৬:০০ - দুপুর ২:০০ (মর্নিং শিফট)"
                                                                className="w-full bg-transparent border-0 text-slate-500 text-[11px] p-0 focus:ring-0 placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                                        <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>
                                            এই শিফট কনফিগারেশনটি কারখানার <b>নিটখাতা (Knitkhata)</b> দৈনিক প্রোডাকশন লগ, বাল্ক ফ্লোর শিট এবং সিঙ্গেল মেশিন এন্ট্রির সাথে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ======================================================== */}
                        {/* TAB 4: LEGAL & TAX COMPLIANCE                            */}
                        {/* ======================================================== */}
                        {activeTab === 'compliance' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Section 6: Legal & Tax Compliance */}
                                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
                                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-900">৫. আইনি লাইসেন্স ও ট্যাক্স পরিচিতি</h2>
                                            <p className="text-[11px] text-slate-500">Used for verification of genuine manufacturing facilities.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <label className="block font-bold text-slate-700 mb-1">ট্রেড লাইসেন্স নম্বর (Trade Licence No.)</label>
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
                                            <label className="block font-bold text-slate-700 mb-1">ই-টিন সার্টিফিকেট (TIN Certificate No.)</label>
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
                                            <label className="block font-bold text-slate-700 mb-1">বিআইএন / ভ্যাট নম্বর (BIN / VAT Registration)</label>
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

                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3 mt-4">
                                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <b className="text-slate-900 block">কেন এই তথ্যগুলো জরুরি?</b>
                                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                                শিল্পসেতু প্ল্যাটফর্মে আসল উৎপাদনকারী কারখানা হিসেবে ভেরিফাইড ব্যাজ পাওয়ার জন্য বৈধ ট্রেড লাইসেন্স ও ট্যাক্স তথ্য প্রয়োজন। ভেরিফাইড ফ্যাক্টরিগুলো বড় গার্মেন্টস ও বায়িং হাউজের কাছ থেকে অগ্রাধিকার ভিত্তিতে সরাসরি সাব-কন্ট্রাক্ট কাজ পায়।
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STICKY BOTTOM SAVE & NAVIGATION BAR */}
                        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-4 sm:px-8 py-3.5">
                            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                                
                                {/* Step navigation indicator */}
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="font-bold text-slate-700 hidden sm:inline">
                                        ট্যাব {currentTabIdx + 1} / {tabsConfig.length}:
                                    </span>
                                    <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                                        {tabsConfig[currentTabIdx]?.title}
                                    </span>
                                </div>

                                {/* Prev / Next & Save Buttons */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {currentTabIdx > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => switchTab(tabsConfig[currentTabIdx - 1].key)}
                                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">আগের ধাপ</span>
                                        </button>
                                    )}

                                    {currentTabIdx < tabsConfig.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => switchTab(tabsConfig[currentTabIdx + 1].key)}
                                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                                        >
                                            <span className="hidden sm:inline">পরের ধাপ</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 sm:px-7 py-2.5 rounded-xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{processing ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </ShilposetuLayout>
    );
}
