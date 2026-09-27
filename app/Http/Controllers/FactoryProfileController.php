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

        $factory->load('knittingTypes');

        $machineTypes = MachineType::query()
            ->active()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get();

        $knittingTypes = KnittingType::active()->orderBy('sort_order')->get();

        return Inertia::render('Factory/Edit', [
            'factory' => $factory,
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
        ]);

        $validated['industry_type'] = 'Knitting';

        $factory->update($validated);

        if ($request->has('knitting_types')) {
            $factory->knittingTypes()->sync($request->input('knitting_types', []));
        }

        return redirect()->route('factory.edit')->with('success', 'Factory information updated successfully.');
    }
}
