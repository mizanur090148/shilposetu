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
        Schema::create('subcontract_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('factory_id')->nullable()->constrained('factories')->nullOnDelete();
            $table->enum('post_type', ['DEMAND', 'SUPPLY'])->default('DEMAND')->index();
            $table->string('category', 50)->index(); // knitting, sewing_production, fabric_dyeing, yarn_dyeing, print, embroidery, washing, finishing
            $table->string('title');
            $table->unsignedBigInteger('target_quantity');
            $table->string('unit', 30)->default('pcs'); // pcs, kg, dozen, yards
            $table->decimal('target_rate', 10, 2)->nullable();
            $table->boolean('rate_negotiable')->default(true);
            $table->date('deadline')->nullable();
            $table->string('district', 100)->nullable()->index();
            $table->string('address')->nullable();
            $table->text('description')->nullable();
            $table->json('specs')->nullable(); // dynamic JSON specs according to category
            $table->string('tech_pack_file')->nullable();
            $table->json('product_images')->nullable();
            $table->boolean('is_urgent')->default(false)->index();
            $table->string('status', 20)->default('open')->index(); // open, in_progress, completed, closed
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subcontract_posts');
    }
};
