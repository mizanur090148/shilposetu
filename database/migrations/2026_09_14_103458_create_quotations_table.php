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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subcontract_post_id')->constrained('subcontract_posts')->cascadeOnDelete();
            $table->foreignId('bidder_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('bidder_factory_id')->nullable()->constrained('factories')->nullOnDelete();
            $table->decimal('offered_unit_price', 10, 2);
            $table->unsignedInteger('offered_lead_days');
            $table->decimal('offered_total_cost', 12, 2)->nullable();
            $table->text('note')->nullable();
            $table->string('status', 20)->default('pending')->index(); // pending, accepted, rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
