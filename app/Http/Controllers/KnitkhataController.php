<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KnitkhataController extends Controller
{
    /**
     * Display the Knitkhata Industrial Factory Floor Dashboard.
     * Only authenticated users can access this page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $factory = $user->factory;

        return Inertia::render('Knitkhata/Index', [
            'factory' => $factory,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }
}
