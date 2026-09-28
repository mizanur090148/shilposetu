import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { User, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <ShilposetuLayout>
            <Head title="Account Profile | Shilposetu" />

            {/* Sky Blue Hero Banner */}
            <div className="relative bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white py-8 border-b border-sky-400/30 overflow-hidden shadow-xs">
                {/* Subtle Luminous Grid Background Accent */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                    <ShieldCheck className="w-3 h-3 text-sky-100" />
                                    <span>Account Control</span>
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                                Personal Profile & Account Settings
                            </h1>
                            <p className="text-xs sm:text-sm text-sky-50 mt-1 max-w-2xl font-medium">
                                Manage your personal credentials, contact info, login credentials, and account security.
                            </p>
                        </div>

                        {/* Navigation Tabs Bar */}
                        <div className="flex items-center bg-white/15 backdrop-blur-md p-1.5 rounded-2xl border border-white/25 shadow-xs self-start sm:self-auto gap-1">
                            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-blue-700 shadow-xs">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                <span>Personal Profile</span>
                            </span>
                            <Link
                                href={route('factory.edit')}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white hover:bg-white/15 transition group"
                            >
                                <Building2 className="w-3.5 h-3.5 text-sky-200 group-hover:scale-110 transition-transform" />
                                <span>Factory Profile</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Quick Factory Banner Link */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-900">Looking to manage your Factory Information & Capacity?</h3>
                                <p className="text-[11px] text-slate-600">Update production lines, machines, daily capacity, legal licenses (Trade License, TIN, BIN), and capabilities.</p>
                            </div>
                        </div>
                        <Link
                            href={route('factory.edit')}
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm shrink-0"
                        >
                            <span>Edit Factory Information</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="bg-white p-6 shadow-sm border border-slate-200/80 rounded-2xl">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-6 shadow-sm border border-slate-200/80 rounded-2xl">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-6 shadow-sm border border-slate-200/80 rounded-2xl">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </ShilposetuLayout>
    );
}
