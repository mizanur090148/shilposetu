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

            <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white py-8 px-4 border-b border-slate-800 overflow-hidden shadow-sm">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute left-1/3 -bottom-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    Account Control
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Personal Profile & Account Settings
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                                Manage your personal credentials, contact info, login credentials, and account security.
                            </p>
                        </div>

                        {/* Navigation Tabs Bar */}
                        <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/70 shadow-lg shadow-black/20 self-start sm:self-auto gap-1">
                            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                                <User className="w-3.5 h-3.5" />
                                <span>Personal Profile</span>
                            </span>
                            <Link
                                href={route('factory.edit')}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition group"
                            >
                                <Building2 className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
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
