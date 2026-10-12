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
        Schema::table('subcontract_posts', function (Blueprint $table) {
            $table->foreignId('accepted_factory_id')
                ->nullable()
                ->after('factory_id')
                ->constrained('factories')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subcontract_posts', function (Blueprint $table) {
            $table->dropForeign(['accepted_factory_id']);
            $table->dropColumn('accepted_factory_id');
        });
    }
};
