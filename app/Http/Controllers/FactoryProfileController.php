<?php

namespace App\Http\Controllers;

use App\Models\Factory;
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
                'industry_type' => 'Apparel & Garments',
                'is_verified' => false,
            ]);
        }

        $machineTypes = MachineType::query()
            ->active()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Factory/Edit', [
            'factory' => $factory,
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
            'total_lines' => ['nullable', 'integer', 'min:0'],
            'total_machines' => ['nullable', 'integer', 'min:0'],
            'daily_capacity' => ['nullable', 'string', 'max:100'],
            'production_capacities' => ['nullable', 'array'],
            'trade_license_no' => ['nullable', 'string', 'max:100'],
            'tin_no' => ['nullable', 'string', 'max:100'],
            'bin_no' => ['nullable', 'string', 'max:100'],
            'capabilities' => ['nullable', 'array'],
            'capabilities.*' => ['string', 'max:100'],
        ]);

        // Synchronize total_lines, total_machines, and daily_capacity if production_capacities is supplied
        if (isset($validated['production_capacities']) && is_array($validated['production_capacities'])) {
            $capacities = $validated['production_capacities'];

            // 1. Sewing lines
            if (isset($capacities['sewing']) && is_array($capacities['sewing'])) {
                $sewingLines = (int) ($capacities['sewing']['no_of_lines'] ?? 0);
                if ($sewingLines > 0) {
                    $validated['total_lines'] = $sewingLines;
                }

                $sewingDailyTotal = (float) ($capacities['sewing']['total_capacity_per_day'] ?? 0);
                $sewingUnit = $capacities['sewing']['unit'] ?? 'Pcs';
                if ($sewingDailyTotal > 0 && empty($validated['daily_capacity'])) {
                    $validated['daily_capacity'] = number_format($sewingDailyTotal).' '.$sewingUnit.'/Day';
                }
            }

            // 2. Count total machines across all non-sewing departments
            $nonSewingCategories = ['knitting', 'yarn_dyeing', 'fabric_dyeing', 'print', 'embroidery'];
            $countedMachines = 0;
            $hasAnyMachineRow = false;

            foreach ($nonSewingCategories as $cat) {
                if (! empty($capacities[$cat]) && is_array($capacities[$cat])) {
                    foreach ($capacities[$cat] as $row) {
                        if (is_array($row) && ! empty($row['machine_type'])) {
                            $hasAnyMachineRow = true;
                            $countedMachines += (int) ($row['no_of_machine'] ?? 0);
                        }
                    }
                }
            }

            if ($hasAnyMachineRow) {
                $validated['total_machines'] = $countedMachines;
            }
        }

        $factory->update($validated);

        return redirect()->route('factory.edit')->with('success', 'Factory information updated successfully.');
    }
}
