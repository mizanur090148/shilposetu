<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FactoryProfileController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;

// Public Subcontract Feed (Homepage & Feed)
Route::get('/', [FeedController::class, 'index'])->name('feed.index');
Route::get('/feed/{id}', [FeedController::class, 'show'])->name('feed.show');

// Public Vendor Directory & Profiles
Route::get('/vendors', [VendorController::class, 'index'])->name('vendors.index');
Route::get('/vendors/{id}', [VendorController::class, 'show'])->name('vendors.show');

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
});

require __DIR__.'/auth.php';
