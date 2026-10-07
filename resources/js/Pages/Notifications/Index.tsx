import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import {
    Bell,
    CheckCheck,
    Clock,
    MapPin,
    Package,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Building2,
    Calendar,
    Tag
} from 'lucide-react';

interface NotificationItem {
    id: string;
    type: string;
    data: {
        post_id: number;
        title: string;
        category: string;
        target_quantity: number;
        unit: string;
        district: string;
        target_rate?: number;
        rate_negotiable?: boolean;
        is_urgent?: boolean;
        deadline?: string;
        poster_name?: string;
        match_reason?: string;
        action_url?: string;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationsPageProps {
    notifications: {
        data: NotificationItem[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    unreadCount: number;
}

export default function NotificationsIndex({ notifications, unreadCount }: NotificationsPageProps) {
    const handleMarkAllAsRead = () => {
        router.post(route('notifications.markAllRead'), {}, {
            preserveScroll: true,
        });
    };

    const handleItemClick = (notification: NotificationItem) => {
        if (!notification.read_at) {
            router.post(route('notifications.read', notification.id), {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <ShilposetuLayout>
            <Head title="Notifications - শিল্পসেতু" />

            <div className="py-8 bg-slate-50 min-h-[85vh]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Bell className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                                    <span>Order Alerts & Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                                    আপনার ফ্যাক্টরির সাথে ম্যাচ করা সব সাবকন্ট্রাক্ট কাজের নোটিফিকেশন
                                </p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/60 transition shadow-sm self-start sm:self-auto"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    {notifications.data.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 opacity-60" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800">No new notifications</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                আপনার ফ্যাক্টরির স্পেশালাইজেশনের সাথে ম্যাচ করা নতুন কোনো সাবকন্ট্রাক্ট পোস্ট হলে তা এখানে দেখতে পাবেন।
                            </p>
                            <Link
                                href={route('feed.index')}
                                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-sm"
                            >
                                Browse Subcontract Feed
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {notifications.data.map((notification) => {
                                const d = notification.data;
                                const isUnread = !notification.read_at;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`group relative rounded-2xl p-5 sm:p-6 transition-all duration-200 border ${
                                            isUnread
                                                ? 'bg-white border-blue-200 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20'
                                                : 'bg-white/90 border-slate-200 hover:border-slate-300 shadow-sm'
                                        }`}
                                    >
                                        {/* Unread Indicator Dot */}
                                        {isUnread && (
                                            <span className="absolute top-4 right-4 sm:top-5 sm:right-5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100"></span>
                                        )}

                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="space-y-3 flex-1 pr-6">
                                                {/* Match Reason & Badges */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {d.match_reason && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <Sparkles className="w-3 h-3 text-emerald-600" />
                                                            {d.match_reason}
                                                        </span>
                                                    )}
                                                    {d.is_urgent && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                                                            🚨 জরুরি
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {notification.created_at}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                                                    {d.title}
                                                </h3>

                                                {/* Details Chips */}
                                                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{d.category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                        <Package className="w-3.5 h-3.5 text-blue-600" />
                                                        <span className="font-bold text-slate-800">{Number(d.target_quantity).toLocaleString()}</span>
                                                        <span className="text-slate-500">{d.unit}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                                        <span>{d.district}</span>
                                                    </div>
                                                    {d.target_rate && (
                                                        <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 text-emerald-800 font-bold">
                                                            <span>৳{Number(d.target_rate).toLocaleString()}</span>
                                                            <span className="text-xs font-normal text-emerald-600">/{d.unit}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {d.poster_name && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>পোস্ট করেছেন: <strong className="text-slate-700">{d.poster_name}</strong></span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <div className="pt-2 sm:pt-0 shrink-0 w-full sm:w-auto">
                                                <Link
                                                    href={route('feed.show', d.post_id)}
                                                    onClick={() => handleItemClick(notification)}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 hover:shadow-lg transition transform active:scale-95 text-center"
                                                >
                                                    <span>কাজের বিস্তারিত ও দরপত্র</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ShilposetuLayout>
    );
}
