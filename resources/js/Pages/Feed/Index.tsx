import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import AuthGateModal from '@/Components/AuthGateModal';
import CreatePostModal from '@/Components/CreatePostModal';
import { formatDeadline } from '@/utils/date';
import {
    PlusCircle,
    Search,
    Filter,
    MapPin,
    Calendar,
    Lock,
    Phone,
    Layers,
    CheckCircle2,
    ShieldCheck,
    Clock,
    Building2,
    AlertTriangle,
    Tag,
    ChevronRight,
    ArrowUpRight,
    MessageSquare,
    Eye,
    TrendingUp,
    Sparkles,
    Check
} from 'lucide-react';

interface SubcontractPostItem {
    id: number;
    title: string;
    post_type: 'DEMAND' | 'SUPPLY';
    category: string;
    target_quantity: number;
    unit: string;
    target_rate: string | null;
    rate_negotiable: boolean;
    deadline: string | null;
    district: string;
    description: string;
    specs: Record<string, any> | null;
    is_urgent: boolean;
    views_count: number;
    created_at: string;
    user: {
        id: number;
        name: string;
        customer_id: string;
        phone: string | null;
    };
    factory?: {
        id: number;
        business_name: string;
        district: string;
        total_lines: number;
        is_verified: boolean;
        rating: number;
    } | null;
    quotations?: any[];
}

interface FeedIndexProps {
    posts: {
        data: SubcontractPostItem[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        category: string;
        district: string;
        search: string;
    };
    districts: string[];
    stats: {
        total_vendors: number;
        verified_vendors: number;
        active_orders: number;
        total_lines: number;
    };
    userCanViewFullDetails: boolean;
    auth: {
        user: any;
    };
}

const CATEGORIES = [
    { id: 'all', label: 'All Categories' },
    { id: 'sewing_production', label: 'Sewing (CMT)' },
    { id: 'knitting', label: 'Knitting' },
    { id: 'washing', label: 'Washing Plant' },
    { id: 'fabric_dyeing', label: 'Fabric Dyeing' },
    { id: 'yarn_dyeing', label: 'Yarn Dyeing' },
    { id: 'print', label: 'Screen / Print' },
    { id: 'embroidery', label: 'Embroidery' },
];

export default function FeedIndex({
    posts,
    filters,
    districts,
    stats,
    userCanViewFullDetails,
    auth
}: FeedIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [activeGateTitle, setActiveGateTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleFilterChange = (key: string, value: string) => {
        router.get(route('feed.index'), {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', searchTerm);
    };

    const handleGatedAction = (title: string, postId: number) => {
        if (!auth.user || !userCanViewFullDetails) {
            setActiveGateTitle(title);
            setAuthModalOpen(true);
        } else {
            router.get(route('feed.show', postId));
        }
    };

    return (
        <ShilposetuLayout onCreatePostClick={() => setCreateModalOpen(true)}>
            <Head title="Shilposetu Subcontract Feed | Digital RMG Capacity Exchange" />

            {/* Industrial Hero Banner (matching Page 1 Screen 1 & Page 2) */}
            <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-12 px-4 border-b border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                <span>Connecting Extra Orders with Verified Factories • Smart Subcontracting</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                                Bangladesh's Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-300">Subcontracting</span> & Extra Orders Board
                            </h1>
                            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                                Have extra orders beyond factory capacity? Post your demand for Knitting, Dyeing, Washing, or Sewing and connect directly with verified factories across the country.
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    onClick={() => setCreateModalOpen(true)}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-blue-500/25 transition transform active:scale-95"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Post Subcontract
                                </button>
                                <Link
                                    href={route('vendors.index')}
                                    className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium px-4 py-2.5 rounded-xl text-sm border border-slate-700 transition"
                                >
                                    <Building2 className="w-4 h-4 text-emerald-400" />
                                    Browse Factory Directory
                                </Link>
                            </div>
                        </div>

                        {/* Live Industry Metrics Grid (matching Page 2 stats) */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60">
                                <p className="text-xs text-slate-400 font-medium">Registered Vendors</p>
                                <p className="text-2xl font-black text-white mt-1">10,00,000+</p>
                                <p className="text-[11px] text-emerald-400 mt-0.5">Apparel & Textiles</p>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60">
                                <p className="text-xs text-slate-400 font-medium">Factories & Plants</p>
                                <p className="text-2xl font-black text-emerald-400 mt-1">50,000+</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Across Bangladesh</p>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60">
                                <p className="text-xs text-slate-400 font-medium">Active Productions</p>
                                <p className="text-2xl font-black text-blue-400 mt-1">1,450+</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Tshirt, Polo, Denim</p>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/60">
                                <p className="text-xs text-slate-400 font-medium">SaaS Membership</p>
                                <p className="text-2xl font-black text-amber-400 mt-1">50 ৳<span className="text-xs font-normal text-slate-400">/mo</span></p>
                                <p className="text-[11px] text-amber-300 mt-0.5">+ 100 ৳ Registration</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter and Control Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
                    {/* Search & Select Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <form onSubmit={handleSearchSubmit} className="md:col-span-8 relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by order type, garment, mill name, or district..."
                                className="w-full pl-10 pr-24 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                            >
                                Search
                            </button>
                        </form>

                        {/* District Filter */}
                        <div className="md:col-span-4">
                            <select
                                value={filters.district}
                                onChange={(e) => handleFilterChange('district', e.target.value)}
                                className="w-full text-sm py-2.5 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="all">All Industrial Districts</option>
                                <option value="Gazipur">Gazipur (গাজীপুর)</option>
                                <option value="Ashulia">Ashulia / Savar (আশুলিয়া)</option>
                                <option value="Tongi">Tongi (টঙ্গী)</option>
                                <option value="Narayanganj">Narayanganj (নারায়ণগঞ্জ)</option>
                                <option value="Tangail">Tangail / Mirzapur (টাঙ্গাইল)</option>
                                <option value="Dhaka">Dhaka (ঢাকা)</option>
                                <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                            </select>
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleFilterChange('category', cat.id)}
                                className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition ${filters.category === cat.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subcontract Post Feed (Like as Facebook) */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left & Middle Column: The Main Feed */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-600" />
                                Subcontract Live Feed ({posts.total} Extra Orders)
                            </h2>
                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 w-fit">
                                Have Extra Orders (Need Subcontract)
                            </span>
                        </div>

                        {posts?.data?.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-slate-700">No Extra Orders Found</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                    No subcontract orders match your selected filter criteria. Be the first to post extra order requirements!
                                </p>
                                <button
                                    onClick={() => setCreateModalOpen(true)}
                                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Create Subcontract Post
                                </button>
                            </div>
                        ) : (
                            posts?.data?.map((post) => (
                                <article
                                    key={post.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300/90 transition-all duration-200 overflow-hidden group"
                                >
                                    {/* Card Header (Author, Factory, Verification & Urgency) */}
                                    <div className="px-4 py-2.5 sm:px-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 text-white font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs shrink-0">
                                                {post.factory?.business_name ? post.factory.business_name.charAt(0) : post.user.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight truncate group-hover:text-blue-600 transition-colors">
                                                        {post.factory?.business_name || post.user.name}
                                                    </h3>
                                                    {post.factory?.is_verified && (
                                                        <span title="Verified Bangladesh Factory" className="shrink-0">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                                                    <span className="flex items-center gap-0.5 text-slate-500">
                                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                        {post.district}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-mono font-semibold text-slate-600">ID: {post.user.customer_id || `S${post.user.id}`}</span>
                                                    <span>•</span>
                                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Header Badges */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {post.is_urgent && (
                                                <span className="bg-rose-50 text-rose-700 border border-rose-200/80 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 animate-pulse">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    URGENT
                                                </span>
                                            )}
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                                Need Subcontract
                                            </span>
                                        </div>
                                    </div>

                                    {/* Post Body */}
                                    <div className="px-4 py-3 sm:px-5 space-y-2.5">
                                        {/* Category & Order Title Row */}
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md shrink-0">
                                                {post.category.replace('_', ' ')}
                                            </span>
                                            <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                {post.title}
                                            </h4>
                                        </div>

                                        {/* Compact Key Order Metrics Strip */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Qty:</span>
                                                <span className="font-black text-slate-900 text-xs sm:text-sm">
                                                    {post.target_quantity.toLocaleString()} {post.unit}
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate:</span>
                                                <span className="font-black text-emerald-600 text-xs sm:text-sm">
                                                    {post.target_rate ? `${post.target_rate} ৳/${post.unit}` : 'Negotiable'}
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-1.5 min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Area:</span>
                                                <span className="font-semibold text-slate-700 truncate text-xs">
                                                    {post.district}
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-1.5 min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadline:</span>
                                                <span className="font-semibold text-slate-700 text-xs flex items-center gap-1 truncate">
                                                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                                    {formatDeadline(post.deadline)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Manufacturing Specs (Rendered as Compact Chips instead of huge bullet box) */}
                                        {post.specs && (post.specs.machine_type || post.specs.no_of_lines || post.specs.total_capacity || post.specs.item_type || post.specs.process_capability) && (
                                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5 flex items-center gap-1">
                                                    <Layers className="w-3 h-3 text-indigo-500" />
                                                    Specs:
                                                </span>
                                                {post.specs.machine_type && (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/70">
                                                        <span className="text-slate-400">Machine:</span>
                                                        <strong className="font-semibold text-slate-800">{post.specs.machine_type}</strong>
                                                        {post.specs.machine_qty ? <span className="text-indigo-600 font-medium">({post.specs.machine_qty} Sets)</span> : null}
                                                    </span>
                                                )}
                                                {post.specs.no_of_lines && (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/70">
                                                        <span className="text-slate-400">Lines:</span>
                                                        <strong className="font-semibold text-slate-800">{post.specs.no_of_lines}</strong>
                                                        {post.specs.per_line_capacity ? <span className="text-blue-600 font-medium">({post.specs.per_line_capacity}/line)</span> : null}
                                                    </span>
                                                )}
                                                {post.specs.total_capacity && (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/70">
                                                        <span className="text-slate-400">Capacity:</span>
                                                        <strong className="font-semibold text-slate-800">{post.specs.total_capacity}</strong>
                                                    </span>
                                                )}
                                                {post.specs.item_type && (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/70">
                                                        <span className="text-slate-400">Item:</span>
                                                        <strong className="font-semibold text-slate-800">{post.specs.item_type}</strong>
                                                    </span>
                                                )}
                                                {post.specs.process_capability && (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/70">
                                                        <strong className="font-semibold text-slate-800">{post.specs.process_capability}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {post.description && (
                                            <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                                                {post.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Footer / Interaction Bar */}
                                    <div className="px-4 py-2.5 sm:px-5 bg-slate-50/60 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 text-xs text-slate-400">
                                            <span className="flex items-center gap-1 font-medium text-slate-600">
                                                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                                                <strong>{post.quotations?.length || 0}</strong> Bids
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                {post.views_count} Views
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Gated Direct Call / WhatsApp Button */}
                                            <button
                                                onClick={() => handleGatedAction(post.title, post.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${userCanViewFullDetails
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                                                    }`}
                                            >
                                                {userCanViewFullDetails ? (
                                                    <>
                                                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                        {post.user.phone || 'Call Factory'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                                                        Call / WhatsApp
                                                    </>
                                                )}
                                            </button>

                                            {/* Details & Quotation Action */}
                                            <button
                                                onClick={() => handleGatedAction(post.title, post.id)}
                                                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 hover:shadow transition transform active:scale-95"
                                            >
                                                <span>{userCanViewFullDetails ? 'View Tech Pack & Bid' : 'View Details & Bid'}</span>
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="flex items-center justify-between pt-4 text-xs">
                                <span className="text-slate-500">
                                    Page {posts.current_page} of {posts.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {posts.prev_page_url && (
                                        <Link
                                            href={posts.prev_page_url}
                                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {posts.next_page_url && (
                                        <Link
                                            href={posts.next_page_url}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                        >
                                            Next Page
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar: Quick Factory Access & Membership Card */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Membership SaaS Card (matching Page 7 specs) */}
                        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                            <div className="relative z-10 space-y-3">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                    SaaS Membership Model
                                </span>
                                <h3 className="text-lg font-bold leading-tight">
                                    Connect Demand with Factory Capacity
                                </h3>
                                <p className="text-xs text-slate-300">
                                    Unlock direct phone numbers of 10 Lakh+ registered factories and access measurement tech-packs.
                                </p>

                                <div className="bg-white/10 rounded-xl p-3 text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-300">Registration Fee:</span>
                                        <span className="font-bold text-amber-300">100 BDT (One-Time)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-300">Monthly Access:</span>
                                        <span className="font-bold text-emerald-400">50 BDT / Month</span>
                                    </div>
                                </div>

                                <Link
                                    href={route('subscription.index')}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
                                >
                                    Activate SaaS Membership
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* Verified Garment Factory Directory Teaser (matching Page 2) */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Featured Industrial Units
                                </h3>
                                <Link href={route('vendors.index')} className="text-xs text-blue-600 font-semibold hover:underline">
                                    View All
                                </Link>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-slate-900">Artistic Design Ltd.</p>
                                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                            34 Lines
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Ashulia, Dhaka • Composite</p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-slate-900">Modern Washing Plant</p>
                                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                                            Over Dyeing
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Nishat Nagar, Tongi, Gazipur</p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-slate-900">Ha-Meem Denim Mills Ltd.</p>
                                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                            45 Lines
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Sripur, Maona, Gazipur</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Gate Modal (Freemium Paywall) */}
            <AuthGateModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                postTitle={activeGateTitle}
                isLoggedIn={!!auth.user}
            />

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                user={auth.user}
                onNeedAuth={() => {
                    setActiveGateTitle('Create Subcontract Order');
                    setAuthModalOpen(true);
                }}
            />
        </ShilposetuLayout>
    );
}
