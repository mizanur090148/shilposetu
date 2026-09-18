import React from 'react';
import { Link } from '@inertiajs/react';
import { Lock, CheckCircle2, X, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface AuthGateModalProps {
    isOpen: boolean;
    onClose?: () => void;
    postTitle?: string;
    isLoggedIn?: boolean;
    canClose?: boolean;
}

export default function AuthGateModal({ isOpen, onClose, postTitle, isLoggedIn, canClose = true }: AuthGateModalProps) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
            onClick={canClose ? onClose : undefined}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cross Close Button */}
                {canClose && onClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition z-20 focus:outline-none focus:ring-2 focus:ring-white/50"
                        title="Close modal"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Header Banner */}
                <div className="bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 text-white p-6 pb-8 text-center relative overflow-hidden">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mx-auto mb-3 shadow-inner">
                        <Lock className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold">
                        {isLoggedIn ? 'Upgrade Subscription to Unlock' : 'Log In or Register to Access Details'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                        Full garment tech packs, exact line capacity, and direct factory phone contacts are protected for verified members.
                    </p>
                    {postTitle && (
                        <div className="mt-3 inline-block bg-white/10 px-3 py-1 rounded-lg text-xs font-medium text-amber-200 truncate max-w-xs">
                            {postTitle}
                        </div>
                    )}
                </div>

                {/* Value Propositions */}
                <div className="p-6 space-y-4 -mt-3 bg-white rounded-t-2xl">
                    <div className="space-y-2.5 text-xs text-slate-600">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span><strong>Direct Factory Contact:</strong> Instant WhatsApp and phone access to the factory owner / merchandiser.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span><strong>Full Technical Tech Pack:</strong> Measurement sheets, yarn/fabric specs, and artwork downloads.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span><strong>Direct Quotation Bidding:</strong> Submit your factory's rate/day and negotiate orders directly.</span>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Shilposetu Membership Fee</p>
                            <p className="text-[11px] text-amber-700">100 Tk Registration + 50 Tk/Month</p>
                        </div>
                        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-1 rounded text-[11px]">SaaS Model</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                        {isLoggedIn ? (
                            <Link
                                href={route('subscription.index')}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md transition"
                            >
                                Activate Membership (50 BDT/Mo)
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('register')}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md transition"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Register Factory Account (শিল্পসেতু অ্যাকাউন্ট)
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2.5 px-4 rounded-xl text-sm transition"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Already Registered? Log In
                                </Link>
                            </>
                        )}
                        {canClose && onClose && (
                            <button
                                onClick={onClose}
                                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-1"
                            >
                                Continue browsing public feed
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
