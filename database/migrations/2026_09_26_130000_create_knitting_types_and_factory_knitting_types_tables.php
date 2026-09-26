<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('knitting_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('factory_knitting_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->foreignId('knitting_type_id')->constrained('knitting_types')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['factory_id', 'knitting_type_id']);
        });

        // Seed initial standard knitting types
        $defaultTypes = [
            [
                'name' => 'Single Jersey',
                'slug' => 'single-jersey',
                'description' => 'Plain knit, Lycra / Spandex S/J, Slub S/J for T-shirts and tops',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rib Knit',
                'slug' => 'rib-knit',
                'description' => '1x1 Rib, 2x2 Rib, Drop Needle Rib, Flat Rib for trims, collars, cuffs',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Interlock',
                'slug' => 'interlock',
                'description' => 'Double knit smooth fabric on both sides for premium sportswear and tops',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fleece',
                'slug' => 'fleece',
                'description' => '2-End Fleece, 3-End Fleece, Polar Fleece for hoodies and sweatshirts',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pique & Lacoste',
                'slug' => 'pique-lacoste',
                'description' => 'Honeycomb / waffle texture, Single & Double Pique for Polo shirts',
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'French Terry',
                'slug' => 'french-terry',
                'description' => 'Looped back knit, Baby Terry for joggers, shorts, and activewear',
                'sort_order' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Flat Knit / Collar & Cuff',
                'slug' => 'flat-knit',
                'description' => 'Flatbed jacquard collars, tipping cuffs, rib bands, and full sweaters',
                'sort_order' => 7,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jacquard & Auto Stripe',
                'slug' => 'jacquard-stripe',
                'description' => 'Feeder engineering stripes, circular jacquard patterns, structured knits',
                'sort_order' => 8,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Waffle / Thermal Knit',
                'slug' => 'waffle-thermal',
                'description' => 'Textured honeycomb waffle grid knit for thermal underwear and casuals',
                'sort_order' => 9,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mesh & Eyelet',
                'slug' => 'mesh-eyelet',
                'description' => 'Breathable open-hole knit structures for sportswear and linings',
                'sort_order' => 10,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('knitting_types')->insert($defaultTypes);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factory_knitting_types');
        Schema::dropIfExists('knitting_types');
    }
};
