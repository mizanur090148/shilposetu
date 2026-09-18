<?php

namespace App\Http\Controllers;

use App\Models\Factory;
use App\Models\Quotation;
use App\Models\SubcontractPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Factory / Buyer industrial SaaS dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $factory = $user->factory;

        // User's own posts (GIVE Subcontract)
        $userPosts = SubcontractPost::where('user_id', $user->id)
            ->withCount('quotations')
            ->latest()
            ->get();

        // Quotations received on user's posted orders
        $quotationsReceivedCount = Quotation::whereHas('post', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();

        // Quotations submitted by user (TAKE Subcontract)
        $quotationsSubmitted = Quotation::where('bidder_user_id', $user->id)
            ->with(['post.user', 'post.factory'])
            ->latest()
            ->get();

        // Order breakdown by category (matches donut chart in Screen 2)
        $categoryBreakdown = [
            ['name' => 'Knitting', 'value' => SubcontractPost::where('category', 'knitting')->count(), 'color' => '#3B82F6'],
            ['name' => 'Dyeing', 'value' => SubcontractPost::whereIn('category', ['fabric_dyeing', 'yarn_dyeing'])->count(), 'color' => '#10B981'],
            ['name' => 'Sewing', 'value' => SubcontractPost::where('category', 'sewing_production')->count(), 'color' => '#F59E0B'],
            ['name' => 'Washing', 'value' => SubcontractPost::where('category', 'washing')->count(), 'color' => '#8B5CF6'],
            ['name' => 'Printing', 'value' => SubcontractPost::where('category', 'print')->count(), 'color' => '#EC4899'],
        ];

        $kpis = [
            'active_rfqs' => SubcontractPost::where('user_id', $user->id)->where('status', 'open')->count(),
            'total_quotations_received' => $quotationsReceivedCount,
            'bids_submitted' => $quotationsSubmitted->count(),
            'bids_accepted' => $quotationsSubmitted->where('status', 'accepted')->count(),
            'factory_lines' => $factory ? $factory->total_lines : 0,
            'is_verified' => $factory ? (bool) $factory->is_verified : false,
            'is_subscribed' => (bool) $user->is_subscribed,
            'customer_id' => $user->customer_id ?? 'S'.$user->id,
        ];

        return Inertia::render('Dashboard', [
            'factory' => $factory,
            'kpis' => $kpis,
            'userPosts' => $userPosts,
            'quotationsSubmitted' => $quotationsSubmitted,
            'categoryBreakdown' => $categoryBreakdown,
            'initialTab' => $request->query('tab', 'posted'),
        ]);
    }
}
