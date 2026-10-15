<?php

namespace App\Http\Controllers;

use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\FactoryShift;
use App\Models\Machine;
use App\Models\MachineType;
use App\Models\Production;
use App\Models\Quotation;
use App\Models\Shift;
use App\Models\SubcontractPost;
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
        if (! $factory && $user) {
            $factory = Factory::where('user_id', $user->id)->first();
        }

        $factoryId = $factory?->id;

        if (! $factoryId) {
            return ['orders' => [], 'vendors' => []];
        }

        // Match DIRECTLY on accepted_factory_id of subcontract_posts table
        $posts = SubcontractPost::where('accepted_factory_id', $factoryId)
            ->with(['factory', 'user', 'acceptedFactory'])
            ->latest()
            ->get();

        $orders = [];
        $vendors = [];

        foreach ($posts as $p) {
            $vendorKey = 'v_'.($p->factory_id ?: $p->user_id);
            $vendorName = $p->factory?->business_name ?: $p->user?->name ?: 'বায়ার পার্টি';
            $vendorPhone = $p->factory?->phone ?: $p->user?->phone ?: '০১৭১১-২২৩৩৪৪';
            $vendorEmail = $p->factory?->email ?: $p->user?->email ?: '';

            if (! isset($vendors[$vendorKey])) {
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
                'id' => 'SC-POST-'.str_pad($p->id, 3, '0', STR_PAD_LEFT),
                'db_id' => $p->id,
                'title' => $p->title,
                'v' => $vendorKey,
                'vendorName' => $vendorName,
                'vendorPhone' => $vendorPhone,
                'vendorEmail' => $vendorEmail,
                'fabric' => $specs['fabric'] ?? $specs['fabric_type'] ?? $specs['fabric_name'] ?? (! empty($specs['machine_type']) ? preg_replace('/.*?\((.*?)\).*/', '$1', $specs['machine_type']) : ($p->category === 'knitting' ? 'Single Jersey 100% Cotton' : $p->title)),
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
                        'lot' => 'SQ-'.(88410 + $p->id),
                        'bags' => 80,
                        'kg' => (int) round($qty * 0.55),
                    ],
                ] : []),
                'qc' => ! empty($specs['qc']) ? array_values(array_map(function ($item, $idx) use ($p) {
                    if (! isset($item['id'])) {
                        $item['id'] = 'qc_'.$p->id.'_'.($idx + 1);
                    }

                    return $item;
                }, $specs['qc'], array_keys($specs['qc']))) : ($st !== 'wait' ? [
                    [
                        'id' => 'qc_'.$p->id.'_1',
                        'd' => $p->created_at ? $p->created_at->format('d M Y') : '02 Oct 2026',
                        'roll' => 'R-'.str_pad((string) (140 + $p->id), 3, '0', STR_PAD_LEFT),
                        'm' => 'M-01',
                        'issue' => 'Needle mark (১টি সুঁচ ভাঙা)',
                        'kg' => 22.5,
                        's' => 'bad',
                        'res' => 'রিজেক্ট',
                        'inspector' => 'মো. জহিরুল ইসলাম (QC)',
                        'notes' => 'নিডেল পরিবর্তন ও মেকানিক চেক সম্পন্ন',
                    ],
                    [
                        'id' => 'qc_'.$p->id.'_2',
                        'd' => $p->created_at ? $p->created_at->format('d M Y') : '03 Oct 2026',
                        'roll' => 'R-'.str_pad((string) (141 + $p->id), 3, '0', STR_PAD_LEFT),
                        'm' => 'M-02',
                        'issue' => 'লুব্রিকেশন দাগ (Oil spot)',
                        'kg' => 24.0,
                        's' => 'warn',
                        'res' => 'ওয়াশিংয়ে দূর',
                        'inspector' => 'মো. জহিরুল ইসলাম (QC)',
                        'notes' => 'ওয়াশিং প্ল্যান্টে আলাদা মার্ক করে পাঠানো হয়েছে',
                    ],
                    [
                        'id' => 'qc_'.$p->id.'_3',
                        'd' => $p->created_at ? $p->created_at->format('d M Y') : '04 Oct 2026',
                        'roll' => 'R-'.str_pad((string) (142 + $p->id), 3, '0', STR_PAD_LEFT),
                        'm' => 'M-01',
                        'issue' => 'কোনো সমস্যা নেই (পাস)',
                        'kg' => 25.0,
                        's' => 'ok',
                        'res' => 'পাস',
                        'inspector' => 'মো. জহিরুল ইসলাম (QC)',
                        'notes' => '১০০% স্পেসিফিকেশন ও জিএসএম সঠিক',
                    ],
                ] : []),
                'challans' => $specs['challans'] ?? ($st === 'done' ? [
                    [
                        'challanNo' => 'CH-2610-0'.(30 + $p->id),
                        'date' => '02 Oct 2026',
                        'rolls' => 60,
                        'kg' => $qty,
                        'vehicle' => 'ঢাকা মেট্রো-ন ১২-৮৮৪০',
                    ],
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
        if (! $user) {
            return ['vendorOrders' => [], 'subcontractorFactories' => []];
        }

        $posts = SubcontractPost::where('user_id', $user->id)
            ->with(['acceptedFactory', 'factory'])
            ->withCount('quotations')
            ->latest()
            ->get();

        if ($posts->isEmpty()) {
            $posts = SubcontractPost::with(['acceptedFactory', 'factory'])
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

            $factoryKey = $p->accepted_factory_id ? 'fac_'.$p->accepted_factory_id : 'open_bidding';
            $factoryName = $p->acceptedFactory?->business_name ?: ($p->status === 'open' ? 'উন্মুক্ত (দরপত্র আহ্বান চলছে)' : 'ফ্যাক্টরি নির্ধারণ বাকি');
            $factoryPhone = $p->acceptedFactory?->phone ?: '০১৭১১-২২৩৩৪৪';
            $factoryLocation = $p->acceptedFactory?->location ?: ($p->acceptedFactory?->district ?: 'বাংলাদেশ');

            if ($p->accepted_factory_id) {
                if (! isset($factories[$factoryKey])) {
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
                'id' => 'SC-POST-'.str_pad($p->id, 3, '0', STR_PAD_LEFT),
                'db_id' => $p->id,
                'title' => $p->title,
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
                'fabric' => $specs['fabric'] ?? $specs['fabric_type'] ?? $specs['fabric_name'] ?? (! empty($specs['machine_type']) ? preg_replace('/.*?\((.*?)\).*/', '$1', $specs['machine_type']) : ($p->category === 'knitting' ? 'Single Jersey 100% Cotton' : $p->title)),
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
                        'lot' => 'SQ-'.(88410 + $p->id),
                        'bags' => 80,
                        'kg' => (int) round($qty * 0.55),
                    ],
                ] : []),
                'qc' => ! empty($specs['qc']) ? array_values(array_map(function ($item, $idx) use ($p) {
                    if (! isset($item['id'])) {
                        $item['id'] = 'qc_'.$p->id.'_'.($idx + 1);
                    }

                    return $item;
                }, $specs['qc'], array_keys($specs['qc']))) : ($st !== 'wait' ? [
                    [
                        'id' => 'qc_'.$p->id.'_1',
                        'd' => $p->created_at ? $p->created_at->format('d M Y') : '02 Oct 2026',
                        'roll' => 'R-'.str_pad((string) (140 + $p->id), 3, '0', STR_PAD_LEFT),
                        'm' => 'M-01',
                        'issue' => 'Needle mark (১টি সুঁচ ভাঙা)',
                        'kg' => 22.5,
                        's' => 'bad',
                        'res' => 'রিজেক্ট',
                        'inspector' => 'মো. জহিরুল ইসলাম (QC)',
                        'notes' => 'নিডেল পরিবর্তন ও মেকানিক চেক সম্পন্ন',
                    ],
                    [
                        'id' => 'qc_'.$p->id.'_2',
                        'd' => $p->created_at ? $p->created_at->format('d M Y') : '03 Oct 2026',
                        'roll' => 'R-'.str_pad((string) (141 + $p->id), 3, '0', STR_PAD_LEFT),
                        'm' => 'M-02',
                        'issue' => 'লুব্রিকেশন দাগ (Oil spot)',
                        'kg' => 24.0,
                        's' => 'warn',
                        'res' => 'ওয়াশিংয়ে দূর',
                        'inspector' => 'মো. জহিরুল ইসলাম (QC)',
                        'notes' => 'ওয়াশিং প্ল্যান্টে আলাদা মার্ক করে পাঠানো হয়েছে',
                    ],
                ] : []),
                'challans' => $specs['challans'] ?? ($st === 'done' ? [
                    [
                        'challanNo' => 'CH-2610-0'.(30 + $p->id),
                        'date' => '02 Oct 2026',
                        'rolls' => 60,
                        'kg' => $qty,
                        'vehicle' => 'ঢাকা মেট্রো-ন ১২-৮৮৪০',
                    ],
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
        $userPosts = $user ? SubcontractPost::where('user_id', $user->id)
            ->with(['acceptedFactory', 'factory'])
            ->withCount('quotations')
            ->latest()
            ->get() : collect();

        if ($userPosts->isEmpty()) {
            $userPosts = SubcontractPost::with(['acceptedFactory', 'factory'])
                ->withCount('quotations')
                ->latest()
                ->take(10)
                ->get();
        }

        $quotationsSubmitted = $user ? Quotation::where('bidder_user_id', $user->id)
            ->with(['post.user', 'post.factory', 'post.acceptedFactory'])
            ->latest()
            ->get() : collect();

        if ($quotationsSubmitted->isEmpty()) {
            $quotationsSubmitted = Quotation::with(['post.user', 'post.factory', 'post.acceptedFactory'])
                ->latest()
                ->get();
        }

        $orderData = $this->getKnitkhataOrdersAndVendors($user, $factory);
        $vendorData = $this->getKnitkhataVendorOrdersAndFactories($user);

        // Factory Shifts loading & Auto-initialization from Master Shifts (শিফট A, B, C)
        $dbShifts = [];
        if ($factory) {
            $fShifts = FactoryShift::where('factory_id', $factory->id)->orderBy('sort_order')->get();
            if ($fShifts->isEmpty()) {
                $masterShifts = Shift::where('is_active', true)->orderBy('sort_order')->get();
                foreach ($masterShifts as $ms) {
                    FactoryShift::create([
                        'factory_id' => $factory->id,
                        'shift_id' => $ms->id,
                        'name' => $ms->name,
                        'code' => $ms->code,
                        'start_time' => $ms->start_time,
                        'end_time' => $ms->end_time,
                        'duration_hours' => $ms->duration_hours,
                        'in_charge' => 'মো. রফিকুল ইসলাম',
                        'target_output_kg' => 900,
                        'is_active' => true,
                        'sort_order' => $ms->sort_order,
                        'notes' => $ms->description,
                    ]);
                }
                $fShifts = FactoryShift::where('factory_id', $factory->id)->orderBy('sort_order')->get();
            }

            $dbShifts = $fShifts->map(function ($s) {
                return [
                    'id' => (string) $s->id,
                    'db_id' => $s->id,
                    'name' => $s->name,
                    'code' => $s->code,
                    'startTime' => substr((string) $s->start_time, 0, 5),
                    'endTime' => substr((string) $s->end_time, 0, 5),
                    'durationHours' => (float) $s->duration_hours,
                    'inCharge' => $s->in_charge ?: 'মো. রফিকুল ইসলাম',
                    'targetOutputKg' => (float) ($s->target_output_kg ?: 900),
                    'status' => $s->is_active ? 'active' : 'inactive',
                    'notes' => $s->notes ?: '',
                ];
            })->all();
        }

        // Production Records loading for floor view
        $dbProductionLogs = [];
        if ($factory) {
            $productions = Production::where('factory_id', $factory->id)
                ->with('subcontractPost')
                ->latest('production_date')
                ->latest('id')
                ->take(100)
                ->get();

            $dbProductionLogs = $productions->map(function ($p) {
                return [
                    'id' => $p->id,
                    'd' => $p->production_date ? $p->production_date->format('d M Y') : now()->format('d M Y'),
                    'sh' => $p->shift_code ?: 'A',
                    'm' => $p->machine_code ?: 'M-01',
                    'o' => $p->subcontract_post_id ? ('SC-POST-'.str_pad($p->subcontract_post_id, 3, '0', STR_PAD_LEFT)) : 'SC-POST-001',
                    'order_title' => $p->subcontractPost?->title,
                    'kg' => (float) $p->quantity_kg,
                    'rolls' => (int) $p->rolls_count,
                    'op' => $p->operator_name ?: 'অপারেটর',
                    'lot' => $p->yarn_lot ?: '—',
                    'issue' => $p->quality_issue ?: 'না',
                    'notes' => $p->notes,
                ];
            })->all();
        }

        // Factory Machines & Floor Machine Roster loaded directly from DB
        $factoryMachines = collect();
        $dbFloorMachines = [];

        if (! $factory && $user) {
            $factory = Factory::where('user_id', $user->id)->first() ?? Factory::first();
        }

        if ($factory) {
            $fMachines = $factory->machines()->with('machineType')->orderBy('sort_order')->get();

            // If this factory has no factory_machines registered yet, initialize from active machine types
            if ($fMachines->isEmpty()) {
                $defaultTypes = MachineType::where('is_active', true)->orderBy('sort_order')->take(3)->get();
                if ($defaultTypes->isNotEmpty()) {
                    foreach ($defaultTypes as $idx => $dt) {
                        FactoryMachine::create([
                            'factory_id' => $factory->id,
                            'machine_type_id' => $dt->id,
                            'category' => $dt->category ?? 'knitting',
                            'no_of_machine' => 4,
                            'capacity_per_machine' => 600,
                            'total_capacity_per_day' => 2400,
                            'unit_type' => 'Kg',
                            'sort_order' => $idx + 1,
                        ]);
                    }
                    $fMachines = $factory->machines()->with('machineType')->orderBy('sort_order')->get();
                }
            }

            $factoryMachines = $fMachines->map(function ($m) {
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

            // Expand factory_machines into individual floor machines (e.g. M-01, M-02, ...)
            $machineIndex = 1;
            foreach ($fMachines as $fm) {
                $count = max(1, (int) $fm->no_of_machine);
                $typeName = $fm->machineType?->name ?? 'Single Jersey';
                $brand = $fm->machineType?->brand_or_model ?? 'Standard Industrial';
                $capDaily = (float) $fm->capacity_per_machine ?: 600;
                $cph = round($capDaily / 24, 1);

                $dia = '30" × 24G';
                if (preg_match('/(\d+["\']?\s*[×x]\s*\d+G?)/i', $typeName.' '.$brand, $matches)) {
                    $dia = $matches[1];
                }

                for ($i = 0; $i < $count; $i++) {
                    $code = 'M-'.str_pad((string) $machineIndex, 2, '0', STR_PAD_LEFT);
                    $dbFloorMachines[] = [
                        'code' => $code,
                        'type' => $typeName,
                        'dia' => $dia,
                        'brand' => $brand,
                        'cph' => $cph > 0 ? $cph : 25.0,
                        'op' => '—',
                        'sh' => 'খালি',
                        'factory_machine_id' => $fm->id,
                    ];
                    $machineIndex++;
                }
            }
        }

        $userIds = array_filter([$user?->id, $factory?->user_id]);
        $customMachines = Machine::query()
            ->when(! empty($userIds), function ($q) use ($userIds) {
                $q->whereIn('created_by_id', $userIds);
            })
            ->with('machineType')
            ->orderBy('sort_order')
            ->get();

        $machineTypes = MachineType::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'brand_or_model', 'category']);

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
            'dbShifts' => $dbShifts,
            'dbProductionLogs' => $dbProductionLogs,
            'factoryMachines' => $factoryMachines,
            'customMachines' => $customMachines,
            'machineTypes' => $machineTypes,
            'dbFloorMachines' => $dbFloorMachines,
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
        return $this->renderKnitkhata($request, 'machines');
    }

    public function shifts(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'shifts');
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

        Machine::create([
            'name' => $validated['name'],
            'machine_type_id' => $validated['machine_type_id'] ?? null,
            'cph' => $validated['cph'] ?? 25.0,
            'unit' => $validated['unit'] ?? 'Kg',
            'brand_or_model' => $validated['brand_or_model'] ?? null,
            'serial_number' => $validated['serial_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'is_active' => true,
            'created_by_id' => $user->id,
            'sort_order' => Machine::where('created_by_id', $user->id)->count() + 1,
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
            'fabric' => 'required|string|max:200',
            'qty' => 'required|numeric|min:1',
            'status' => 'nullable|string',
            'vendor' => 'nullable|string',
            'gsm' => 'nullable|numeric',
            'dia' => 'nullable|string',
            'color' => 'nullable|string',
            'yarn' => 'nullable|string',
            'rate_tk' => 'nullable|numeric',
            'machines' => 'nullable|array',
        ]);

        $dbStatus = match ($validated['status'] ?? 'wait') {
            'run' => 'in_progress',
            'done' => 'completed',
            default => 'open',
        };

        SubcontractPost::create([
            'user_id' => $user->id,
            'factory_id' => $factory?->id,
            'accepted_factory_id' => ($dbStatus === 'in_progress' ? $factory?->id : null),
            'post_type' => 'DEMAND',
            'category' => 'Single Jersey',
            'title' => $validated['fabric'],
            'target_quantity' => (int) $validated['qty'],
            'unit' => 'kg',
            'target_rate' => $validated['rate_tk'] ?? 22.0,
            'deadline' => now()->addDays(20),
            'specs' => [
                'gsm' => $validated['gsm'] ?? 160,
                'dia' => $validated['dia'] ?? '30" × 24G',
                'color' => $validated['color'] ?? 'Navy Blue',
                'yarn' => $validated['yarn'] ?? '30s Combed Cotton',
                'machines' => $validated['machines'] ?? [],
                'done' => 0,
            ],
            'status' => $dbStatus,
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
            'status' => 'required|string',
        ]);

        $id = (int) preg_replace('/\D/', '', (string) $validated['order_id']);
        $post = SubcontractPost::find($id);

        if ($post) {
            $dbStatus = match ($validated['status']) {
                'run' => 'in_progress',
                'wait' => 'open',
                'done' => 'completed',
                default => $validated['status'],
            };

            $updateData = ['status' => $dbStatus];
            if ($dbStatus === 'in_progress' && ! $post->accepted_factory_id) {
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
            'count' => 'nullable|string',
            'spinner' => 'nullable|string',
            'lot' => 'nullable|string',
            'bags' => 'nullable|numeric',
            'kg' => 'required|numeric|min:1',
        ]);

        $id = (int) preg_replace('/\D/', '', (string) $validated['order_id']);
        $post = SubcontractPost::find($id);

        if ($post) {
            $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
            $yarnIn = $specs['yarn_in'] ?? [];
            $yarnIn[] = [
                'count' => $validated['count'] ?? '30s Combed',
                'spinner' => $validated['spinner'] ?? 'Standard Spinner',
                'lot' => $validated['lot'] ?? ('LOT-'.rand(1000, 9999)),
                'bags' => (int) ($validated['bags'] ?? 0),
                'kg' => (float) $validated['kg'],
            ];
            $specs['yarn_in'] = $yarnIn;

            // When yarn is received, if status was open/wait, transition to in_progress
            $newStatus = $post->status === 'open' ? 'in_progress' : $post->status;

            $post->update([
                'specs' => $specs,
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
            'order_id' => 'required',
            'challan_no' => 'nullable|string',
            'date' => 'nullable|string',
            'rolls' => 'nullable|numeric',
            'kg' => 'required|numeric|min:1',
            'vehicle' => 'nullable|string',
            'driver_phone' => 'nullable|string',
        ]);

        $id = (int) preg_replace('/\D/', '', (string) $validated['order_id']);
        $post = SubcontractPost::find($id);

        if ($post) {
            $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
            $challans = $specs['challans'] ?? [];
            $challans[] = [
                'challanNo' => $validated['challan_no'] ?: ('CH-'.rand(1000, 9999)),
                'date' => $validated['date'] ?: now()->format('d M Y'),
                'rolls' => (int) ($validated['rolls'] ?? 0),
                'kg' => (float) $validated['kg'],
                'vehicle' => $validated['vehicle'] ?? '',
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
                'specs' => $specs,
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
        $post = SubcontractPost::find($id);

        if ($post) {
            $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
            $specs['machines'] = $validated['machines'] ?? [];

            $updateData = ['specs' => $specs];
            // If machines are assigned and status is open, optionally transition to in_progress if accepted
            if (! empty($specs['machines']) && $post->status === 'open' && $post->accepted_factory_id) {
                $updateData['status'] = 'in_progress';
            }

            $post->update($updateData);
        }

        return redirect()->back()->with('success', 'মেশিন সফলভাবে বরাদ্দ / অ্যাসাইন করা হয়েছে!');
    }

    /**
     * Store or update a factory shift.
     */
    public function storeShift(Request $request)
    {
        $user = $request->user();
        $factory = $user?->factory;
        if (! $factory) {
            $factory = Factory::where('user_id', $user->id)->first() ?? Factory::first();
        }
        if (! $factory) {
            return redirect()->back()->with('error', 'ফ্যাক্টরি পাওয়া যায়নি!');
        }

        $validated = $request->validate([
            'id' => 'nullable',
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'duration_hours' => 'nullable|numeric|min:1|max:24',
            'in_charge' => 'nullable|string|max:100',
            'target_output_kg' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
            'status' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
        ]);

        $isActive = isset($validated['is_active']) ? (bool) $validated['is_active'] : (($validated['status'] ?? 'active') === 'active');
        $duration = $validated['duration_hours'] ?? 8.0;

        if (! empty($validated['id']) && is_numeric($validated['id'])) {
            $shift = FactoryShift::where('factory_id', $factory->id)->find($validated['id']);
            if ($shift) {
                $shift->update([
                    'name' => $validated['name'],
                    'code' => $validated['code'],
                    'start_time' => $validated['start_time'],
                    'end_time' => $validated['end_time'],
                    'duration_hours' => $duration,
                    'in_charge' => $validated['in_charge'] ?? null,
                    'target_output_kg' => $validated['target_output_kg'] ?? null,
                    'is_active' => $isActive,
                    'notes' => $validated['notes'] ?? null,
                ]);

                return redirect()->back()->with('success', 'শিফট তথ্য সফলভাবে আপডেট হয়েছে!');
            }
        }

        FactoryShift::create([
            'factory_id' => $factory->id,
            'name' => $validated['name'],
            'code' => $validated['code'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'duration_hours' => $duration,
            'in_charge' => $validated['in_charge'] ?? null,
            'target_output_kg' => $validated['target_output_kg'] ?? null,
            'is_active' => $isActive,
            'sort_order' => FactoryShift::where('factory_id', $factory->id)->count() + 1,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'নতুন শিফট সফলভাবে তৈরি হয়েছে!');
    }

    /**
     * Delete a factory shift.
     */
    public function destroyShift(Request $request, $id)
    {
        $user = $request->user();
        $factory = $user?->factory;
        if (! $factory) {
            $factory = Factory::where('user_id', $user->id)->first() ?? Factory::first();
        }

        $shift = FactoryShift::where('factory_id', $factory?->id)->find($id);
        if ($shift) {
            $shift->delete();

            return redirect()->back()->with('success', 'শিফট মুছে ফেলা হয়েছে!');
        }

        return redirect()->back()->with('error', 'শিফট পাওয়া যায়নি!');
    }

    /**
     * Store single or bulk floor production logs.
     */
    public function storeProduction(Request $request)
    {
        $user = $request->user();
        $factory = $user?->factory;
        if (! $factory) {
            $factory = Factory::where('user_id', $user->id)->first() ?? Factory::first();
        }
        if (! $factory) {
            return redirect()->back()->with('error', 'ফ্যাক্টরি পাওয়া যায়নি!');
        }

        $isBulk = $request->input('mode') === 'bulk' || $request->has('entries');

        if ($isBulk) {
            $entries = $request->input('entries', []);
            $prodDate = $request->input('production_date') ? date('Y-m-d', strtotime($request->input('production_date'))) : now()->toDateString();
            $shiftCode = $request->input('shift_code', 'A');

            $savedCount = 0;
            $totalKg = 0;

            foreach ($entries as $item) {
                $kg = (float) ($item['quantity_kg'] ?? $item['kg'] ?? 0);
                if ($kg <= 0) {
                    continue;
                }

                $rolls = (int) ($item['rolls_count'] ?? $item['rolls'] ?? 0);
                $mCode = $item['machine_code'] ?? $item['m'] ?? 'M-01';
                $orderRawId = $item['order_id'] ?? $item['o'] ?? null;
                $op = $item['operator_name'] ?? $item['op'] ?? 'অপারেটর';
                $lot = $item['yarn_lot'] ?? $item['lot'] ?? null;
                $issue = $item['quality_issue'] ?? $item['issue'] ?? 'না';

                // Resolve subcontract post id
                $postId = null;
                if ($orderRawId) {
                    $cleanId = (int) preg_replace('/\D/', '', (string) $orderRawId);
                    $post = SubcontractPost::find($cleanId);
                    if ($post) {
                        $postId = $post->id;
                    }
                }

                if (! $postId) {
                    $post = SubcontractPost::where('accepted_factory_id', $factory->id)
                        ->whereIn('status', ['in_progress', 'open'])
                        ->first();
                    $postId = $post?->id;
                }

                // Resolve factory shift id
                $factoryShift = FactoryShift::where('factory_id', $factory->id)
                    ->where('code', $shiftCode)
                    ->first();

                $notes = $item['notes'] ?? $item['remarks'] ?? null;

                Production::create([
                    'factory_id' => $factory->id,
                    'subcontract_post_id' => $postId,
                    'machine_code' => $mCode,
                    'factory_shift_id' => $factoryShift?->id,
                    'shift_code' => $shiftCode,
                    'production_date' => $prodDate,
                    'quantity_kg' => $kg,
                    'rolls_count' => $rolls,
                    'operator_name' => $op,
                    'yarn_lot' => $lot,
                    'quality_issue' => $issue,
                    'notes' => $notes,
                    'created_by_id' => $user->id,
                ]);

                // Sync with subcontract_post progress
                if ($postId && $post = SubcontractPost::find($postId)) {
                    $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
                    $currDone = (float) ($specs['done'] ?? 0);
                    $specs['done'] = $currDone + $kg;
                    $updateData = ['specs' => $specs];
                    if ($specs['done'] >= $post->target_quantity && $post->status === 'in_progress') {
                        $updateData['status'] = 'completed';
                    }
                    $post->update($updateData);
                }

                $savedCount++;
                $totalKg += $kg;
            }

            return redirect()->back()->with('success', "শিফট {$shiftCode}-এ মোট {$savedCount}টি মেশিনে {$totalKg} kg প্রোডাকশন সফলভাবে এন্ট্রি হয়েছে!");
        } else {
            // Single Entry
            $validated = $request->validate([
                'production_date' => 'nullable|string',
                'shift_code' => 'required|string',
                'machine_code' => 'required|string',
                'order_id' => 'nullable|string',
                'quantity_kg' => 'required|numeric|min:0.1',
                'rolls_count' => 'nullable|numeric',
                'operator_name' => 'nullable|string',
                'yarn_lot' => 'nullable|string',
                'quality_issue' => 'nullable|string',
                'notes' => 'nullable|string',
                'remarks' => 'nullable|string',
            ]);

            $prodDate = ! empty($validated['production_date']) ? date('Y-m-d', strtotime($validated['production_date'])) : now()->toDateString();
            $kg = (float) $validated['quantity_kg'];
            $rolls = (int) ($validated['rolls_count'] ?? 0);

            $postId = null;
            if (! empty($validated['order_id'])) {
                $cleanId = (int) preg_replace('/\D/', '', (string) $validated['order_id']);
                $post = SubcontractPost::find($cleanId);
                if ($post) {
                    $postId = $post->id;
                }
            }
            if (! $postId) {
                $post = SubcontractPost::where('accepted_factory_id', $factory->id)
                    ->whereIn('status', ['in_progress', 'open'])
                    ->first();
                $postId = $post?->id;
            }

            $factoryShift = FactoryShift::where('factory_id', $factory->id)
                ->where('code', $validated['shift_code'])
                ->first();

            Production::create([
                'factory_id' => $factory->id,
                'subcontract_post_id' => $postId,
                'machine_code' => $validated['machine_code'],
                'factory_shift_id' => $factoryShift?->id,
                'shift_code' => $validated['shift_code'],
                'production_date' => $prodDate,
                'quantity_kg' => $kg,
                'rolls_count' => $rolls,
                'operator_name' => $validated['operator_name'] ?? 'অপারেটর',
                'yarn_lot' => $validated['yarn_lot'] ?? null,
                'quality_issue' => $validated['quality_issue'] ?? 'না',
                'notes' => $validated['notes'] ?? $validated['remarks'] ?? null,
                'created_by_id' => $user->id,
            ]);

            if ($postId && $post = SubcontractPost::find($postId)) {
                $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
                $currDone = (float) ($specs['done'] ?? 0);
                $specs['done'] = $currDone + $kg;
                $updateData = ['specs' => $specs];
                if ($specs['done'] >= $post->target_quantity && $post->status === 'in_progress') {
                    $updateData['status'] = 'completed';
                }
                $post->update($updateData);
            }

            return redirect()->back()->with('success', "মেশিন {$validated['machine_code']}-এর {$kg} kg প্রোডাকশন সফলভাবে এন্ট্রি হয়েছে!");
        }
    }

    /**
     * Delete a production log and revert order completed quantity.
     */
    public function destroyProduction(Request $request, $id)
    {
        $user = $request->user();
        $factory = $user?->factory;
        if (! $factory) {
            $factory = Factory::where('user_id', $user->id)->first() ?? Factory::first();
        }

        $prod = Production::where('factory_id', $factory?->id)->find($id);
        if ($prod) {
            if ($prod->subcontract_post_id && $post = SubcontractPost::find($prod->subcontract_post_id)) {
                $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
                $currDone = (float) ($specs['done'] ?? 0);
                $specs['done'] = max(0, $currDone - (float) $prod->quantity_kg);
                $post->update(['specs' => $specs]);
            }
            $prod->delete();

            return redirect()->back()->with('success', 'প্রোডাকশন এন্ট্রি মুছে ফেলা হয়েছে!');
        }

        return redirect()->back()->with('error', 'এন্ট্রি পাওয়া যায়নি!');
    }

    /**
     * Store or append a QC inspection entry on a subcontract post.
     */
    public function storeQc(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required',
            'roll' => 'required|string',
            'machine' => 'required|string',
            'issue' => 'required|string',
            'kg' => 'required|numeric|min:0.1',
            'status' => 'required|in:ok,bad,warn',
            'resolution' => 'nullable|string',
            'date' => 'nullable|string',
            'inspector' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $id = (int) preg_replace('/\D/', '', (string) $validated['order_id']);
        $post = SubcontractPost::find($id);

        if (! $post) {
            $user = $request->user();
            $factory = $user?->factory ?: Factory::where('user_id', $user?->id)->first();
            $post = SubcontractPost::where('accepted_factory_id', $factory?->id)
                ->whereIn('status', ['in_progress', 'open', 'completed'])
                ->latest()
                ->first();
        }

        if ($post) {
            $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
            $qcList = $specs['qc'] ?? [];

            $qcId = 'qc_'.time().'_'.rand(100, 999);
            $qcList[] = [
                'id' => $qcId,
                'd' => $validated['date'] ?: now()->format('d M Y'),
                'roll' => $validated['roll'],
                'm' => $validated['machine'],
                'issue' => $validated['issue'],
                'kg' => (float) $validated['kg'],
                's' => $validated['status'],
                'res' => $validated['resolution'] ?: ($validated['status'] === 'ok' ? 'পাস' : ($validated['status'] === 'warn' ? 'মেরামত' : 'রিজেক্ট')),
                'inspector' => $validated['inspector'] ?? 'মো. জহিরুল ইসলাম (QC)',
                'notes' => $validated['notes'] ?? '',
            ];
            $specs['qc'] = $qcList;
            $post->update(['specs' => $specs]);

            return redirect()->back()->with('success', "রোল {$validated['roll']}-এর QC পরিদর্শন সফলভাবে সংরক্ষিত হয়েছে!");
        }

        return redirect()->back()->with('error', 'অর্ডার পাওয়া যায়নি!');
    }

    /**
     * Delete a QC inspection entry from a subcontract post.
     */
    public function destroyQc(Request $request, $id)
    {
        $posts = SubcontractPost::whereNotNull('specs')->get();
        foreach ($posts as $post) {
            $specs = is_array($post->specs) ? $post->specs : (json_decode($post->specs, true) ?: []);
            if (! empty($specs['qc']) && is_array($specs['qc'])) {
                $filtered = array_values(array_filter($specs['qc'], function ($q) use ($id) {
                    return ($q['id'] ?? '') !== (string) $id && ($q['roll'] ?? '') !== (string) $id;
                }));
                if (count($filtered) !== count($specs['qc'])) {
                    $specs['qc'] = $filtered;
                    $post->update(['specs' => $specs]);

                    return redirect()->back()->with('success', 'QC রেকর্ড সফলভাবে মুছে ফেলা হয়েছে!');
                }
            }
        }

        return redirect()->back()->with('error', 'QC রেকর্ড পাওয়া যায়নি!');
    }
}
