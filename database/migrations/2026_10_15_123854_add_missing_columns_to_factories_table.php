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
        Schema::table('factories', function (Blueprint $table) {
            if (! Schema::hasColumn('factories', 'capabilities')) {
                $table->json('capabilities')->nullable()->after('is_verified');
            }
            if (! Schema::hasColumn('factories', 'production_capacities')) {
                $table->json('production_capacities')->nullable()->after('daily_capacity');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('factories', function (Blueprint $table) {
            if (Schema::hasColumn('factories', 'production_capacities')) {
                $table->dropColumn('production_capacities');
            }
            if (Schema::hasColumn('factories', 'capabilities')) {
                $table->dropColumn('capabilities');
            }
        });
    }
};
