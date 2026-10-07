<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FactoryController;
use App\Http\Controllers\FactoryProfileController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;

// Public Subcontract Feed (Homepage & Feed)
Route::get('/', [FeedController::class, 'index'])->name('feed.index');
Route::get('/feed/{id}', [FeedController::class, 'show'])->name('feed.show');

// Public Factory Directory & Profiles
Route::get('/factories', [FactoryController::class, 'index'])->name('factories.index');
Route::get('/factories/{id}', [FactoryController::class, 'show'])->name('factories.show');

// Legacy URL redirects and alias support
Route::redirect('/vendors', '/factories', 301)->name('vendors.index');
Route::get('/vendors/{id}', function ($id) {
    return redirect()->route('factories.show', ['id' => $id], 301);
})->name('vendors.show');

// SaaS Subscription Plans
Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');

// Authenticated Routes
Route::middleware('auth')->group(function () {
    // Gated Actions Requiring Verified/Active Account
    Route::middleware('account.active')->group(function () {
        // Create Subcontract Post
        Route::post('/feed', [FeedController::class, 'store'])->name('feed.store');

        // Submit Quotation Bid
        Route::post('/quotations/{postId}', [QuotationController::class, 'store'])->name('quotations.store');

        // Withdraw Quotation Bid
        Route::delete('/quotations/{id}', [QuotationController::class, 'destroy'])->name('quotations.destroy');

        // Update Quotation Status (Accept/Reject by Post Owner)
        Route::patch('/quotations/{id}/status', [QuotationController::class, 'updateStatus'])->name('quotations.status');
    });

    Route::get('/quotations/{postId}/compare', [QuotationController::class, 'compare'])->name('quotations.compare');

    // Subscription Payment
    Route::post('/subscription/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscription.subscribe');

    // Industrial SaaS Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Factory Profile Information Management
    Route::get('/factory/profile', [FactoryProfileController::class, 'edit'])->name('factory.edit');
    Route::patch('/factory/profile', [FactoryProfileController::class, 'update'])->name('factory.update');

    // In-App Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead');
});

require __DIR__.'/auth.php';
