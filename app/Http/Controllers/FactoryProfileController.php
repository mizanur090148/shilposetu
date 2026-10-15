<?php

namespace App\Http\Controllers;

use App\Models\Factory;
use App\Models\FactoryShift;
use App\Models\KnittingType;
use App\Models\MachineType;
use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FactoryProfileController extends Controller
{
    /**
     * Show the factory profile editing page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Ensure factory exists for the user
        $factory = $user->factory;
        if (! $factory) {
            $factory = Factory::create([
                'user_id' => $user->id,
                'business_name' => $user->name.' Factory Unit',
                'contact_person' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'industry_type' => 'Knitting',
                'is_verified' => false,
            ]);
        }

        $factory->load(['knittingTypes', 'machines.machineType', 'factoryShifts']);

        // Auto-seed default shifts if none exist for this factory
        if ($factory->factoryShifts->isEmpty()) {
            $masterShifts = Shift::where('is_active', true)->orderBy('sort_order')->get();
            if ($masterShifts->isNotEmpty()) {
                foreach ($masterShifts as $ms) {
                    FactoryShift::create([
                        'factory_id' => $factory->id,
                        'shift_id' => $ms->id,
                        'name' => $ms->name,
                        'code' => $ms->code,
                        'start_time' => $ms->start_time,
                        'end_time' => $ms->end_time,
                        'duration_hours' => $ms->duration_hours,
                        'in_charge' => $user->name,
                        'target_output_kg' => 900,
                        'is_active' => true,
                        'sort_order' => $ms->sort_order,
                        'notes' => $ms->description,
                    ]);
                }
            } else {
                FactoryShift::create([
                    'factory_id' => $factory->id,
                    'name' => 'Day Shift (ডে শিফট)',
                    'code' => 'DAY',
                    'start_time' => '08:00:00',
                    'end_time' => '20:00:00',
                    'duration_hours' => 12.0,
                    'in_charge' => $user->name,
                    'target_output_kg' => 1200,
                    'is_active' => true,
                    'sort_order' => 1,
                    'notes' => 'ডে শিফট (সকাল ৮:০০ - রাত ৮:০০)',
                ]);
                FactoryShift::create([
                    'factory_id' => $factory->id,
                    'name' => 'Night Shift (নাইট শিফট)',
                    'code' => 'NIGHT',
                    'start_time' => '20:00:00',
                    'end_time' => '08:00:00',
                    'duration_hours' => 12.0,
                    'in_charge' => $user->name,
                    'target_output_kg' => 1000,
                    'is_active' => true,
                    'sort_order' => 2,
                    'notes' => 'নাইট শিফট (রাত ৮:০০ - সকাল ৮:০০)',
                ]);
            }
            $factory->load('factoryShifts');
        }

        $factoryShifts = $factory->factoryShifts()->orderBy('sort_order')->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'start_time' => substr($s->start_time, 0, 5),
                'end_time' => substr($s->end_time, 0, 5),
                'duration_hours' => (float) $s->duration_hours,
                'in_charge' => $s->in_charge ?? '',
                'target_output_kg' => (float) ($s->target_output_kg ?? 0),
                'is_active' => (bool) $s->is_active,
                'sort_order' => (int) $s->sort_order,
                'notes' => $s->notes ?? '',
            ];
        })->values()->all();

        // Format knitting machine rows for the frontend
        $knittingMachines = $factory->machines->where('category', 'knitting')->map(function ($m) {
            return [
                'id' => (string) $m->id,
                'machine_type_id' => $m->machine_type_id,
                'machine_type' => $m->machineType?->name ?? 'Custom Knitting Machine',
                'no_of_machine' => (int) $m->no_of_machine,
                'capacity_per_machine' => (float) $m->capacity_per_machine,
                'total_capacity_per_day' => (float) $m->total_capacity_per_day,
                'unit_type' => $m->unit_type ?: 'Kg',
            ];
        })->values()->all();

        // If no factory_machines rows exist yet, fallback to production_capacities JSON attribute if present
        if (empty($knittingMachines) && ! empty($factory->production_capacities['knitting'])) {
            $knittingMachines = $factory->production_capacities['knitting'];
        }

        $factoryData = $factory->toArray();
        $factoryData['production_capacities'] = [
            'knitting' => $knittingMachines,
        ];
        $factoryData['factory_shifts'] = $factoryShifts;

        $machineTypes = MachineType::query()
            ->active()
            ->where('category', 'knitting')
            ->orderBy('sort_order')
            ->get();

        $knittingTypes = KnittingType::active()->orderBy('sort_order')->get();

        return Inertia::render('Factory/Edit', [
            'factory' => $factoryData,
            'knittingTypes' => $knittingTypes,
            'machineTypes' => $machineTypes,
            'factoryShifts' => $factoryShifts,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the factory profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $factory = $user->factory;

        if (! $factory) {
            $factory = Factory::create([
                'user_id' => $user->id,
                'business_name' => $request->input('business_name', 'Factory Unit'),
            ]);
        }

        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'industry_type' => ['nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'district' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:1000'],
            'total_machines' => ['nullable', 'integer', 'min:0'],
            'daily_capacity' => ['nullable', 'string', 'max:100'],
            'trade_license_no' => ['nullable', 'string', 'max:100'],
            'tin_no' => ['nullable', 'string', 'max:100'],
            'bin_no' => ['nullable', 'string', 'max:100'],
            'knitting_types' => ['nullable', 'array'],
            'knitting_types.*' => ['integer'],
            'production_capacities' => ['nullable', 'array'],
            'capabilities' => ['nullable', 'array'],
            'shifts' => ['nullable', 'array'],
        ]);

        $validated['industry_type'] = 'Knitting';

        // Process knitting machine rows and calculate total machines & daily capacity
        $knittingRows = $request->input('production_capacities.knitting', []);
        $totalMachines = 0;
        $totalDailyCap = 0;

        if (is_array($knittingRows)) {
            $factory->machines()->where('category', 'knitting')->delete();
            $order = 1;

            foreach ($knittingRows as $row) {
                $count = (int) ($row['no_of_machine'] ?? 1);
                $cap = (float) ($row['capacity_per_machine'] ?? 0);
                $daily = (float) ($row['total_capacity_per_day'] ?? ($count * $cap));
                $totalMachines += $count;
                $totalDailyCap += $daily;

                $mTypeId = ! empty($row['machine_type_id']) ? (int) $row['machine_type_id'] : null;
                if (! $mTypeId && ! empty($row['machine_type'])) {
                    $mTypeId = MachineType::where('name', $row['machine_type'])->value('id');
                }

                if ($mTypeId) {
                    $factory->machines()->create([
                        'machine_type_id' => $mTypeId,
                        'category' => 'knitting',
                        'no_of_machine' => $count,
                        'capacity_per_machine' => $cap,
                        'total_capacity_per_day' => $daily,
                        'unit_type' => $row['unit_type'] ?? 'Kg',
                        'sort_order' => $order++,
                    ]);
                }
            }

            $factoryUpdateData = [
                'business_name' => $validated['business_name'],
                'industry_type' => 'Knitting',
                'contact_person' => $validated['contact_person'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'district' => $validated['district'] ?? null,
                'address' => $validated['address'] ?? null,
                'total_machines' => $totalMachines,
                'trade_license_no' => $validated['trade_license_no'] ?? null,
                'tin_no' => $validated['tin_no'] ?? null,
                'bin_no' => $validated['bin_no'] ?? null,
                'capabilities' => $validated['capabilities'] ?? [],
                'production_capacities' => [
                    'knitting' => $knittingRows,
                ],
            ];

            if ($totalDailyCap > 0) {
                $factoryUpdateData['daily_capacity'] = number_format($totalDailyCap).' Kg/Day';
            } elseif (! empty($validated['daily_capacity'])) {
                $factoryUpdateData['daily_capacity'] = $validated['daily_capacity'];
            }

            $factory->update($factoryUpdateData);
        } else {
            $factoryUpdateData = [
                'business_name' => $validated['business_name'],
                'industry_type' => 'Knitting',
                'contact_person' => $validated['contact_person'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'district' => $validated['district'] ?? null,
                'address' => $validated['address'] ?? null,
                'daily_capacity' => $validated['daily_capacity'] ?? null,
                'trade_license_no' => $validated['trade_license_no'] ?? null,
                'tin_no' => $validated['tin_no'] ?? null,
                'bin_no' => $validated['bin_no'] ?? null,
                'capabilities' => $validated['capabilities'] ?? [],
            ];
            $factory->update($factoryUpdateData);
        }

        if ($request->has('knitting_types')) {
            $factory->knittingTypes()->sync($request->input('knitting_types', []));
        }

        // Process shifts rows
        if ($request->has('shifts') && is_array($request->input('shifts'))) {
            $shiftRows = $request->input('shifts', []);
            $factory->factoryShifts()->delete();
            $order = 1;

            foreach ($shiftRows as $s) {
                if (empty($s['name']) && empty($s['code'])) {
                    continue;
                }
                FactoryShift::create([
                    'factory_id' => $factory->id,
                    'name' => $s['name'] ?? ('Shift '.$order),
                    'code' => strtoupper($s['code'] ?? ('S'.$order)),
                    'start_time' => ! empty($s['start_time']) ? (strlen($s['start_time']) === 5 ? $s['start_time'].':00' : $s['start_time']) : '08:00:00',
                    'end_time' => ! empty($s['end_time']) ? (strlen($s['end_time']) === 5 ? $s['end_time'].':00' : $s['end_time']) : '20:00:00',
                    'duration_hours' => ! empty($s['duration_hours']) ? (float) $s['duration_hours'] : 8.0,
                    'in_charge' => $s['in_charge'] ?? null,
                    'target_output_kg' => ! empty($s['target_output_kg']) ? (float) $s['target_output_kg'] : null,
                    'is_active' => isset($s['is_active']) ? (bool) $s['is_active'] : true,
                    'sort_order' => $order++,
                    'notes' => $s['notes'] ?? null,
                ]);
            }
        }

        return redirect()->route('factory.edit')->with('success', 'Factory information updated successfully.');
    }
}
