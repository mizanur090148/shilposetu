<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('registration_fee', 10, 2)->default(100.00);
            $table->decimal('monthly_fee', 10, 2)->default(50.00);
            $table->string('billing_cycle', 20)->default('monthly'); // monthly, yearly
            $table->string('status', 20)->default('active')->index(); // active, expired, pending
            $table->string('payment_method', 30)->default('bkash'); // bkash, nagad, sslcommerz, bank
            $table->string('transaction_id', 100)->nullable();
            $table->timestamp('starts_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
