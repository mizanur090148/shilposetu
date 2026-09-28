<?php

namespace App\Http\Controllers;

use App\Models\Factory;
use App\Models\KnittingType;
use App\Models\MachineType;
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

        $factory->load(['knittingTypes', 'machines.machineType']);

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

            $validated['total_machines'] = $totalMachines;
            if ($totalDailyCap > 0) {
                $validated['daily_capacity'] = number_format($totalDailyCap).' Kg/Day';
            }
            $validated['production_capacities'] = [
                'knitting' => $knittingRows,
            ];
        }

        $factory->update($validated);

        if ($request->has('knitting_types')) {
            $factory->knittingTypes()->sync($request->input('knitting_types', []));
        }

        return redirect()->route('factory.edit')->with('success', 'Factory information updated successfully.');
    }
}
