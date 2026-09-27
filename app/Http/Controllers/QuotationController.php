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

        $quotation->update([
            'status' => $validated['status'],
        ]);

        $statusMsg = match ($validated['status']) {
            'accepted' => 'Quotation accepted! You can now contact the factory directly to finalize the work order.',
            'rejected' => 'Quotation has been declined.',
            default => 'Quotation status updated to pending.',
        };

        return back()->with('success', $statusMsg);
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
