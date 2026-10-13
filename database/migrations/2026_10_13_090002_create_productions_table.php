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
        Schema::create('productions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->foreignId('subcontract_post_id')->nullable()->constrained('subcontract_posts')->nullOnDelete();
            $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
            $table->string('machine_code', 50)->index();
            $table->foreignId('factory_shift_id')->nullable()->constrained('factory_shifts')->nullOnDelete();
            $table->string('shift_code', 20)->default('A')->index();
            $table->date('production_date')->index();
            $table->decimal('quantity_kg', 10, 2);
            $table->unsignedInteger('rolls_count')->default(0);
            $table->string('operator_name', 100)->nullable();
            $table->string('yarn_lot', 100)->nullable();
            $table->string('quality_issue', 100)->default('না');
            $table->text('notes')->nullable();
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['factory_id', 'production_date']);
            $table->index(['subcontract_post_id', 'production_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productions');
    }
};
