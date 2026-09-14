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
        Schema::create('factories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->string('industry_type')->default('Apparel & Garments');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('district')->nullable()->index(); // e.g. Gazipur, Ashulia, Dhaka
            $table->text('address')->nullable();
            $table->unsignedInteger('total_lines')->default(0); // e.g. 34 lines
            $table->unsignedInteger('total_machines')->default(0);
            $table->string('daily_capacity')->nullable();
            $table->string('trade_license_no')->nullable();
            $table->string('trade_license_file')->nullable();
            $table->string('tin_no')->nullable();
            $table->string('tin_file')->nullable();
            $table->string('bin_no')->nullable();
            $table->string('bin_file')->nullable();
            $table->string('nid_file')->nullable();
            $table->boolean('is_verified')->default(false)->index();
            $table->decimal('rating', 3, 2)->default(4.80);
            $table->json('capabilities')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factories');
    }
};
