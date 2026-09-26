<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\KnittingType;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $knittingTypes = KnittingType::active()->orderBy('sort_order')->get();

        return Inertia::render('Auth/Register', [
            'knittingTypes' => $knittingTypes,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'business_name' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:4096',
            'knitting_types' => 'nullable|array',
            'knitting_types.*' => 'integer',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $prefix = 'S';
        $customerId = $prefix.date('Y').str_pad((string) (User::count() + 101), 4, '0', STR_PAD_LEFT);

        $user = User::create([
            'customer_id' => $customerId,
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'account_type' => 'factory',
            'status' => 'pending',
            'is_subscribed' => false,
            'password' => Hash::make($request->password),
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('factory_logos', 'public');
            $adminStorage = base_path('../admin-silposetu/storage/app/public/factory_logos');
            if (is_dir(dirname($adminStorage))) {
                @mkdir($adminStorage, 0755, true);
                @copy(storage_path('app/public/'.$logoPath), $adminStorage.'/'.basename($logoPath));
            }
        }

        $factory = Factory::create([
            'user_id' => $user->id,
            'business_name' => $request->business_name,
            'logo' => $logoPath,
            'industry_type' => 'Knitting',
            'contact_person' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'district' => 'Gazipur',
            'is_verified' => false,
            'rating' => 5.0,
        ]);

        if (! empty($request->input('knitting_types'))) {
            $factory->knittingTypes()->sync($request->input('knitting_types'));
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('feed.index'))->with('success', "Welcome to Shilposetu! Your Customer ID is {$customerId}. Your factory account is currently pending admin approval.");
    }
}
