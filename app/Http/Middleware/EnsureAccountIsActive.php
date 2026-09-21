<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->status === 'suspended') {
            return back()->with('error', 'আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে। সহায়তার জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।');
        }

        if ($user->status === 'pending') {
            return back()->with('error', 'আপনার ফ্যাক্টরি অ্যাকাউন্টটি বর্তমানে অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে (Pending Approval)। অ্যাডমিন অনুমোদন দিলে আপনি সাব-কন্ট্রাক্ট পোস্ট ও বিড করতে পারবেন।');
        }

        return $next($request);
    }
}
