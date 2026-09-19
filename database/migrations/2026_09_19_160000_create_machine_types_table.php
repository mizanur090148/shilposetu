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
        Schema::create('machine_types', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index(); // 'knitting', 'yarn_dyeing', 'fabric_dyeing', 'print', 'embroidery'
            $table->string('name');
            $table->string('brand_or_model')->nullable();
            $table->string('default_unit')->default('Kg'); // e.g. 'Kg', 'Pcs', 'Yards'
            $table->boolean('is_active')->default(true)->index();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_types');
    }
};
