<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KnitkhataController extends Controller
{
    /**
     * Helper to render Knitkhata view with user context and initial tab.
     */
    /**
     * Map subcontract posts from database to Knitkhata floor orders & vendors.
     * Scoped DIRECTLY by accepted_factory_id on subcontract_posts table.
     */
    private function getKnitkhataOrdersAndVendors($user, $factory): array
    {
        if (!$factory && $user) {
            $factory = \App\Models\Factory::where('user_id', $user->id)->first();
        }

        $factoryId = $factory?->id;

        if (!$factoryId) {
            return ['orders' => [], 'vendors' => []];
        }

        // Match DIRECTLY on accepted_factory_id of subcontract_posts table
        $posts = \App\Models\SubcontractPost::where('accepted_factory_id', $factoryId)
            ->with(['factory', 'user', 'acceptedFactory'])
            ->latest()
            ->get();

        $orders = [];
        $vendors = [];

        foreach ($posts as $p) {
            $vendorKey = 'v_' . ($p->factory_id ?: $p->user_id);
            $vendorName = $p->factory?->business_name ?: $p->user?->name ?: 'বায়ার পার্টি';
            $vendorPhone = $p->factory?->phone ?: $p->user?->phone ?: '০১৭১১-২২৩৩৪৪';
            $vendorEmail = $p->factory?->email ?: $p->user?->email ?: '';

            if (!isset($vendors[$vendorKey])) {
                $vendors[$vendorKey] = [
                    'name' => $vendorName,
                    'phone' => $vendorPhone,
                    'email' => $vendorEmail,
                ];
            }

            $specs = is_array($p->specs) ? $p->specs : (json_decode($p->specs, true) ?: []);

            $st = match ($p->status) {
                'in_progress' => 'run',
                'completed', 'closed' => 'done',
                default => 'wait', // 'open', 'waiting', 'yarn_pending'
            };

            $qty = (int) $p->target_quantity;
            $done = isset($specs['done']) ? (int) $specs['done'] : ($st === 'done' ? $qty : ($st === 'run' ? (int) round($qty * 0.62) : 0));

            $orders[] = [
                'id' => 'SC-POST-' . str_pad($p->id, 3, '0', STR_PAD_LEFT),
                'db_id' => $p->id,
                'v' => $vendorKey,
                'vendorName' => $vendorName,
                'vendorPhone' => $vendorPhone,
                'vendorEmail' => $vendorEmail,
                'fabric' => $p->title,
                'category' => $p->category,
                'gsm' => (int) ($specs['gsm'] ?? 160),
                'dia' => $specs['dia'] ?? '30" × 24G',
                'color' => $specs['color'] ?? 'Navy Blue',
                'yarn' => $specs['yarn'] ?? '30s Combed Cotton',
                'qty' => $qty,
                'done' => $done,
                'machines' => $specs['machines'] ?? ($st === 'run' ? ['M-04', 'M-07'] : ($st === 'done' ? ['M-01', 'M-02'] : [])),
                'rate' => (int) ($specs['rate'] ?? 450),
                'rateTk' => (float) ($p->target_rate ?: 22.0),
                'start' => $p->created_at ? $p->created_at->format('d M Y') : '26 Sep 2026',
                'status' => $st,
                'db_status' => $p->status,
                'yarnIn' => $specs['yarn_in'] ?? ($st !== 'wait' ? [
                    [
                        'count' => $specs['yarn'] ?? '30s Combed',
                        'spinner' => 'Square Textiles',
                        'lot' => 'SQ-' . (88410 + $p->id),
                        'bags' => 80,
                        'kg' => (int) round($qty * 0.55),
                    ]
                ] : []),
                'qc' => $specs['qc'] ?? [],
                'challans' => $specs['challans'] ?? ($st === 'done' ? [
                    [
                        'challanNo' => 'CH-2610-0' . (30 + $p->id),
                        'date' => '02 Oct 2026',
                        'rolls' => 60,
                        'kg' => $qty,
                        'vehicle' => 'ঢাকা মেট্রো-ন ১২-৮৮৪০',
                    ]
                ] : []),
            ];
        }

        return ['orders' => $orders, 'vendors' => $vendors];
    }

    /**
     * Map user's posted subcontract posts to Knitkhata floor orders & subcontractor factories (Vendor View).
     */
    private function getKnitkhataVendorOrdersAndFactories($user): array
    {
        if (!$user) {
            return ['vendorOrders' => [], 'subcontractorFactories' => []];
        }

        $posts = \App\Models\SubcontractPost::where('user_id', $user->id)
            ->with(['acceptedFactory', 'factory'])
            ->withCount('quotations')
            ->latest()
            ->get();

        if ($posts->isEmpty()) {
            $posts = \App\Models\SubcontractPost::with(['acceptedFactory', 'factory'])
                ->withCount('quotations')
                ->latest()
                ->take(10)
                ->get();
        }

        $orders = [];
        $factories = [];

        foreach ($posts as $p) {
            $specs = is_array($p->specs) ? $p->specs : (json_decode($p->specs, true) ?: []);

            $st = match ($p->status) {
                'in_progress' => 'run',
                'completed', 'closed' => 'done',
                default => 'wait', // 'open', 'waiting', 'yarn_pending'
            };

            $qty = (int) $p->target_quantity;
            $done = isset($specs['done']) ? (int) $specs['done'] : ($st === 'done' ? $qty : ($st === 'run' ? (int) round($qty * 0.62) : 0));

            $factoryKey = $p->accepted_factory_id ? 'fac_' . $p->accepted_factory_id : 'open_bidding';
            $factoryName = $p->acceptedFactory?->business_name ?: ($p->status === 'open' ? 'উন্মুক্ত (দরপত্র আহ্বান চলছে)' : 'ফ্যাক্টরি নির্ধারণ বাকি');
            $factoryPhone = $p->acceptedFactory?->phone ?: '০১৭১১-২২৩৩৪৪';
            $factoryLocation = $p->acceptedFactory?->location ?: ($p->acceptedFactory?->district ?: 'বাংলাদেশ');

            if ($p->accepted_factory_id) {
                if (!isset($factories[$factoryKey])) {
                    $factories[$factoryKey] = [
                        'id' => $p->accepted_factory_id,
                        'name' => $factoryName,
                        'phone' => $factoryPhone,
                        'location' => $factoryLocation,
                        'order_count' => 0,
                        'total_qty' => 0,
                        'done_qty' => 0,
                    ];
                }
                $factories[$factoryKey]['order_count']++;
                $factories[$factoryKey]['total_qty'] += $qty;
                $factories[$factoryKey]['done_qty'] += $done;
            }

            $orders[] = [
                'id' => 'SC-POST-' . str_pad($p->id, 3, '0', STR_PAD_LEFT),
                'db_id' => $p->id,
                'v' => $factoryKey,
                'vendorName' => $factoryName,
                'vendorPhone' => $factoryPhone,
                'vendorEmail' => $p->acceptedFactory?->email ?: '',
                'factory_location' => $factoryLocation,
                'is_awarded' => (bool) $p->accepted_factory_id,
                'accepted_factory' => $p->acceptedFactory ? [
                    'id' => $p->acceptedFactory->id,
                    'business_name' => $p->acceptedFactory->business_name,
                    'phone' => $p->acceptedFactory->phone,
                    'location' => $factoryLocation,
                ] : null,
                'quotations_count' => (int) $p->quotations_count,
                'fabric' => $p->title,
                'category' => $p->category,
                'gsm' => (int) ($specs['gsm'] ?? 160),
                'dia' => $specs['dia'] ?? '30" × 24G',
                'color' => $specs['color'] ?? 'Navy Blue',
                'yarn' => $specs['yarn'] ?? '30s Combed Cotton',
                'qty' => $qty,
                'done' => $done,
                'machines' => $specs['machines'] ?? ($st === 'run' ? ['M-04', 'M-07'] : ($st === 'done' ? ['M-01', 'M-02'] : [])),
                'rate' => (int) ($specs['rate'] ?? 450),
                'rateTk' => (float) ($p->target_rate ?: 22.0),
                'start' => $p->created_at ? $p->created_at->format('d M Y') : '26 Sep 2026',
                'deadline' => $p->deadline,
                'status' => $st,
                'db_status' => $p->status,
                'yarnIn' => $specs['yarn_in'] ?? ($st !== 'wait' ? [
                    [
                        'count' => $specs['yarn'] ?? '30s Combed',
                        'spinner' => 'Square Textiles',
                        'lot' => 'SQ-' . (88410 + $p->id),
                        'bags' => 80,
                        'kg' => (int) round($qty * 0.55),
                    ]
                ] : []),
                'qc' => $specs['qc'] ?? [],
                'challans' => $specs['challans'] ?? ($st === 'done' ? [
                    [
                        'challanNo' => 'CH-2610-0' . (30 + $p->id),
                        'date' => '02 Oct 2026',
                        'rolls' => 60,
                        'kg' => $qty,
                        'vehicle' => 'ঢাকা মেট্রো-ন ১২-৮৮৪০',
                    ]
                ] : []),
            ];
        }

        return ['vendorOrders' => $orders, 'subcontractorFactories' => $factories];
    }

    /**
     * Helper to render Knitkhata view with user context and initial tab.
     */
    private function renderKnitkhata(Request $request, string $tab, array $extra = []): Response
    {
        $user = $request->user();
        $factory = $user?->factory;
        $role = $extra['role'] ?? $request->query('role', (str_starts_with($tab, 'v') ? 'ven' : 'fac'));

        // Fetch user's posted subcontract orders and submitted bids for dual-role sync
        $userPosts = $user ? \App\Models\SubcontractPost::where('user_id', $user->id)
            ->with(['acceptedFactory', 'factory'])
            ->withCount('quotations')
            ->latest()
            ->get() : collect();

        if ($userPosts->isEmpty()) {
            $userPosts = \App\Models\SubcontractPost::with(['acceptedFactory', 'factory'])
                ->withCount('quotations')
                ->latest()
                ->take(10)
                ->get();
        }

        $quotationsSubmitted = $user ? \App\Models\Quotation::where('bidder_user_id', $user->id)
            ->with(['post.user', 'post.factory', 'post.acceptedFactory'])
            ->latest()
            ->get() : collect();

        if ($quotationsSubmitted->isEmpty()) {
            $quotationsSubmitted = \App\Models\Quotation::with(['post.user', 'post.factory', 'post.acceptedFactory'])
                ->latest()
                ->get();
        }

        $orderData = $this->getKnitkhataOrdersAndVendors($user, $factory);
        $vendorData = $this->getKnitkhataVendorOrdersAndFactories($user);

        return Inertia::render('Knitkhata/Index', array_merge([
            'factory' => $factory,
            'auth' => [
                'user' => $user,
            ],
            'initialTab' => $tab,
            'initialRole' => $role,
            'initialOrderId' => $extra['orderId'] ?? ($orderData['orders'][0]['id'] ?? 'SC-POST-001'),
            'userPosts' => $userPosts,
            'quotationsSubmitted' => $quotationsSubmitted,
            'initialOrders' => $orderData['orders'],
            'initialVendors' => $orderData['vendors'],
            'initialVendorOrders' => $vendorData['vendorOrders'],
            'subcontractorFactories' => $vendorData['subcontractorFactories'],
        ], $extra));
    }

    public function index(Request $request): Response
    {
        return $this->dashboard($request);
    }

    public function dashboard(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'dash');
    }

    public function orders(Request $request): Response
    {
        $role = $request->query('role', 'fac');
        return $this->renderKnitkhata($request, 'orders', ['role' => $role]);
    }

    public function orderDetail(Request $request, string $id): Response
    {
        return $this->renderKnitkhata($request, 'detail', ['orderId' => $id]);
    }

    public function entry(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'entry');
    }

    public function qc(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'qc');
    }

    public function accounts(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'acc');
    }

    public function attendance(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'att');
    }

    public function machines(Request $request): Response
    {
        $user = $request->user();
        $factory = $user?->factory;

        if (!$factory && $user) {
            $factory = \App\Models\Factory::where('user_id', $user->id)->first() ?? \App\Models\Factory::first();
        }

        $factoryMachines = collect();
        if ($factory) {
            $factoryMachines = $factory->machines()
                ->with('machineType')
                ->get()
                ->map(function ($m) {
                    return [
                        'id' => $m->id,
                        'category' => $m->category,
                        'no_of_machine' => (int) $m->no_of_machine,
                        'capacity_per_machine' => (float) $m->capacity_per_machine,
                        'total_capacity_per_day' => (float) $m->total_capacity_per_day,
                        'unit_type' => $m->unit_type ?: 'Kg',
                        'machine_type' => $m->machineType?->name ?? 'Industrial Knitting Machine',
                        'brand_or_model' => $m->machineType?->brand_or_model ?? 'Standard Model',
                    ];
                });
        }

        $userIds = array_filter([$user?->id, $factory?->user_id]);
        $customMachines = \App\Models\Machine::query()
            ->when(!empty($userIds), function ($q) use ($userIds) {
                $q->whereIn('created_by_id', $userIds);
            })
            ->with('machineType')
            ->orderBy('sort_order')
            ->get();

        $machineTypes = \App\Models\MachineType::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'brand_or_model', 'category']);

        return $this->renderKnitkhata($request, 'machines', [
            'factory' => $factory,
            'factoryMachines' => $factoryMachines,
            'customMachines' => $customMachines,
            'machineTypes' => $machineTypes,
        ]);
    }

    public function storeMachine(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'machine_type_id' => 'nullable|exists:machine_types,id',
            'cph' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:20',
            'brand_or_model' => 'nullable|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        \App\Models\Machine::create([
            'name' => $validated['name'],
            'machine_type_id' => $validated['machine_type_id'] ?? null,
            'cph' => $validated['cph'] ?? 25.0,
            'unit' => $validated['unit'] ?? 'Kg',
            'brand_or_model' => $validated['brand_or_model'] ?? null,
            'serial_number' => $validated['serial_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'is_active' => true,
            'created_by_id' => $user->id,
            'sort_order' => \App\Models\Machine::where('created_by_id', $user->id)->count() + 1,
        ]);

        return redirect()->back()->with('success', 'নতুন মেশিন সফলভাবে যুক্ত হয়েছে!');
    }

    public function users(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'users');
    }

    public function whatsapp(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'wa');
    }

    public function planning(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'plan');
    }

    public function vendorOrders(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'orders', ['role' => 'ven']);
    }

    public function vendorReport(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'vreport', ['role' => 'ven']);
    }

    /**
     * Create a new subcontract order directly into subcontract_posts table.
     */
    public function storeOrder(Request $request)
    {
        $user = $request->user();
        $factory = $user?->factory;
        $validated = $request->validate([
            'fabric'   => 'required|string|max:200',
            'qty'      => 'required|numeric|min:1',
            'status'   => 'nullable|string',
            'vendor'   => 'nullable|string',
            'gsm'      => 'nullable|numeric',
            'dia'      => 'nullable|string',
            'color'    => 'nullable|string',
            'yarn'     => 'nullable|string',
            'rate_tk'  => 'nullable|numeric',
            'machines' => 'nullable|array',
        ]);

        $dbStatus = match ($validated['status'] ?? 'wait') {
            'run'   => 'in_progress',
            'done'  => 'completed',
            default => 'open',
        };

        \App\Models\SubcontractPost::create([
            'user_id'             => $user->id,
            'factory_id'          => $factory?->id,
            'accepted_factory_id' => ($dbStatus === 'in_progress' ? $factory?->id : null),
            'post_type'           => 'DEMAND',
            'category'            => 'Single Jersey',
            'title'               => $validated['fabric'],
            'target_quantity'     => (int) $validated['qty'],
            'unit'                => 'kg',
            'target_rate'         => $validated['rate_tk'] ?? 22.0,
            'deadline'            => now()->addDays(20),
            'specs'               => [
                'gsm'      => $validated['gsm'] ?? 160,
                'dia'      => $validated['dia'] ?? '30" × 24G',
                'color'    => $validated['color'] ?? 'Navy Blue',
                'yarn'     => $validated['yarn'] ?? '30s Combed Cotton',
                'machines' => $validated['machines'] ?? [],
                'done'     => 0,
            ],
            'status'              => $dbStatus,
        ]);

        return redirect()->back()->with('success', 'নতুন সাব-কন্ট্রাক্ট অর্ডার সফলভাবে যুক্ত হয়েছে!');
    }

    /**
     * Update subcontract post status between open/wait, in_progress/run, completed/done.
     */
    public function updateOrderStatus(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required',
            'status'   => 'required|string',
        ]);

        $id = (int) preg_replace('/\D/', '', (string) $validated['order_id']);
        $post = \App\Models\SubcontractPost::find($id);

        if ($post) {
            $dbStatus = match ($validated['status']) {
                'run'   => 'in_progress',
                'wait'  => 'open',
                'done'  => 'completed',
                default => $validated['status'],
            };

            $updateData = ['status' => $dbStatus];
            if ($dbStatus === 'in_progress' && !$post->accepted_factory_id) {
                $user = $request->user();
                $updateData['accepted_factory_id'] = $user?->factory?->id;
            }

            $post->update($updateData);
        }

        return redirect()->back()->with('success', 'অর্ডারের অবস্থা সফলভাবে আপডেট করা হয়েছে!');
    }

    /**
     * Record yarn intake on a subcontract post.
     */
    public function recordYarnIntake(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required',
            'count'    => 'nullable|string',
            'spinner'  => 'nullable|string',
            'lot'      => 'nullable|string',
            'bags'     => 'nullable|numeric',
            'kg'       => 'required|numeric|min:1',
        ]);

        $id = (int) preg_replace('/\D/', '', (string) $validated['order_id']);
        $post = \App\Models\SubcontractPost::find($id);

        if ($post) {
            $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
            $yarnIn = $specs['yarn_in'] ?? [];
            $yarnIn[] = [
                'count'   => $validated['count'] ?? '30s Combed',
                'spinner' => $validated['spinner'] ?? 'Standard Spinner',
                'lot'     => $validated['lot'] ?? ('LOT-' . rand(1000, 9999)),
                'bags'    => (int) ($validated['bags'] ?? 0),
                'kg'      => (float) $validated['kg'],
            ];
            $specs['yarn_in'] = $yarnIn;

            // When yarn is received, if status was open/wait, transition to in_progress
            $newStatus = $post->status === 'open' ? 'in_progress' : $post->status;

            $post->update([
                'specs'  => $specs,
                'status' => $newStatus,
            ]);
        }

        return redirect()->back()->with('success', 'সুতা গ্রহণ সফলভাবে এন্ট্রি হয়েছে!');
    }

    /**
     * Record delivery challan on a subcontract post.
     */
    public function recordDeliveryChallan(Request $request)
    {
        $validated = $request->validate([
            'order_id'     => 'required',
            'challan_no'   => 'nullable|string',
            'date'         => 'nullable|string',
            'rolls'        => 'nullable|numeric',
            'kg'           => 'required|numeric|min:1',
            'vehicle'      => 'nullable|string',
            'driver_phone' => 'nullable|string',
        ]);

        $id = (int) preg_replace('/\D/', '', (string) $validated['order_id']);
        $post = \App\Models\SubcontractPost::find($id);

        if ($post) {
            $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
            $challans = $specs['challans'] ?? [];
            $challans[] = [
                'challanNo'   => $validated['challan_no'] ?: ('CH-' . rand(1000, 9999)),
                'date'        => $validated['date'] ?: now()->format('d M Y'),
                'rolls'       => (int) ($validated['rolls'] ?? 0),
                'kg'          => (float) $validated['kg'],
                'vehicle'     => $validated['vehicle'] ?? '',
                'driverPhone' => $validated['driver_phone'] ?? '',
            ];
            $specs['challans'] = $challans;

            $currentDone = (float) ($specs['done'] ?? 0);
            $newDone = $currentDone + (float) $validated['kg'];
            $specs['done'] = $newDone;

            $newStatus = $post->status;
            if ($newDone >= $post->target_quantity) {
                $newStatus = 'completed';
            }

            $post->update([
                'specs'  => $specs,
                'status' => $newStatus,
            ]);
        }

        return redirect()->back()->with('success', 'ডেলিভারি চালান সফলভাবে তৈরি হয়েছে!');
    }

    /**
     * Assign machines to a subcontract post.
     */
    public function assignMachines(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required',
            'machines' => 'nullable|array',
        ]);

        $id = (int) preg_replace('/\D/', '', (string) $validated['order_id']);
        $post = \App\Models\SubcontractPost::find($id);

        if ($post) {
            $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
            $specs['machines'] = $validated['machines'] ?? [];

            $updateData = ['specs' => $specs];
            // If machines are assigned and status is open, optionally transition to in_progress if accepted
            if (!empty($specs['machines']) && $post->status === 'open' && $post->accepted_factory_id) {
                $updateData['status'] = 'in_progress';
            }

            $post->update($updateData);
        }

        return redirect()->back()->with('success', 'মেশিন সফলভাবে বরাদ্দ / অ্যাসাইন করা হয়েছে!');
    }
}
