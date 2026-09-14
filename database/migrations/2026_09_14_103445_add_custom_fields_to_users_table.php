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
        Schema::table('users', function (Blueprint $table) {
            $table->string('customer_id', 30)->nullable()->unique()->after('id');
            $table->string('phone', 20)->nullable()->unique()->after('email');
            $table->string('account_type', 20)->default('factory')->after('phone'); // factory, buyer, admin
            $table->string('status', 20)->default('active')->after('account_type'); // active, pending_kyc, suspended
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
            $table->string('nid_number', 50)->nullable()->after('password');
            $table->boolean('is_subscribed')->default(false)->after('nid_number');
            $table->timestamp('subscription_expires_at')->nullable()->after('is_subscribed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'customer_id',
                'phone',
                'account_type',
                'status',
                'phone_verified_at',
                'nid_number',
                'is_subscribed',
                'subscription_expires_at',
            ]);
        });
    }
};
