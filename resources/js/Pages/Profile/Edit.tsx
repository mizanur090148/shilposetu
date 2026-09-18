import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
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

            <div className="bg-slate-900 text-white py-8 px-4 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold">User Profile & Account Settings</h1>
                    <p className="text-xs text-slate-400 mt-1">Manage your credentials, factory contact info, and security.</p>
                </div>
            </div>

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
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
