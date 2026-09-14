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
        $query = Factory::with('user:id,name,customer_id,email,phone')->latest();

        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($term) {
                $q->where('business_name', 'like', $term)
                    ->orWhere('district', 'like', $term)
                    ->orWhere('industry_type', 'like', $term);
            });
        }

        if ($request->filled('district') && $request->input('district') !== 'all') {
            $query->where('district', $request->input('district'));
        }

        $factories = $query->paginate(9)->withQueryString();

        $districts = Factory::select('district')
            ->whereNotNull('district')
            ->distinct()
            ->pluck('district');

        return Inertia::render('Vendors/Index', [
            'factories' => $factories,
            'filters' => [
                'search' => $request->input('search', ''),
                'district' => $request->input('district', 'all'),
            ],
            'districts' => $districts,
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
