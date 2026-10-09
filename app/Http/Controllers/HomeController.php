<?php

namespace App\Http\Controllers;

use App\Models\Factory;
use App\Models\SubcontractPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the rich digital industrial landing page (Shilposetu / KnitKhata).
     */
    public function index(Request $request): Response
    {
        // Cache high-level summary counts for 5 minutes for ultra-fast, zero-query landing page loads
        $stats = Cache::remember('home_landing_stats', 300, function () {
            return [
                'total_vendors' => Factory::count(),
                'verified_vendors' => Factory::where('is_verified', true)->count(),
                'active_orders' => SubcontractPost::where('post_type', 'DEMAND')->where('status', 'open')->count(),
                'total_machines' => Factory::sum('total_machines') ?: 1250,
            ];
        });

        return Inertia::render('Home/Index', [
            'stats' => $stats,
        ]);
    }
}
