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
        Schema::create('quality_controls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->foreignId('subcontract_post_id')->nullable()->constrained('subcontract_posts')->nullOnDelete();
            $table->string('roll_no', 50)->index();
            $table->string('machine_code', 50)->index();
            $table->date('inspection_date')->index();
            $table->decimal('weight_kg', 10, 2);
            $table->string('status', 20)->default('ok')->index(); // 'ok', 'warn', 'bad'
            $table->string('issue_type', 150);
            $table->string('resolution', 150)->nullable();
            $table->string('inspector_name', 100)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['factory_id', 'inspection_date']);
            $table->index(['subcontract_post_id', 'inspection_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quality_controls');
    }
};
