<?php

namespace App\Http\Controllers;

use App\Models\Factory;
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

        return Inertia::render('Factory/Edit', [
            'factory' => $factory,
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
            'trade_license_no' => ['nullable', 'string', 'max:100'],
            'tin_no' => ['nullable', 'string', 'max:100'],
            'bin_no' => ['nullable', 'string', 'max:100'],
            'capabilities' => ['nullable', 'array'],
            'capabilities.*' => ['string', 'max:100'],
        ]);

        $factory->update($validated);

        return redirect()->route('factory.edit')->with('success', 'Factory information updated successfully.');
    }
}
