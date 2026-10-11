<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KnitkhataController extends Controller
{
    /**
     * Helper to render Knitkhata view with user context and initial tab.
     */
    private function renderKnitkhata(Request $request, string $tab, array $extra = []): Response
    {
        $user = $request->user();
        $factory = $user->factory;
        $role = $extra['role'] ?? (str_starts_with($tab, 'v') ? 'ven' : 'fac');

        return Inertia::render('Knitkhata/Index', array_merge([
            'factory' => $factory,
            'auth' => [
                'user' => $user,
            ],
            'initialTab' => $tab,
            'initialRole' => $role,
            'initialOrderId' => $extra['orderId'] ?? 'SC-2610-014',
        ], $extra));
    }

    public function index(Request $request): Response
    {
        return $this->dashboard($request);
    }

    public function dashboard(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'dash');
    }

    public function orders(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'orders');
    }

    public function orderDetail(Request $request, string $id): Response
    {
        return $this->renderKnitkhata($request, 'detail', ['orderId' => $id]);
    }

    public function entry(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'entry');
    }

    public function qc(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'qc');
    }

    public function accounts(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'acc');
    }

    public function attendance(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'att');
    }

    public function users(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'users');
    }

    public function whatsapp(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'wa');
    }

    public function planning(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'plan');
    }

    public function vendorOrders(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'vorders', ['role' => 'ven']);
    }

    public function vendorReport(Request $request): Response
    {
        return $this->renderKnitkhata($request, 'vreport', ['role' => 'ven']);
    }
}
