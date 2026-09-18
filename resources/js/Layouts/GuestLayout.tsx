import ShilposetuLayout from '@/Layouts/ShilposetuLayout';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <ShilposetuLayout>
            <div className="py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-[60vh]">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl">
                    {children}
                </div>
            </div>
        </ShilposetuLayout>
    );
}
