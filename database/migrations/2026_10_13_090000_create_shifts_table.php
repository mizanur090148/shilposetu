<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 20)->unique();
            $table->time('start_time')->default('06:00:00');
            $table->time('end_time')->default('14:00:00');
            $table->decimal('duration_hours', 4, 1)->default(8.0);
            $table->string('description')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        // Insert default three shifts: শিফট A, শিফট B, শিফট C
        DB::table('shifts')->insert([
            [
                'name' => 'শিফট A',
                'code' => 'A',
                'start_time' => '06:00:00',
                'end_time' => '14:00:00',
                'duration_hours' => 8.0,
                'description' => 'সকাল ৬:০০ - দুপুর ২:০০ (মর্নিং শিফট)',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'শিফট B',
                'code' => 'B',
                'start_time' => '14:00:00',
                'end_time' => '22:00:00',
                'duration_hours' => 8.0,
                'description' => 'দুপুর ২:০০ - রাত ১০:০০ (ইভনিং শিফট)',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'শিফট C',
                'code' => 'C',
                'start_time' => '22:00:00',
                'end_time' => '06:00:00',
                'duration_hours' => 8.0,
                'description' => 'রাত ১০:০০ - সকাল ৬:০০ (নাইট শিফট)',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
