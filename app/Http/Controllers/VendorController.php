<?php

namespace App\Http\Controllers;

use App\Models\Factory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    /**
     * Display a listing of verified factories & industrial plants.
     */
    public function index(Request $request): Response
    {
        $query = Factory::with('user:id,name,customer_id,email,phone');

        // Search across name, location, sector, and capabilities
        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($term) {
                $q->where('business_name', 'like', $term)
                    ->orWhere('district', 'like', $term)
                    ->orWhere('industry_type', 'like', $term)
                    ->orWhere('address', 'like', $term)
                    ->orWhere('capabilities', 'like', $term);
            });
        }

        // District filter
        if ($request->filled('district') && $request->input('district') !== 'all') {
            $query->where('district', $request->input('district'));
        }

        // Sector / Industry Type filter
        if ($request->filled('industry') && $request->input('industry') !== 'all') {
            $industry = $request->input('industry');
            $query->where(function ($q) use ($industry) {
                $q->where('industry_type', 'like', '%'.$industry.'%')
                    ->orWhere('capabilities', 'like', '%'.$industry.'%');
            });
        }

        // Verified-only toggle
        if ($request->boolean('verified_only')) {
            $query->where('is_verified', true);
        }

        // Production lines capacity range
        if ($request->filled('lines') && $request->input('lines') !== 'all') {
            $lines = $request->input('lines');
            if ($lines === '1-10') {
                $query->whereBetween('total_lines', [1, 10]);
            } elseif ($lines === '11-25') {
                $query->whereBetween('total_lines', [11, 25]);
            } elseif ($lines === '25+') {
                $query->where('total_lines', '>=', 25);
            }
        }

        // Sorting
        $sort = $request->input('sort', 'latest');
        if ($sort === 'rating_desc') {
            $query->orderByDesc('rating');
        } elseif ($sort === 'lines_desc') {
            $query->orderByDesc('total_lines');
        } elseif ($sort === 'name_asc') {
            $query->orderBy('business_name', 'asc');
        } else {
            $query->latest();
        }

        $factories = $query->paginate(9)->withQueryString();

        $districts = Factory::select('district')
            ->whereNotNull('district')
            ->distinct()
            ->orderBy('district')
            ->pluck('district');

        $industryTypes = [
            ['key' => 'all', 'label' => 'All Sectors (সকল খাত)'],
            ['key' => 'Knitting', 'label' => 'Knitting (নিটিং)'],
            ['key' => 'Dyeing', 'label' => 'Dyeing & Finishing (ডাইং)'],
            ['key' => 'Woven', 'label' => 'Woven & Denim (ওভেন ও ডেনিম)'],
            ['key' => 'Sewing', 'label' => 'Sewing & CMT (সুইং)'],
            ['key' => 'Washing', 'label' => 'Washing Plant (ওয়াশিং)'],
            ['key' => 'Print', 'label' => 'Screen & Rotary Print (প্রিন্টিং)'],
        ];

        $stats = [
            'total' => Factory::count(),
            'verified' => Factory::where('is_verified', true)->count(),
            'total_lines' => Factory::sum('total_lines'),
        ];

        return Inertia::render('Vendors/Index', [
            'factories' => $factories,
            'filters' => [
                'search' => $request->input('search', ''),
                'district' => $request->input('district', 'all'),
                'industry' => $request->input('industry', 'all'),
                'lines' => $request->input('lines', 'all'),
                'verified_only' => $request->boolean('verified_only'),
                'sort' => $sort,
            ],
            'districts' => $districts,
            'industryTypes' => $industryTypes,
            'stats' => $stats,
        ]);
    }

    /**
     * Display the specified factory's capacity profile.
     */
    public function show(int $id): Response
    {
        $factory = Factory::with([
            'user:id,name,customer_id,email,phone',
            'subcontractPosts' => function ($q) {
                $q->latest()->take(6);
            },
        ])->findOrFail($id);

        return Inertia::render('Vendors/Show', [
            'factory' => $factory,
        ]);
    }
}
