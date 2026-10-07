<?php

namespace App\Http\Controllers;

use App\Models\Factory;
use App\Models\KnittingType;
use App\Models\SubcontractPost;
use App\Services\SubcontractMatchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    /**
     * Display the public Facebook-style subcontract feed.
     */
    public function index(Request $request): Response
    {
        $query = SubcontractPost::with([
            'user:id,name,customer_id,phone',
            'factory:id,user_id,business_name,logo,industry_type,district,total_machines,is_verified',
            'factory.knittingTypes:id,name,slug',
            'quotations' => function ($q) {
                $q->select('id', 'subcontract_post_id', 'offered_unit_price', 'offered_lead_days');
            },
        ])
            ->where('post_type', 'DEMAND'); // News feed only shows "Have Extra Orders (Need Subcontract)"

        // Filter by knitting type (supports multiple comma-separated, array, or single)
        $rawKnittingType = $request->input('knitting_type', $request->input('category', $request->input('knitting_types', 'all')));
        $selectedKnittingTypes = [];
        if (is_array($rawKnittingType)) {
            $selectedKnittingTypes = array_values(array_filter($rawKnittingType, fn ($v) => ! empty($v) && $v !== 'all'));
        } elseif (is_string($rawKnittingType) && ! empty($rawKnittingType) && $rawKnittingType !== 'all') {
            $parts = explode(',', $rawKnittingType);
            $selectedKnittingTypes = array_values(array_filter(array_map('trim', $parts), fn ($v) => ! empty($v) && $v !== 'all'));
        }

        if (! empty($selectedKnittingTypes)) {
            $query->where(function ($q) use ($selectedKnittingTypes) {
                foreach ($selectedKnittingTypes as $cat) {
                    $cleanCat = str_replace('-', '_', $cat);
                    $cleanSpace = str_replace('-', ' ', $cat);
                    $q->orWhere('category', $cat)
                        ->orWhere('category', $cleanCat)
                        ->orWhere('title', 'like', '%'.$cat.'%')
                        ->orWhere('title', 'like', '%'.$cleanSpace.'%')
                        ->orWhere('description', 'like', '%'.$cat.'%')
                        ->orWhere('description', 'like', '%'.$cleanSpace.'%')
                        ->orWhereHas('factory.knittingTypes', function ($ktq) use ($cat) {
                            $ktq->where('slug', $cat)->orWhere('name', 'like', '%'.$cat.'%');
                        });
                }
            });
        }
        $knittingTypeProp = ! empty($selectedKnittingTypes) ? implode(',', $selectedKnittingTypes) : 'all';

        // Filter by district
        if ($request->filled('district') && $request->input('district') !== 'all') {
            $query->where('district', $request->input('district'));
        }

        // Keyword search
        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                    ->orWhere('description', 'like', $term)
                    ->orWhere('district', 'like', $term)
                    ->orWhereHas('factory', function ($fq) use ($term) {
                        $fq->where('business_name', 'like', $term);
                    });
            });
        }

        // Filter: Urgent orders only
        if ($request->boolean('urgent_only')) {
            $query->where('is_urgent', true);
        }

        // Filter: Rate negotiable only
        if ($request->boolean('negotiable_only')) {
            $query->where('rate_negotiable', true);
        }

        // Filter: Verified factories only
        if ($request->boolean('verified_only')) {
            $query->whereHas('factory', function ($fq) {
                $fq->where('is_verified', true);
            });
        }

        // Filter: Quantity range
        if ($request->filled('quantity') && $request->input('quantity') !== 'all') {
            $qty = $request->input('quantity');
            if ($qty === 'under_5k') {
                $query->where('target_quantity', '<', 5000);
            } elseif ($qty === '5k_20k') {
                $query->whereBetween('target_quantity', [5000, 20000]);
            } elseif ($qty === '20k_50k') {
                $query->whereBetween('target_quantity', [20000, 50000]);
            } elseif ($qty === '50k_plus') {
                $query->where('target_quantity', '>=', 50000);
            }
        }

        // Sorting
        $sort = $request->input('sort', 'latest');
        if ($sort === 'urgent') {
            $query->orderByDesc('is_urgent')->latest();
        } elseif ($sort === 'quantity_desc') {
            $query->orderByDesc('target_quantity');
        } elseif ($sort === 'quantity_asc') {
            $query->orderBy('target_quantity', 'asc');
        } else {
            $query->latest();
        }

        $posts = $query->paginate(8)->withQueryString();

        $user = $request->user();
        $isSubscribed = $user ? (bool) $user->is_subscribed : false;

        $districts = SubcontractPost::where('post_type', 'DEMAND')
            ->select('district')
            ->whereNotNull('district')
            ->distinct()
            ->orderBy('district')
            ->pluck('district');

        $stats = [
            'total_vendors' => Factory::count(),
            'verified_vendors' => Factory::where('is_verified', true)->count(),
            'active_orders' => SubcontractPost::where('post_type', 'DEMAND')->where('status', 'open')->count(),
            'total_machines' => Factory::sum('total_machines'),
        ];

        $knittingTypes = KnittingType::active()->orderBy('sort_order')->get();

        return Inertia::render('Feed/Index', [
            'posts' => $posts,
            'filters' => [
                'knitting_type' => $knittingTypeProp,
                'category' => $knittingTypeProp,
                'district' => $request->input('district', 'all'),
                'search' => $request->input('search', ''),
                'urgent_only' => $request->boolean('urgent_only'),
                'negotiable_only' => $request->boolean('negotiable_only'),
                'verified_only' => $request->boolean('verified_only'),
                'quantity' => $request->input('quantity', 'all'),
                'sort' => $sort,
            ],
            'knittingTypes' => $knittingTypes,
            'districts' => $districts,
            'stats' => $stats,
            'userCanViewFullDetails' => $isSubscribed,
        ]);
    }

    /**
     * Store a newly created subcontract order or capacity post.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'post_type' => 'required|in:DEMAND,SUPPLY',
            'category' => 'required|string',
            'title' => 'required|string|max:255',
            'target_quantity' => 'required|integer|min:1',
            'unit' => 'required|string|max:30',
            'target_rate' => 'nullable|numeric|min:0',
            'rate_negotiable' => 'boolean',
            'deadline' => 'nullable|date',
            'district' => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
            'description' => 'required|string|max:3000',
            'specs' => 'nullable|array',
            'is_urgent' => 'boolean',
        ]);

        $user = $request->user();
        $factory = $user->factory;

        $post = SubcontractPost::create([
            'user_id' => $user->id,
            'factory_id' => $factory ? $factory->id : null,
            'post_type' => $validated['post_type'],
            'category' => $validated['category'],
            'title' => $validated['title'],
            'target_quantity' => $validated['target_quantity'],
            'unit' => $validated['unit'],
            'target_rate' => $validated['target_rate'] ?? null,
            'rate_negotiable' => $validated['rate_negotiable'] ?? true,
            'deadline' => $validated['deadline'] ?? null,
            'district' => $validated['district'],
            'address' => $validated['address'] ?? null,
            'description' => $validated['description'],
            'specs' => $validated['specs'] ?? [],
            'is_urgent' => $validated['is_urgent'] ?? false,
            'status' => 'open',
        ]);

        // Automatically match relevant factories and send in-app + email notifications
        $notifiedCount = app(SubcontractMatchService::class)->notifyMatchingFactories($post);

        $successMsg = 'Subcontract post published successfully!';
        if ($notifiedCount > 0) {
            $successMsg .= " {$notifiedCount} matching factories have been notified.";
        }

        return redirect()->route('feed.index')->with('success', $successMsg);
    }

    /**
     * Display full details of a specific subcontract post.
     */
    public function show(Request $request, int $id): Response
    {
        $post = SubcontractPost::with([
            'user:id,name,customer_id,phone,email',
            'factory',
            'quotations.bidderFactory',
            'quotations.bidderUser:id,name,customer_id,phone,email',
        ])->findOrFail($id);

        $post->increment('views_count');

        $user = $request->user();
        $isSubscribed = $user ? (bool) $user->is_subscribed : false;
        $isOwner = $user && $user->id === $post->user_id;

        return Inertia::render('Feed/Show', [
            'post' => $post,
            'userCanViewFullDetails' => $isSubscribed || $isOwner,
            'isOwner' => $isOwner,
        ]);
    }
}
