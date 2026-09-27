import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import AuthGateModal from '@/Components/AuthGateModal';
import { formatDeadline } from '@/utils/date';
import { 
    MapPin, 
    Calendar, 
    Phone, 
    Lock, 
    Layers, 
    CheckCircle2, 
    AlertTriangle, 
    Building2, 
    ArrowLeft, 
    FileText, 
    Send,
    DollarSign,
    Clock,
    UserCheck,
    BarChart3,
    Sparkles,
    Check,
    X,
    Edit3,
    Trash2,
    PhoneCall,
    Award,
    ChevronRight,
    MessageSquare,
    Package,
    Cpu,
    Gauge,
    Activity,
    Hash,
    Tag,
    Zap,
    ShieldCheck,
    Mail
} from 'lucide-react';

const getSpecIcon = (key: string) => {
    switch (key.toLowerCase()) {
        case 'fabric_gsm':
        case 'gsm':
            return <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
        case 'yarn_count':
            return <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
        case 'machine_type':
            return <Cpu className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
        case 'machine_qty':
        case 'no_of_lines':
            return <Hash className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
        case 'gauge_dia':
        case 'gauge_diameter':
            return <Gauge className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
        case 'total_capacity':
            return <Activity className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
        case 'capacity_per_machine':
        case 'per_line_capacity':
            return <Zap className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
        default:
            return <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
};

const formatSpecValue = (key: string, val: any) => {
    const str = String(val);
    if (key.toLowerCase().includes('capacity') && !isNaN(Number(str))) {
        return `${Number(str).toLocaleString()} kg/day`;
    }
    if (key.toLowerCase().includes('machine_qty') && !isNaN(Number(str))) {
        return `${str} Sets`;
    }
    return str;
};

interface QuotationItem {
    id: number;
    subcontract_post_id: number;
    bidder_user_id: number;
    bidder_factory_id: number | null;
    offered_unit_price: number | string;
    offered_lead_days: number;
    offered_total_cost: number | string | null;
    note: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    bidder_factory?: {
        id: number;
        business_name: string;
        district?: string;
        is_verified?: boolean;
        total_machines?: number;
        total_lines?: number;
        rating?: number | string;
    };
    bidder_user?: {
        id: number;
        name: string;
        customer_id?: string;
        phone?: string;
        email?: string;
    };
}

interface PostShowProps {
    post: any;
    userCanViewFullDetails: boolean;
    isOwner: boolean;
    auth: {
        user: any;
    };
}

export default function PostShow({ post, userCanViewFullDetails, isOwner, auth }: PostShowProps) {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [isEditingBid, setIsEditingBid] = useState(false);
    const [statusProcessingId, setStatusProcessingId] = useState<number | null>(null);
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

    const quotations: QuotationItem[] = post.quotations || [];
    const myQuotation = quotations.find((q) => q.bidder_user_id === auth.user?.id);
    const acceptedQuotation = quotations.find((q) => q.status === 'accepted');
    const hasAcceptedQuotation = !!acceptedQuotation;

    // Quotation bid form
    const { data, setData, post: submitBid, processing, errors, reset } = useForm({
        offered_unit_price: myQuotation ? String(myQuotation.offered_unit_price) : (post.target_rate ? String(post.target_rate) : ''),
        offered_lead_days: myQuotation ? myQuotation.offered_lead_days : 14,
        note: myQuotation ? (myQuotation.note || '') : '',
    });

    const handleStartEdit = () => {
        if (myQuotation) {
            setData({
                offered_unit_price: String(myQuotation.offered_unit_price),
                offered_lead_days: myQuotation.offered_lead_days,
                note: myQuotation.note || '',
            });
        }
        setIsEditingBid(true);
    };

    const handleCancelEdit = () => {
        setIsEditingBid(false);
        if (myQuotation) {
            setData({
                offered_unit_price: String(myQuotation.offered_unit_price),
                offered_lead_days: myQuotation.offered_lead_days,
                note: myQuotation.note || '',
            });
        }
    };

    const handleBidSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitBid(route('quotations.store', post.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingBid(false);
            },
        });
    };

    const handleWithdrawBid = () => {
        if (!myQuotation) return;
        router.delete(route('quotations.destroy', myQuotation.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowWithdrawConfirm(false);
                reset();
            },
        });
    };

    const handleUpdateQuotationStatus = (quotationId: number, status: 'accepted' | 'rejected' | 'pending') => {
        setStatusProcessingId(quotationId);
        router.patch(
            route('quotations.status', quotationId),
            { status },
            {
                preserveScroll: true,
                onFinish: () => setStatusProcessingId(null),
            }
        );
    };

    // Market summary metrics
    const bidsCount = quotations.length;
    const lowestOffer = bidsCount > 0 ? Math.min(...quotations.map((q) => Number(q.offered_unit_price))) : null;
    const fastestLeadDays = bidsCount > 0 ? Math.min(...quotations.map((q) => Number(q.offered_lead_days))) : null;
    const avgOffer = bidsCount > 0 ? Math.round(quotations.reduce((sum, q) => sum + Number(q.offered_unit_price), 0) / bidsCount) : null;

    // Real-time calculation helpers
    const offeredRateNum = parseFloat(String(data.offered_unit_price)) || 0;
    const offeredLeadDaysNum = parseInt(String(data.offered_lead_days)) || 1;
    const targetQtyNum = Number(post.target_quantity) || 0;
    const totalOrderCost = Math.round(offeredRateNum * targetQtyNum);
    const dailyCapacityRequired = targetQtyNum > 0 && offeredLeadDaysNum > 0 ? Math.ceil(targetQtyNum / offeredLeadDaysNum) : 0;
    const targetRateNum = parseFloat(String(post.target_rate)) || 0;
    const rateDiff = targetRateNum > 0 && offeredRateNum > 0 ? (offeredRateNum - targetRateNum) : null;

    const quickNoteTags = [
        '⚡ Immediate machine allocation',
        '🧵 Dedicated knitting lines',
        '📦 Export standard packaging',
        '✓ 100% Quality control guaranteed'
    ];

    const handleAppendNote = (tag: string) => {
        if (!data.note) {
            setData('note', tag);
        } else if (!data.note.includes(tag)) {
            setData('note', `${data.note} • ${tag}`);
        }
    };

    return (
        <ShilposetuLayout>
            <Head title={`${post.title} - Shilposetu`} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button */}
                <Link
                    href={route('feed.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Subcontract Feed
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Post Details & Bidding Activity */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Main Post Details Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-7">
                            {/* Badges & Meta */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                                        post.post_type === 'DEMAND' ? 'bg-blue-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs'
                                    }`}>
                                        {post.post_type === 'DEMAND' ? 'Have Extra Orders (Need Subcontract)' : 'Available Capacity'}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-3 py-1 rounded-full">
                                        {post.category.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                {post.is_urgent && (
                                    <span className="bg-rose-500 text-white font-extrabold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-xs animate-pulse">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Urgent Order
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                                    {post.title}
                                </h1>
                            </div>

                            {/* Author & Factory Profile Hero Banner */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 bg-gradient-to-r from-slate-50 via-slate-50/70 to-blue-50/40 rounded-2xl border border-slate-200/80 shadow-2xs">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs ring-4 ring-blue-50/80">
                                        {post.factory?.business_name?.charAt(0) || post.user?.name?.charAt(0) || 'F'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-black text-base text-slate-900 leading-tight">
                                                {post.factory?.business_name || post.user?.name}
                                            </h3>
                                            {post.factory?.is_verified && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-100/70 border border-blue-200/70 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                                    Verified Unit
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                                            <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-slate-700 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md">
                                                ID: {post.user?.customer_id || 'S20260105'}
                                            </span>
                                            <span>•</span>
                                            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                                {post.district}
                                            </span>
                                            {post.factory?.rating && (
                                                <>
                                                    <span>•</span>
                                                    <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                                                        ★ {post.factory.rating}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {post.factory_id && (
                                    <Link
                                        href={route('vendors.show', post.factory_id)}
                                        className="self-start sm:self-center inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-50/80 px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs transition"
                                    >
                                        <span>View Plant Profile</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                )}
                            </div>

                            {/* Key Stats: 4 Distinct Elegant Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {/* Total Quantity */}
                                <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs transition group">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Order Quantity</span>
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                                            <Package className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <div className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                                        {post.target_quantity.toLocaleString()}{' '}
                                        <span className="text-xs font-bold text-slate-500 uppercase">{post.unit}</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Required Production</span>
                                </div>

                                {/* Target Rate */}
                                <div className="bg-emerald-50/40 hover:bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100/90 shadow-2xs transition group">
                                    <div className="flex items-center justify-between text-emerald-600 mb-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Target Unit Rate</span>
                                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
                                            <DollarSign className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <div className="font-black text-emerald-600 text-lg sm:text-xl tracking-tight">
                                        {post.target_rate ? `৳ ${post.target_rate}` : 'Negotiable'}
                                    </div>
                                    <span className="text-[11px] text-emerald-700/80 font-medium block mt-0.5">
                                        {post.target_rate ? `per ${post.unit}` : 'Open to proposals'}
                                    </span>
                                </div>

                                {/* Delivery Deadline */}
                                <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs transition group">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Target Deadline</span>
                                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                                            <Calendar className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <div className="font-black text-slate-900 text-sm sm:text-base tracking-tight truncate">
                                        {formatDeadline(post.deadline)}
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Delivery Deadline</span>
                                </div>

                                {/* Factory Lines */}
                                <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs transition group">
                                    <div className="flex items-center justify-between text-slate-400 mb-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Factory Lines</span>
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
                                            <Building2 className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                    <div className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                                        {post.factory?.total_lines ? `${post.factory.total_lines} Lines` : 'Open'}
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Plant Capacity</span>
                                </div>
                            </div>

                            {/* Manufacturing Specifications - Modern Tech Sheet */}
                            {post.specs && Object.keys(post.specs).length > 0 && (
                                <div className="space-y-3 pt-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-blue-600" />
                                            Manufacturing Specifications ({post.category.replace(/_/g, ' ')})
                                        </h3>
                                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-100">
                                            Technical Data Sheet
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Featured Machine Type Banner (if exists) */}
                                        {post.specs.machine_type && (
                                            <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 p-4 rounded-2xl border border-blue-100/90 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                                        <Cpu className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                                                            Recommended Machine Technology
                                                        </span>
                                                        <span className="font-black text-sm sm:text-base text-slate-900">
                                                            {post.specs.machine_type}
                                                        </span>
                                                    </div>
                                                </div>
                                                {post.specs.machine_qty && (
                                                    <span className="bg-white border border-blue-200 text-blue-800 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-2xs">
                                                        {post.specs.machine_qty} Sets Required
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Grid for other specs */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {Object.entries(post.specs)
                                                .filter(([key]) => key !== 'machine_type' && key !== 'machine_qty')
                                                .map(([key, val]) => (
                                                    <div
                                                        key={key}
                                                        className="bg-slate-50/80 hover:bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs transition flex flex-col justify-between"
                                                    >
                                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 truncate">
                                                            {getSpecIcon(key)}
                                                            {key.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="font-bold text-slate-900 text-xs sm:text-sm mt-1.5 truncate" title={String(val)}>
                                                            {formatSpecValue(key, val)}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Detailed Order Requirements */}
                            <div className="space-y-2 pt-1">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    Detailed Order Requirements & Scope
                                </h3>
                                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 border-l-4 border-l-blue-600 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line shadow-2xs">
                                    {post.description}
                                </div>
                            </div>

                            {/* GATED SECTION: Tech Pack & Direct Contacts */}
                            <div className="border-t border-slate-200/80 pt-6">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    Garment Tech Pack & Direct Factory Contacts
                                </h3>

                                {userCanViewFullDetails ? (
                                    <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
                                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-extrabold">
                                            <UserCheck className="w-4 h-4 text-emerald-600" />
                                            <span>Full Member Access Unlocked (Subscribed Factory)</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                                            <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                                                <span className="text-slate-400 block text-[10px] font-bold uppercase">Contact Person</span>
                                                <strong className="text-slate-900 text-sm font-bold mt-0.5 block">{post.user.name}</strong>
                                            </div>
                                            <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                                                <span className="text-slate-400 block text-[10px] font-bold uppercase">Direct Phone / WhatsApp</span>
                                                <a
                                                    href={`tel:${post.user.phone}`}
                                                    className="text-emerald-700 font-extrabold text-sm hover:underline flex items-center gap-1.5 mt-0.5"
                                                >
                                                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                    {post.user.phone || '+880 1705 123456'}
                                                </a>
                                            </div>
                                            <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                                                <span className="text-slate-400 block text-[10px] font-bold uppercase">Email Address</span>
                                                <strong className="text-slate-800 font-bold mt-0.5 block truncate">{post.user.email}</strong>
                                            </div>
                                            <div className="bg-white/90 p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                                                <span className="text-slate-400 block text-[10px] font-bold uppercase">Factory Address</span>
                                                <strong className="text-slate-800 font-bold mt-0.5 block">{post.address || post.district}</strong>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 text-center space-y-3 relative overflow-hidden shadow-sm">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-base font-bold">Contact & Tech Pack are Protected</h4>
                                        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                                            Direct phone numbers, WhatsApp links, and garment measurement sheets are available to registered and subscribed members.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setAuthModalOpen(true)}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition"
                                        >
                                            {auth.user ? 'Upgrade Subscription (50 Tk/mo)' : 'Log In or Register to Unlock'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION: Bidding Activity & Quotations Stream */}
                        <div id="bids-section" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-blue-600" />
                                            Subcontract Bidding Activity
                                        </h2>
                                        <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                                            {bidsCount} {bidsCount === 1 ? 'Quotation' : 'Quotations'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {isOwner 
                                            ? 'Manage and compare all offers submitted by factories for this order.'
                                            : 'Live market quotation board and capacity availability for this subcontract.'}
                                    </p>
                                </div>

                                {isOwner && bidsCount > 0 && (
                                    <Link
                                        href={route('quotations.compare', post.id)}
                                        className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-xs transition border border-blue-200"
                                    >
                                        <BarChart3 className="w-3.5 h-3.5" />
                                        Side-by-Side Matrix
                                    </Link>
                                )}
                            </div>

                            {/* Awarded Banner if a bid is accepted */}
                            {hasAcceptedQuotation && (
                                <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-emerald-950">
                                                Subcontract Order Awarded to {acceptedQuotation.bidder_factory?.business_name || acceptedQuotation.bidder_user?.name}
                                            </h3>
                                            <p className="text-[11px] text-emerald-700">
                                                Quotation accepted at ৳{acceptedQuotation.offered_unit_price}/{post.unit}. Other bids cannot be accepted unless this decision is reverted.
                                            </p>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateQuotationStatus(acceptedQuotation.id, 'pending')}
                                            disabled={statusProcessingId === acceptedQuotation.id}
                                            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-300 hover:bg-emerald-100/50 px-3.5 py-1.5 rounded-xl transition shadow-xs shrink-0 disabled:opacity-50"
                                        >
                                            Revert Decision
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Market Range Pills */}
                            {bidsCount > 0 && (
                                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Lowest Rate</span>
                                        <span className="font-extrabold text-sm text-emerald-600">৳ {lowestOffer}</span>
                                        <span className="text-[10px] text-slate-400 block">/{post.unit}</span>
                                    </div>
                                    <div className="border-x border-slate-200">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fastest Lead</span>
                                        <span className="font-extrabold text-sm text-slate-800">{fastestLeadDays} Days</span>
                                        <span className="text-[10px] text-slate-400 block">turnaround</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Average Rate</span>
                                        <span className="font-extrabold text-sm text-indigo-600">৳ {avgOffer}</span>
                                        <span className="text-[10px] text-slate-400 block">/{post.unit}</span>
                                    </div>
                                </div>
                            )}

                            {/* Quotations List */}
                            {quotations.length === 0 ? (
                                <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                                    <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                                    <h4 className="text-sm font-bold text-slate-700">No Quotations Submitted Yet</h4>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        {isOwner
                                            ? 'Your order is currently live on the feed. Factories will submit rate bids and lead times soon.'
                                            : 'Be the first factory to submit a quotation and win this subcontract order!'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {quotations.map((q) => {
                                        const isMyBid = q.bidder_user_id === auth.user?.id;
                                        return (
                                            <div 
                                                key={q.id}
                                                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                                                    q.status === 'accepted'
                                                        ? 'bg-emerald-50/50 border-emerald-200 ring-1 ring-emerald-300'
                                                        : isMyBid
                                                        ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-300'
                                                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center ${
                                                            q.status === 'accepted' 
                                                                ? 'bg-emerald-600 text-white' 
                                                                : 'bg-slate-800 text-white'
                                                        }`}>
                                                            {q.bidder_factory?.business_name?.charAt(0) || q.bidder_user?.name?.charAt(0) || 'F'}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <h4 className="font-bold text-sm text-slate-900">
                                                                    {isOwner || isMyBid
                                                                        ? (q.bidder_factory?.business_name || q.bidder_user?.name)
                                                                        : `${q.bidder_factory?.district || 'Industrial'} Verified Factory`}
                                                                </h4>
                                                                {q.bidder_factory?.is_verified && (
                                                                    <span title="Verified Factory">
                                                                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                                                    </span>
                                                                )}
                                                                {isMyBid && (
                                                                    <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                                                        Your Bid
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500">
                                                                {isOwner && q.bidder_user?.customer_id ? `ID: ${q.bidder_user.customer_id} • ` : ''}
                                                                {q.bidder_factory?.district || 'Gazipur'}
                                                                {q.bidder_factory?.total_lines ? ` • ${q.bidder_factory.total_lines} Lines` : ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div>
                                                        {q.status === 'accepted' ? (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                Accepted Order
                                                            </span>
                                                        ) : q.status === 'rejected' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                <X className="w-3 h-3 text-rose-500" />
                                                                Declined
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                                <Clock className="w-3 h-3 text-amber-500" />
                                                                Pending Review
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Bid Financial Figures */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-100 mt-4 text-xs">
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Offered Rate</span>
                                                        <span className="font-extrabold text-sm text-emerald-600">
                                                            ৳ {q.offered_unit_price}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">/{post.unit}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Value</span>
                                                        <span className="font-bold text-sm text-slate-900">
                                                            ৳ {q.offered_total_cost ? Number(q.offered_total_cost).toLocaleString() : 'Calculated'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Lead Time</span>
                                                        <span className="font-bold text-sm text-slate-800 flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {q.offered_lead_days} Days
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Daily Output</span>
                                                        <span className="font-bold text-sm text-slate-800">
                                                            ~{Math.ceil(post.target_quantity / (q.offered_lead_days || 1)).toLocaleString()} {post.unit}/d
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Remarks */}
                                                {(isOwner || isMyBid) && q.note && (
                                                    <div className="mt-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 italic">
                                                        "{q.note}"
                                                    </div>
                                                )}

                                                {/* Action Bar for Post Owner */}
                                                {isOwner && (
                                                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                                        <div className="text-[11px] text-slate-500">
                                                            {q.bidder_user?.phone && q.status === 'accepted' && (
                                                                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                                                    <PhoneCall className="w-3.5 h-3.5" />
                                                                    Direct Contact: {q.bidder_user.phone}
                                                                </span>
                                                            )}
                                                            {q.status !== 'accepted' && hasAcceptedQuotation && (
                                                                <span className="text-slate-400 font-medium italic">
                                                                    Order awarded to another factory
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="inline-flex items-center gap-2">
                                                            {q.status === 'accepted' ? (
                                                                <>
                                                                    {q.bidder_user?.phone && (
                                                                        <a
                                                                            href={`tel:${q.bidder_user.phone}`}
                                                                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs"
                                                                        >
                                                                            <PhoneCall className="w-3.5 h-3.5" />
                                                                            Call Factory
                                                                        </a>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdateQuotationStatus(q.id, 'pending')}
                                                                        disabled={statusProcessingId === q.id}
                                                                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 transition disabled:opacity-50"
                                                                    >
                                                                        Revert to Pending
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {/* ONLY show Accept Bid if NO bid has been accepted yet! */}
                                                                    {!hasAcceptedQuotation ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleUpdateQuotationStatus(q.id, 'accepted')}
                                                                            disabled={statusProcessingId === q.id}
                                                                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-sm transition disabled:opacity-50"
                                                                        >
                                                                            <Check className="w-3.5 h-3.5" />
                                                                            Accept Bid
                                                                        </button>
                                                                    ) : null}
                                                                    {q.status !== 'rejected' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleUpdateQuotationStatus(q.id, 'rejected')}
                                                                            disabled={statusProcessingId === q.id}
                                                                            className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-medium px-3 py-1.5 rounded-lg text-xs transition disabled:opacity-50"
                                                                        >
                                                                            Decline
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Dynamic Bidding Experience */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 self-start">
                        {/* CASE 1: Current User is Post Owner */}
                        {isOwner ? (
                            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-blue-600" />
                                        Order Quotation Hub
                                    </h3>
                                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                                        {bidsCount} Bids
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500 leading-relaxed">
                                    You created this subcontract posting. Factories across Bangladesh are submitting rates to execute your order.
                                </p>

                                {hasAcceptedQuotation ? (
                                    <div className="space-y-3">
                                        <div className="bg-emerald-50 border border-emerald-200/90 p-4 rounded-xl space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    Contract Awarded
                                                </span>
                                                <span className="font-extrabold text-sm text-emerald-700">
                                                    ৳ {acceptedQuotation.offered_unit_price}/{post.unit}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900">
                                                    {acceptedQuotation.bidder_factory?.business_name || acceptedQuotation.bidder_user?.name}
                                                </h4>
                                                <p className="text-[11px] text-slate-600 mt-0.5">
                                                    Total Cost: ৳{acceptedQuotation.offered_total_cost ? Number(acceptedQuotation.offered_total_cost).toLocaleString() : 'Calculated'} • {acceptedQuotation.offered_lead_days} Days Lead
                                                </p>
                                            </div>
                                            {acceptedQuotation.bidder_user?.phone && (
                                                <a
                                                    href={`tel:${acceptedQuotation.bidder_user.phone}`}
                                                    className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition shadow-xs mt-1"
                                                >
                                                    <PhoneCall className="w-3.5 h-3.5" />
                                                    Call Winning Factory ({acceptedQuotation.bidder_user.phone})
                                                </a>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleUpdateQuotationStatus(acceptedQuotation.id, 'pending')}
                                            disabled={statusProcessingId === acceptedQuotation.id}
                                            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
                                        >
                                            Revert Decision to Open Bidding
                                        </button>

                                        <Link
                                            href={route('quotations.compare', post.id)}
                                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
                                        >
                                            <BarChart3 className="w-4 h-4" />
                                            Open Side-by-Side Matrix
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                ) : bidsCount > 0 ? (
                                    <div className="space-y-3">
                                        <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-emerald-800">Best Offered Rate:</span>
                                                <strong className="text-sm font-black text-emerald-700">৳ {lowestOffer} /{post.unit}</strong>
                                            </div>
                                            {post.target_rate && lowestOffer && lowestOffer < Number(post.target_rate) && (
                                                <p className="text-[11px] text-emerald-600 font-medium">
                                                    💡 Potential savings of ৳ {Math.round((Number(post.target_rate) - lowestOffer) * post.target_quantity).toLocaleString()} BDT
                                                </p>
                                            )}
                                        </div>

                                        <Link
                                            href={route('quotations.compare', post.id)}
                                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
                                        >
                                            <BarChart3 className="w-4 h-4" />
                                            Open Side-by-Side Matrix
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>

                                        <a
                                            href="#bids-section"
                                            className="block text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1"
                                        >
                                            Review {bidsCount} Offers Below ↓
                                        </a>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-500 space-y-2 border border-slate-100">
                                        <Clock className="w-5 h-5 text-slate-400 mx-auto" />
                                        <p>No quotations yet. We will notify you when verified factories submit bids.</p>
                                    </div>
                                )}
                            </div>
                        ) : myQuotation && !isEditingBid ? (
                            /* CASE 2: User has ALREADY submitted a quotation (Display mode) */
                            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-blue-600" />
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Your Submitted Bid
                                        </h3>
                                    </div>

                                    {myQuotation.status === 'accepted' ? (
                                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                                            <Check className="w-3 h-3 text-emerald-600" />
                                            Accepted
                                        </span>
                                    ) : myQuotation.status === 'rejected' ? (
                                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                            <X className="w-3 h-3 text-rose-600" />
                                            Declined
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                            <Clock className="w-3 h-3 text-amber-600" />
                                            Pending
                                        </span>
                                    )}
                                </div>

                                {/* Banner for accepted or awarded to another */}
                                {myQuotation.status === 'accepted' ? (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-medium space-y-1">
                                        <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            Quotation Accepted by Buyer!
                                        </div>
                                        <p className="text-[11px] text-emerald-700">
                                            The buyer will contact your factory shortly to issue the subcontract agreement and begin sampling.
                                        </p>
                                    </div>
                                ) : hasAcceptedQuotation ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
                                        <div className="font-bold flex items-center gap-1.5 text-amber-900">
                                            <Clock className="w-4 h-4 text-amber-600" />
                                            Buyer Awarded Another Factory
                                        </div>
                                        <p className="text-[11px] text-amber-700">
                                            The buyer has currently accepted a quotation from another plant. Your quotation remains saved on file in case the buyer reverts their decision.
                                        </p>
                                    </div>
                                ) : null}

                                {/* Key Offered Metrics */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Your Unit Rate</span>
                                        <span className="text-base font-black text-emerald-600">
                                            ৳ {myQuotation.offered_unit_price}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block">per {post.unit}</span>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Order Cost</span>
                                        <span className="text-base font-black text-slate-900">
                                            ৳ {myQuotation.offered_total_cost ? Number(myQuotation.offered_total_cost).toLocaleString() : 'Calculated'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block">estimated</span>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Committed Lead</span>
                                        <span className="text-base font-bold text-slate-800">
                                            {myQuotation.offered_lead_days} Days
                                        </span>
                                        <span className="text-[10px] text-slate-400 block">to deliver</span>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Daily Output</span>
                                        <span className="text-base font-bold text-slate-800">
                                            ~{Math.ceil(post.target_quantity / (myQuotation.offered_lead_days || 1)).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block">{post.unit}/day</span>
                                    </div>
                                </div>

                                {myQuotation.note && (
                                    <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
                                        <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Your Capacity Commitment:</span>
                                        "{myQuotation.note}"
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleStartEdit}
                                        className="w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-blue-200"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Revise / Adjust Your Quotation
                                    </button>

                                    {showWithdrawConfirm ? (
                                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs space-y-2 text-rose-800">
                                            <p className="font-semibold">Confirm withdrawing your quotation?</p>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleWithdrawBid}
                                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                                                >
                                                    Yes, Withdraw
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowWithdrawConfirm(false)}
                                                    className="bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-slate-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowWithdrawConfirm(true)}
                                            className="w-full text-center text-xs text-slate-400 hover:text-rose-600 font-medium py-1 transition flex items-center justify-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Withdraw Quotation
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* CASE 3: User submitting a new quotation OR editing */
                            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
                                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                            {isEditingBid ? 'Revise Your Quotation' : 'Submit Quotation / Bid'}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Offer your factory's rate & delivery commitment.
                                        </p>
                                    </div>
                                    {isEditingBid && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                {hasAcceptedQuotation && !isEditingBid ? (
                                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 text-center space-y-2.5">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-800">Order Awarded to Another Factory</h4>
                                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                                            The buyer has already accepted a quotation for this subcontract order. New bids are currently closed unless the order is reopened.
                                        </p>
                                    </div>
                                ) : userCanViewFullDetails ? (
                                    <form onSubmit={handleBidSubmit} className="space-y-4 text-xs">
                                        {/* Unit Price with Quick Match Presets */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="font-bold text-slate-700">
                                                    Offered Unit Rate (BDT / {post.unit}) <span className="text-rose-500">*</span>
                                                </label>
                                                {post.target_rate && (
                                                    <span className="text-[10px] text-slate-400">
                                                        Target: <strong>৳{post.target_rate}</strong>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                                                    ৳
                                                </span>
                                                <input
                                                    type="number"
                                                    step="0.05"
                                                    value={data.offered_unit_price}
                                                    onChange={(e) => setData('offered_unit_price', e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full pl-8 pr-16 text-sm font-bold text-slate-900 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                                                    required
                                                />
                                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                                                    /{post.unit}
                                                </span>
                                            </div>

                                            {/* Quick Rate Shortcuts */}
                                            {targetRateNum > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('offered_unit_price', String(targetRateNum))}
                                                        className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition"
                                                    >
                                                        🎯 Match (৳{targetRateNum})
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('offered_unit_price', String(Number(targetRateNum * 0.95).toFixed(1)))}
                                                        className="text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md transition border border-emerald-200/60"
                                                    >
                                                        🔥 5% Below (৳{Number(targetRateNum * 0.95).toFixed(1)})
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setData('offered_unit_price', String(Number(targetRateNum * 0.90).toFixed(1)))}
                                                        className="text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md transition border border-emerald-200/60"
                                                    >
                                                        ⚡ 10% Below
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lead Time with Quick Presets */}
                                        <div className="space-y-1.5">
                                            <label className="font-bold text-slate-700 flex justify-between items-center">
                                                <span>Lead Time (Days to Complete) <span className="text-rose-500">*</span></span>
                                                <span className="text-[10px] text-slate-400 font-normal">
                                                    Deadline: {formatDeadline(post.deadline)}
                                                </span>
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={data.offered_lead_days}
                                                    onChange={(e) => setData('offered_lead_days', parseInt(e.target.value) || 1)}
                                                    className="w-full pr-16 text-sm font-bold text-slate-900 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                                                    required
                                                />
                                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
                                                    Days
                                                </span>
                                            </div>

                                            {/* Quick Lead Days Chips */}
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {[7, 10, 14, 21, 30].map((days) => (
                                                    <button
                                                        key={days}
                                                        type="button"
                                                        onClick={() => setData('offered_lead_days', days)}
                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition ${
                                                            data.offered_lead_days === days
                                                                ? 'bg-blue-600 text-white shadow-xs'
                                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                        }`}
                                                    >
                                                        {days} Days
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Live Smart Quotation Estimator Card */}
                                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-xl space-y-2 shadow-sm">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-300 font-medium">Projected Total Value:</span>
                                                <span className="font-black text-emerald-400 text-sm">
                                                    ৳ {totalOrderCost.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
                                                <span className="text-slate-300 font-medium">Required Daily Pace:</span>
                                                <span className="font-bold text-slate-100">
                                                    {dailyCapacityRequired.toLocaleString()} {post.unit}/day
                                                </span>
                                            </div>

                                            {/* Benchmark Indicator */}
                                            {rateDiff !== null && (
                                                <div className="border-t border-white/10 pt-2 text-[11px]">
                                                    {rateDiff < 0 ? (
                                                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                                            <Sparkles className="w-3.5 h-3.5" />
                                                            Saves buyer ৳{Math.abs(rateDiff).toFixed(2)}/unit (Competitive advantage)
                                                        </span>
                                                    ) : rateDiff === 0 ? (
                                                        <span className="text-blue-300 font-semibold flex items-center gap-1">
                                                            <Check className="w-3.5 h-3.5" />
                                                            Matches buyer's target price exactly
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-300 font-medium">
                                                            +৳{rateDiff.toFixed(2)}/unit premium over target
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Remarks & Capacity Commitment */}
                                        <div className="space-y-1.5">
                                            <label className="block font-bold text-slate-700">
                                                Remarks & Capacity Commitment
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={data.note}
                                                onChange={(e) => setData('note', e.target.value)}
                                                placeholder="e.g. Can allocate 3 lines starting next Monday..."
                                                className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                                            />

                                            {/* Quick Commitment Insert Chips */}
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {quickNoteTags.map((tag) => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => handleAppendNote(tag)}
                                                        className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2 py-0.5 rounded transition"
                                                    >
                                                        + {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Submit button */}
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition disabled:opacity-50"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            {processing 
                                                ? 'Submitting...' 
                                                : isEditingBid 
                                                ? 'Update My Quotation' 
                                                : 'Send Quotation to Factory'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800">Bidding Access Restricted</h4>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Only verified and subscribed factories can place official subcontract bids.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAuthModalOpen(true)}
                                            className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-xs transition"
                                        >
                                            {auth.user ? 'Upgrade Subscription (50 Tk/mo)' : 'Log In or Register to Bid'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AuthGateModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                postTitle={post.title}
                isLoggedIn={!!auth.user}
            />
        </ShilposetuLayout>
    );
}
