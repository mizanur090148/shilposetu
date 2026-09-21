<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->status === 'suspended') {
            return back()->with('error', 'Your account has been suspended. Please contact platform support.');
        }

        if ($user->status === 'pending') {
            return back()->with('error', 'Your factory account is currently pending administrator approval. You can post and bid once approved.');
        }

        return $next($request);
    }
}
