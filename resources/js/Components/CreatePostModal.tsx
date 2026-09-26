import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Sparkles, AlertCircle, Upload, CheckCircle2, ChevronRight, Layers, Factory } from 'lucide-react';
import { KnittingType } from '@/types';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: any;
    onNeedAuth: () => void;
    knittingTypes?: KnittingType[];
}

const DEFAULT_KNITTING_TYPES: Array<{ id: number; name: string; slug: string }> = [
    { id: 1, name: 'Single Jersey', slug: 'single-jersey' },
    { id: 2, name: 'Rib Knit (1x1, 2x2, Flat Knit)', slug: 'rib-knit' },
    { id: 3, name: 'Interlock & Double Jersey', slug: 'interlock' },
    { id: 4, name: 'Fleece (Polar, Brushed, Terry)', slug: 'fleece' },
    { id: 5, name: 'Pique & Lacoste', slug: 'pique-lacoste' },
    { id: 6, name: 'French Terry', slug: 'french-terry' },
    { id: 7, name: 'Flat Knit (Collar & Cuff)', slug: 'flat-knit' },
    { id: 8, name: 'Jacquard & Auto Stripe', slug: 'jacquard-auto-stripe' },
    { id: 9, name: 'Waffle / Thermal Knit', slug: 'waffle-thermal' },
    { id: 10, name: 'Mesh & Eyelet Knit', slug: 'mesh-eyelet' },
];

export default function CreatePostModal({ isOpen, onClose, user, onNeedAuth, knittingTypes = [] }: CreatePostModalProps) {
    if (!isOpen) return null;

    if (!user) {
        onClose();
        onNeedAuth();
        return null;
    }

    const availableTypes = knittingTypes && knittingTypes.length > 0 ? knittingTypes : DEFAULT_KNITTING_TYPES;
    const initialCategory = availableTypes[0]?.slug || 'single-jersey';

    const { data, setData, post, processing, errors, reset } = useForm({
        post_type: 'DEMAND', // DEMAND (Giving Subcontract) or SUPPLY (Taking Subcontract)
        category: initialCategory,
        title: '',
        target_quantity: 5000,
        unit: 'kg',
        target_rate: '',
        rate_negotiable: true,
        deadline: '',
        district: 'Gazipur',
        address: '',
        description: '',
        is_urgent: false,
        specs: {
            machine_type: 'Circular Knitting (24G / 28G)',
            gauge_diameter: '24G / 30"',
            machine_qty: 6,
            capacity_per_machine: 350,
            total_capacity: 2100,
            fabric_gsm: '160 - 200 GSM',
            yarn_count: '30s/1 Combed Cotton',
        } as Record<string, any>,
    });

    const handleCategoryChange = (newCategory: string) => {
        setData((prev) => ({
            ...prev,
            category: newCategory,
        }));
    };

    const handleSpecChange = (key: string, value: any) => {
        setData('specs', {
            ...data.specs,
            [key]: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('feed.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold mt-1">Post Subcontract (Have Extra Orders)</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Default Type: Have Extra Orders (Need Subcontract) */}
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                                Post Purpose
                            </span>
                            <p className="text-xs font-bold text-slate-900">
                                Have Extra Orders (Need Subcontract)
                            </p>
                            <p className="text-[11px] text-slate-500">
                                অতিরিক্ত অর্ডার রয়েছে, অন্য ফ্যাক্টরি খুঁজছি
                            </p>
                        </div>
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                            DEMAND
                        </span>
                    </div>

                    {/* Knitting Category Selector */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                            Knitting Type Category (নিটিং টাইপ ক্যাটাগরি) <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={data.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full text-sm font-semibold border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 bg-white"
                        >
                            {availableTypes.map((kt) => (
                                <option key={kt.id || kt.slug} value={kt.slug}>
                                    {kt.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                            Post Title / Summary <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. 10,000 Pcs Pique Polo Shirt - Urgent Sewing & Finishing Needed"
                            className="w-full text-sm border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                        {errors.title && <p className="text-rose-600 text-xs mt-1">{errors.title}</p>}
                    </div>

                    {/* Quantity, Unit & Target Rate */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                Quantity <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={data.target_quantity}
                                onChange={(e) => setData('target_quantity', parseInt(e.target.value) || 0)}
                                className="w-full text-sm border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                Unit
                            </label>
                            <select
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="pcs">Pieces (Pcs)</option>
                                <option value="kg">Kilograms (Kg)</option>
                                <option value="dozen">Dozen</option>
                                <option value="yards">Yards</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                Target Rate ({data.unit ? `BDT/${data.unit}` : 'BDT'})
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                value={data.target_rate}
                                onChange={(e) => setData('target_rate', e.target.value)}
                                placeholder="Negotiable"
                                className="w-full text-sm border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* DYNAMIC CATEGORY-SPECIFIC FORM FIELDS */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Knitting Specifications ({data.category.replace(/[-_]/g, ' ')})</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="block font-medium text-slate-600 mb-1">Machine Type / Technology</label>
                                <input
                                    type="text"
                                    value={data.specs.machine_type || ''}
                                    onChange={(e) => handleSpecChange('machine_type', e.target.value)}
                                    placeholder="e.g. Circular Knit (Single Jersey / Rib)"
                                    className="w-full text-xs border-slate-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-600 mb-1">Gauge & Diameter</label>
                                <input
                                    type="text"
                                    value={data.specs.gauge_diameter || ''}
                                    onChange={(e) => handleSpecChange('gauge_diameter', e.target.value)}
                                    placeholder="e.g. 24G / 30-inch, 28G / 32-inch"
                                    className="w-full text-xs border-slate-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-600 mb-1">Machine Quantity (Sets)</label>
                                <input
                                    type="number"
                                    value={data.specs.machine_qty || ''}
                                    onChange={(e) => {
                                        const qty = parseInt(e.target.value) || 0;
                                        const cap = data.specs.capacity_per_machine || 350;
                                        handleSpecChange('machine_qty', qty);
                                        handleSpecChange('total_capacity', qty * cap);
                                    }}
                                    placeholder="e.g. 6"
                                    className="w-full text-xs border-slate-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-600 mb-1">Capacity Per Machine (Kg/Day)</label>
                                <input
                                    type="number"
                                    value={data.specs.capacity_per_machine || ''}
                                    onChange={(e) => {
                                        const cap = parseInt(e.target.value) || 0;
                                        const qty = data.specs.machine_qty || 1;
                                        handleSpecChange('capacity_per_machine', cap);
                                        handleSpecChange('total_capacity', qty * cap);
                                    }}
                                    placeholder="e.g. 350"
                                    className="w-full text-xs border-slate-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-600 mb-1">Total Daily Capacity</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={data.specs.total_capacity ? `${data.specs.total_capacity} Kg/Day` : ''}
                                    className="w-full text-xs bg-slate-100 border-slate-300 rounded-lg font-bold text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-600 mb-1">Fabric GSM & Yarn Count</label>
                                <input
                                    type="text"
                                    value={data.specs.fabric_gsm || ''}
                                    onChange={(e) => handleSpecChange('fabric_gsm', e.target.value)}
                                    placeholder="e.g. 160-220 GSM, 30s/1 Cotton"
                                    className="w-full text-xs border-slate-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* District, Deadline, and Urgent Checkbox */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                Industrial District (ফ্যাক্টরি এলাকা) <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.district}
                                onChange={(e) => setData('district', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="Gazipur">Gazipur (গাজীপুর)</option>
                                <option value="Ashulia">Ashulia / Savar (আশুলিয়া / সাভার)</option>
                                <option value="Tongi">Tongi (টঙ্গী)</option>
                                <option value="Narayanganj">Narayanganj (নারায়ণগঞ্জ)</option>
                                <option value="Dhaka">Dhaka (ঢাকা)</option>
                                <option value="Tangail">Tangail / Mirzapur (টাঙ্গাইল)</option>
                                <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                Completion Deadline (শেষ করার তারিখ)
                            </label>
                            <input
                                type="date"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Detailed Description */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                            Order Details & Tech Specifications <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Describe garment specs, fabric GSM, trims, quality AQL standards, and terms..."
                            className="w-full text-sm border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                        {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description}</p>}
                    </div>

                    {/* Urgent Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_urgent"
                            checked={data.is_urgent}
                            onChange={(e) => setData('is_urgent', e.target.checked)}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <label htmlFor="is_urgent" className="text-xs font-semibold text-rose-700 flex items-center gap-1 cursor-pointer">
                            Mark as Urgent Shipment Order
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
                        >
                            {processing ? 'Publishing...' : 'Publish Subcontract Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
