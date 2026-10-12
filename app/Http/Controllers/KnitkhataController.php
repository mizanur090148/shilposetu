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

        return Inertia::render('Knitkhata/Index', array_merge([
            'factory' => $factory,
            'auth' => [
                'user' => $user,
            ],
            'initialTab' => $tab,
            'initialRole' => $role,
            'initialOrderId' => $extra['orderId'] ?? 'SC-2610-014',
            'userPosts' => $userPosts,
            'quotationsSubmitted' => $quotationsSubmitted,
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
}
