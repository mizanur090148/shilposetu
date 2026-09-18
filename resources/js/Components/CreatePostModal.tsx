import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Sparkles, AlertCircle, Upload, CheckCircle2, ChevronRight, Layers, Factory } from 'lucide-react';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: any;
    onNeedAuth: () => void;
}

export default function CreatePostModal({ isOpen, onClose, user, onNeedAuth }: CreatePostModalProps) {
    if (!isOpen) return null;

    if (!user) {
        onClose();
        onNeedAuth();
        return null;
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        post_type: 'DEMAND', // DEMAND (Giving Subcontract) or SUPPLY (Taking Subcontract)
        category: 'sewing_production',
        title: '',
        target_quantity: 10000,
        unit: 'pcs',
        target_rate: '',
        rate_negotiable: true,
        deadline: '',
        district: 'Gazipur',
        address: '',
        description: '',
        is_urgent: false,
        specs: {
            // Sewing defaults
            no_of_lines: 4,
            per_line_capacity: 1000,
            total_capacity_day: 4000,
            item_type: 'T-Shirt / Polo Shirt',
            // Knitting defaults
            machine_type: 'Circular Knit Single Jersey',
            machine_qty: 10,
            capacity_per_machine: 300,
            total_capacity: 3000,
            // Dyeing & Washing
            process_type: 'Dry Process & Over Dyeing',
            batch_capacity: 2500,
            unit: 'Pcs',
        } as Record<string, any>,
    });

    const handleCategoryChange = (newCategory: string) => {
        let updatedUnit = 'pcs';
        let updatedSpecs = { ...data.specs };

        if (newCategory === 'knitting' || newCategory === 'yarn_dyeing') {
            updatedUnit = 'kg';
        } else if (newCategory === 'print' && data.category === 'fabric_dyeing') {
            updatedUnit = 'yards';
        } else {
            updatedUnit = 'pcs';
        }

        setData((prev) => ({
            ...prev,
            category: newCategory,
            unit: updatedUnit,
            specs: updatedSpecs,
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
                        {/* <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                            শিল্পসেতু Subcontract Board
                        </span> */}
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

                    {/* Garment Sector / Category Selector */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                            Manufacturing Category (ক্যাটাগরি)
                        </label>
                        <select
                            value={data.category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full text-sm font-medium border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="sewing_production">Sewing Production (CMT / Assembly)</option>
                            <option value="knitting">Knitting (Circular / Flat Knit)</option>
                            <option value="fabric_dyeing">Fabric Dyeing & Finishing</option>
                            <option value="yarn_dyeing">Yarn Dyeing</option>
                            <option value="washing">Washing Plant (Dry Process & Over Dyeing)</option>
                            <option value="print">Screen & Rotary Printing</option>
                            <option value="embroidery">Embroidery</option>
                            <option value="finishing">Finishing, Iron & Poly Packing</option>
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
                            <span>Category Specifications ({data.category.replace('_', ' ')})</span>
                        </div>

                        {/* CASE 1: KNITTING */}
                        {data.category === 'knitting' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">Machine Type</label>
                                    <input
                                        type="text"
                                        value={data.specs.machine_type || ''}
                                        onChange={(e) => handleSpecChange('machine_type', e.target.value)}
                                        placeholder="e.g. Circular Knit Single Jersey 24G/28G"
                                        className="w-full text-xs border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">Machine Qty</label>
                                    <input
                                        type="number"
                                        value={data.specs.machine_qty || ''}
                                        onChange={(e) => {
                                            const qty = parseInt(e.target.value) || 0;
                                            const cap = data.specs.capacity_per_machine || 300;
                                            handleSpecChange('machine_qty', qty);
                                            handleSpecChange('total_capacity', qty * cap);
                                        }}
                                        placeholder="e.g. 10"
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
                                        placeholder="e.g. 300"
                                        className="w-full text-xs border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">Total Capacity (Kg/Day)</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={data.specs.total_capacity ? `${data.specs.total_capacity} Kg/Day` : ''}
                                        className="w-full text-xs bg-slate-100 border-slate-300 rounded-lg font-bold text-slate-700"
                                    />
                                </div>
                            </div>
                        )}

                        {/* CASE 2: SEWING PRODUCTION */}
                        {data.category === 'sewing_production' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">No. of Lines</label>
                                    <input
                                        type="number"
                                        value={data.specs.no_of_lines || ''}
                                        onChange={(e) => {
                                            const lines = parseInt(e.target.value) || 0;
                                            const cap = data.specs.per_line_capacity || 1000;
                                            handleSpecChange('no_of_lines', lines);
                                            handleSpecChange('total_capacity_day', `${lines * cap} Pcs/Day`);
                                        }}
                                        placeholder="e.g. 4 Lines"
                                        className="w-full text-xs border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">Per Line Capacity (Pcs/Day)</label>
                                    <input
                                        type="number"
                                        value={data.specs.per_line_capacity || ''}
                                        onChange={(e) => {
                                            const cap = parseInt(e.target.value) || 0;
                                            const lines = data.specs.no_of_lines || 1;
                                            handleSpecChange('per_line_capacity', cap);
                                            handleSpecChange('total_capacity_day', `${lines * cap} Pcs/Day`);
                                        }}
                                        placeholder="e.g. 1000"
                                        className="w-full text-xs border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">Total Capacity / Day</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={data.specs.total_capacity_day || ''}
                                        className="w-full text-xs bg-slate-100 border-slate-300 rounded-lg font-bold text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">Item Type & SMV</label>
                                    <input
                                        type="text"
                                        value={data.specs.item_type || ''}
                                        onChange={(e) => handleSpecChange('item_type', e.target.value)}
                                        placeholder="e.g. Polo Shirt, SMV: 15"
                                        className="w-full text-xs border-slate-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        )}

                        {/* CASE 3: DYEING / WASHING / PRINT / EMBROIDERY */}
                        {['fabric_dyeing', 'yarn_dyeing', 'print', 'embroidery', 'washing', 'finishing'].includes(data.category) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">Process Capability / Machine Type</label>
                                    <input
                                        type="text"
                                        value={data.specs.process_capability || ''}
                                        onChange={(e) => handleSpecChange('process_capability', e.target.value)}
                                        placeholder="e.g. Dry Process, Over Dyeing, Plastisol"
                                        className="w-full text-xs border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">No. of Machines / Batches</label>
                                    <input
                                        type="number"
                                        value={data.specs.no_of_machine || ''}
                                        onChange={(e) => handleSpecChange('no_of_machine', parseInt(e.target.value) || 0)}
                                        placeholder="e.g. 4 Machines"
                                        className="w-full text-xs border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">Daily Capacity</label>
                                    <input
                                        type="text"
                                        value={data.specs.total_capacity_day || ''}
                                        onChange={(e) => handleSpecChange('total_capacity_day', e.target.value)}
                                        placeholder="e.g. 5,000 Pcs/Day or 3,000 Kg/Day"
                                        className="w-full text-xs border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-600 mb-1">Special Treatments / Certifications</label>
                                    <input
                                        type="text"
                                        value={data.specs.special_note || ''}
                                        onChange={(e) => handleSpecChange('special_note', e.target.value)}
                                        placeholder="e.g. OEKO-TEX, GOTS, Bio-Wash"
                                        className="w-full text-xs border-slate-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
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
