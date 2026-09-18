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

            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white py-8 px-4 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">User Profile & Account Settings</h1>
                            <p className="text-xs text-slate-300 mt-1">Manage your personal credentials, contact info, and security.</p>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm">
                                <User className="w-3.5 h-3.5" />
                                Personal Profile
                            </span>
                            <Link
                                href={route('factory.edit')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/60 transition"
                            >
                                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                Factory Profile
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
