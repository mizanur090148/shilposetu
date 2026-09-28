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

        // Top 5 Knitting Types breakdown (focused on knitting sector)
        $topKnittingTypes = \App\Models\KnittingType::active()
            ->orderBy('sort_order')
            ->take(5)
            ->get();

        $colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

        $categoryBreakdown = $topKnittingTypes->map(function ($kt, $index) use ($colors) {
            $cat = $kt->slug;
            $cleanCat = str_replace('-', '_', $cat);
            $count = SubcontractPost::where(function ($q) use ($cat, $cleanCat) {
                $q->where('category', $cat)
                    ->orWhere('category', $cleanCat)
                    ->orWhere('title', 'like', '%'.$cat.'%')
                    ->orWhereHas('factory.knittingTypes', function ($ktq) use ($cat) {
                        $ktq->where('slug', $cat);
                    });
            })->count();

            return [
                'name' => $kt->name,
                'slug' => $kt->slug,
                'value' => $count,
                'color' => $colors[$index % count($colors)],
            ];
        })->values()->toArray();

        $kpis = [
            'active_rfqs' => SubcontractPost::where('user_id', $user->id)->where('status', 'open')->count(),
            'total_quotations_received' => $quotationsReceivedCount,
            'bids_submitted' => $quotationsSubmitted->count(),
            'bids_accepted' => $quotationsSubmitted->where('status', 'accepted')->count(),
            'factory_lines' => $factory ? ($factory->total_machines ?? 0) : 0,
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
