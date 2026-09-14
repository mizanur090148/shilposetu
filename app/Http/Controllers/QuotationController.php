<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Models\SubcontractPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotationController extends Controller
{
    /**
     * Submit a quotation bid on a subcontract post.
     */
    public function store(Request $request, int $postId): RedirectResponse
    {
        $post = SubcontractPost::findOrFail($postId);

        $validated = $request->validate([
            'offered_unit_price' => 'required|numeric|min:0.01',
            'offered_lead_days' => 'required|integer|min:1',
            'note' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $factory = $user->factory;

        $totalCost = $validated['offered_unit_price'] * $post->target_quantity;

        Quotation::create([
            'subcontract_post_id' => $post->id,
            'bidder_user_id' => $user->id,
            'bidder_factory_id' => $factory ? $factory->id : null,
            'offered_unit_price' => $validated['offered_unit_price'],
            'offered_lead_days' => $validated['offered_lead_days'],
            'offered_total_cost' => $totalCost,
            'note' => $validated['note'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Your quotation has been submitted successfully to the factory!');
    }

    /**
     * Compare all quotations submitted for a specific subcontract order.
     */
    public function compare(Request $request, int $postId): Response
    {
        $post = SubcontractPost::with([
            'quotations.bidderFactory',
            'quotations.bidderUser:id,name,customer_id,phone',
        ])->findOrFail($postId);

        return Inertia::render('Quotations/Compare', [
            'post' => $post,
            'quotations' => $post->quotations,
        ]);
    }
}
