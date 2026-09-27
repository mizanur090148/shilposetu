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
     * Submit or revise a quotation bid on a subcontract post.
     */
    public function store(Request $request, int $postId): RedirectResponse
    {
        $post = SubcontractPost::findOrFail($postId);

        // Check if order has already been awarded
        $hasAccepted = Quotation::where('subcontract_post_id', $post->id)
            ->where('status', 'accepted')
            ->exists();

        if ($hasAccepted) {
            return back()->with('error', 'This subcontract order has already been awarded to a factory.');
        }

        $validated = $request->validate([
            'offered_unit_price' => 'required|numeric|min:0.01',
            'offered_lead_days' => 'required|integer|min:1|max:365',
            'note' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $factory = $user->factory;

        if ($user->id === $post->user_id) {
            return back()->with('error', 'You cannot bid on your own subcontract post.');
        }

        $totalCost = round($validated['offered_unit_price'] * $post->target_quantity, 2);

        $existing = Quotation::where('subcontract_post_id', $post->id)
            ->where('bidder_user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->update([
                'bidder_factory_id' => $factory ? $factory->id : null,
                'offered_unit_price' => $validated['offered_unit_price'],
                'offered_lead_days' => $validated['offered_lead_days'],
                'offered_total_cost' => $totalCost,
                'note' => $validated['note'] ?? null,
                'status' => 'pending',
            ]);

            return back()->with('success', 'Your quotation has been updated successfully!');
        }

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

    /**
     * Accept, reject or reset a quotation (post owner only).
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $quotation = Quotation::with('post')->findOrFail($id);

        if ($request->user()->id !== $quotation->post->user_id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,rejected',
        ]);

        if ($validated['status'] === 'accepted') {
            // Check if another quotation is already accepted for this post
            $alreadyAccepted = Quotation::where('subcontract_post_id', $quotation->subcontract_post_id)
                ->where('id', '!=', $quotation->id)
                ->where('status', 'accepted')
                ->exists();

            if ($alreadyAccepted) {
                return back()->with('error', 'Another quotation is already accepted for this order. Please revert the accepted bid first before accepting a different factory.');
            }

            $quotation->update([
                'status' => 'accepted',
            ]);

            if ($quotation->post->status === 'open') {
                $quotation->post->update(['status' => 'in_progress']);
            }

            return back()->with('success', 'Quotation accepted! You can now contact the factory directly to finalize the work order.');
        }

        if ($validated['status'] === 'pending') {
            $quotation->update([
                'status' => 'pending',
            ]);

            // If reverting, check if any other quotation is still accepted
            $otherAccepted = Quotation::where('subcontract_post_id', $quotation->subcontract_post_id)
                ->where('id', '!=', $quotation->id)
                ->where('status', 'accepted')
                ->exists();

            if (!$otherAccepted && $quotation->post->status === 'in_progress') {
                $quotation->post->update(['status' => 'open']);
            }

            return back()->with('success', 'Quotation status reverted to pending. All factories are now eligible for acceptance.');
        }

        // Rejected
        $quotation->update([
            'status' => 'rejected',
        ]);

        return back()->with('success', 'Quotation has been declined.');
    }

    /**
     * Withdraw/cancel quotation bid (bidder only).
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        $quotation = Quotation::findOrFail($id);

        if ($request->user()->id !== $quotation->bidder_user_id) {
            abort(403, 'Unauthorized action.');
        }

        $quotation->delete();

        return back()->with('success', 'Your quotation has been withdrawn.');
    }
}
