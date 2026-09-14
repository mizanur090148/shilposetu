<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Display subscription plans and membership status.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user ? $user->subscriptions()->latest()->first() : null;

        return Inertia::render('Subscription/Index', [
            'subscription' => $subscription,
            'plans' => [
                [
                    'name' => 'Factory Standard Membership',
                    'registration_fee' => 100,
                    'monthly_fee' => 50,
                    'currency' => 'BDT',
                    'features' => [
                        'Post unlimited excess subcontract orders',
                        'View full Tech Packs & garment measurements',
                        'Direct phone & WhatsApp contact with factory owners',
                        'Submit quotations and bid on capacity requests',
                        'Verified Factory Blue Tick on directory',
                        'Production milestone tracking & status updates',
                    ],
                ],
            ],
        ]);
    }

    /**
     * Activate or renew subscription via bKash / Nagad payment.
     */
    public function subscribe(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:bkash,nagad,sslcommerz',
            'transaction_id' => 'required|string|min:6|max:30',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        $months = $validated['billing_cycle'] === 'yearly' ? 12 : 1;
        $monthlyFee = 50.00;
        $regFee = 100.00;

        $expiresAt = now()->addMonths($months);

        Subscription::create([
            'user_id' => $user->id,
            'registration_fee' => $regFee,
            'monthly_fee' => $monthlyFee * $months,
            'billing_cycle' => $validated['billing_cycle'],
            'status' => 'active',
            'payment_method' => $validated['payment_method'],
            'transaction_id' => strtoupper($validated['transaction_id']),
            'starts_at' => now(),
            'expires_at' => $expiresAt,
        ]);

        $user->update([
            'is_subscribed' => true,
            'subscription_expires_at' => $expiresAt,
        ]);

        return redirect()->route('subscription.index')->with('success', 'Your subscription has been activated successfully! You now have full access to all factory contacts and tech packs.');
    }
}
