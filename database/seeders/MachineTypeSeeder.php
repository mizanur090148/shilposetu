<?php

namespace Database\Seeders;

use App\Models\MachineType;
use Illuminate\Database\Seeder;

class MachineTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $machines = [
            // 1. Knitting
            [
                'category' => 'knitting',
                'name' => 'Circular Knitting Machine (Single Jersey)',
                'brand_or_model' => 'Fukuhara / Mayer & Cie',
                'default_unit' => 'Kg',
                'sort_order' => 1,
            ],
            [
                'category' => 'knitting',
                'name' => 'Circular Knitting Machine (Rib / Interlock)',
                'brand_or_model' => 'Terrot / Pai Lung',
                'default_unit' => 'Kg',
                'sort_order' => 2,
            ],
            [
                'category' => 'knitting',
                'name' => 'Circular Knitting Machine (3-End Fleece / Terry)',
                'brand_or_model' => 'Mayer & Cie / Santec',
                'default_unit' => 'Kg',
                'sort_order' => 3,
            ],
            [
                'category' => 'knitting',
                'name' => 'Flatbed Collar & Cuff Knitting Machine',
                'brand_or_model' => 'Shima Seiki / Stoll',
                'default_unit' => 'Pcs',
                'sort_order' => 4,
            ],
            [
                'category' => 'knitting',
                'name' => 'Jacquard Flatbed Sweater Knitting (7G/12G/14G)',
                'brand_or_model' => 'Shima Seiki / Stoll',
                'default_unit' => 'Pcs',
                'sort_order' => 5,
            ],
            [
                'category' => 'knitting',
                'name' => 'Seamless Body Size Knitting Machine',
                'brand_or_model' => 'Santoni SM8',
                'default_unit' => 'Pcs',
                'sort_order' => 6,
            ],

            // 2. Yarn Dyeing
            [
                'category' => 'yarn_dyeing',
                'name' => 'High Temperature Cone / Package Dyeing Machine',
                'brand_or_model' => 'Fongs / Thies',
                'default_unit' => 'Kg',
                'sort_order' => 1,
            ],
            [
                'category' => 'yarn_dyeing',
                'name' => 'Hank Dyeing Machine',
                'brand_or_model' => 'Loris Bellini',
                'default_unit' => 'Kg',
                'sort_order' => 2,
            ],
            [
                'category' => 'yarn_dyeing',
                'name' => 'Space Dyeing / Multicolour Yarn Machine',
                'brand_or_model' => 'Superba SpacePrint',
                'default_unit' => 'Kg',
                'sort_order' => 3,
            ],
            [
                'category' => 'yarn_dyeing',
                'name' => 'Cabinet / Skein Yarn Dyeing Machine',
                'brand_or_model' => 'Ilma / Fongs',
                'default_unit' => 'Kg',
                'sort_order' => 4,
            ],
            [
                'category' => 'yarn_dyeing',
                'name' => 'Hydro Extractor & Radio Frequency (RF) Dryer',
                'brand_or_model' => 'Stalam RF',
                'default_unit' => 'Kg',
                'sort_order' => 5,
            ],

            // 3. Fabric Dyeing
            [
                'category' => 'fabric_dyeing',
                'name' => 'Eco Soft Flow Fabric Dyeing (Air/Jet)',
                'brand_or_model' => 'Fongs / Sclavos / Thies',
                'default_unit' => 'Kg',
                'sort_order' => 1,
            ],
            [
                'category' => 'fabric_dyeing',
                'name' => 'High Temperature High Pressure (HTHP) Jet Dyeing',
                'brand_or_model' => 'Dilmenler / Canlar',
                'default_unit' => 'Kg',
                'sort_order' => 2,
            ],
            [
                'category' => 'fabric_dyeing',
                'name' => 'Winch Dyeing Machine',
                'brand_or_model' => 'Tong Geng',
                'default_unit' => 'Kg',
                'sort_order' => 3,
            ],
            [
                'category' => 'fabric_dyeing',
                'name' => 'Jigger Dyeing Machine (Open Width)',
                'brand_or_model' => 'Henriksen / Mezzera',
                'default_unit' => 'Meter',
                'sort_order' => 4,
            ],
            [
                'category' => 'fabric_dyeing',
                'name' => 'Beam Dyeing Machine',
                'brand_or_model' => 'Morton / Thies',
                'default_unit' => 'Kg',
                'sort_order' => 5,
            ],
            [
                'category' => 'fabric_dyeing',
                'name' => 'Open-Width Stenter & Finishing Range',
                'brand_or_model' => 'Monforts / Brückner',
                'default_unit' => 'Meter',
                'sort_order' => 6,
            ],

            // 4. Print
            [
                'category' => 'print',
                'name' => 'Automatic Oval Screen Printing Machine (12–18 Color)',
                'brand_or_model' => 'M&R / ROQ Oval Pro',
                'default_unit' => 'Pcs',
                'sort_order' => 1,
            ],
            [
                'category' => 'print',
                'name' => 'Rotary Screen Printing Machine (All-Over Print)',
                'brand_or_model' => 'Zimmer / Reggiani',
                'default_unit' => 'Meter',
                'sort_order' => 2,
            ],
            [
                'category' => 'print',
                'name' => 'Carousel / Flatbed Screen Printing (8–12 Head)',
                'brand_or_model' => 'M&R Sportsman / Anatol',
                'default_unit' => 'Pcs',
                'sort_order' => 3,
            ],
            [
                'category' => 'print',
                'name' => 'Digital Direct-to-Garment (DTG) Industrial Printer',
                'brand_or_model' => 'Kornit Avalanche / Brother GTX',
                'default_unit' => 'Pcs',
                'sort_order' => 4,
            ],
            [
                'category' => 'print',
                'name' => 'Digital Roll-to-Roll Sublimation Printer',
                'brand_or_model' => 'Mimaki / Epson SureColor',
                'default_unit' => 'Yards',
                'sort_order' => 5,
            ],
            [
                'category' => 'print',
                'name' => 'Hydraulic Heat Transfer & Foil Press Range',
                'brand_or_model' => 'Monti Antonio / Siser',
                'default_unit' => 'Pcs',
                'sort_order' => 6,
            ],

            // 5. Embroidery
            [
                'category' => 'embroidery',
                'name' => 'Multi-Head Computerized Embroidery (9/12 Needle)',
                'brand_or_model' => 'Tajima / Barudan',
                'default_unit' => 'Pcs',
                'sort_order' => 1,
            ],
            [
                'category' => 'embroidery',
                'name' => 'High-Speed Multi-Head Computerized Embroidery (15 Needle)',
                'brand_or_model' => 'Tajima TMAR / Barudan BEXS',
                'default_unit' => 'Pcs',
                'sort_order' => 2,
            ],
            [
                'category' => 'embroidery',
                'name' => 'Chenille & Chain Stitch Mixed Embroidery Machine',
                'brand_or_model' => 'Tajima TCMX / SWF',
                'default_unit' => 'Pcs',
                'sort_order' => 3,
            ],
            [
                'category' => 'embroidery',
                'name' => 'Sequin, Cording & Beading Attachment Embroidery',
                'brand_or_model' => 'Tajima / Ricoma',
                'default_unit' => 'Pcs',
                'sort_order' => 4,
            ],
            [
                'category' => 'embroidery',
                'name' => 'Single-Head Sampling & Monogramming Machine',
                'brand_or_model' => 'Brother PR / HappyJapan',
                'default_unit' => 'Pcs',
                'sort_order' => 5,
            ],
        ];

        foreach ($machines as $item) {
            MachineType::updateOrCreate(
                [
                    'category' => $item['category'],
                    'name' => $item['name'],
                ],
                [
                    'brand_or_model' => $item['brand_or_model'],
                    'default_unit' => $item['default_unit'],
                    'sort_order' => $item['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
