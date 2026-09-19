<?php

namespace Database\Seeders;

use App\Models\Factory;
use App\Models\Quotation;
use App\Models\SubcontractPost;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ShilposetuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Primary Demo Factory Owner: Rahim Uddin
        $rahim = User::firstOrCreate(
            ['email' => 'rahim@shilposetu.com'],
            [
                'name' => 'Rahim Uddin',
                'customer_id' => 'S20241045',
                'phone' => '+8801705123456',
                'account_type' => 'factory',
                'status' => 'active',
                'phone_verified_at' => now(),
                'nid_number' => '19902692518000123',
                'is_subscribed' => true,
                'subscription_expires_at' => now()->addYear(),
                'password' => Hash::make('password'),
            ]
        );

        $rahimFactory = Factory::firstOrCreate(
            ['user_id' => $rahim->id],
            [
                'business_name' => 'Dhaka Knitwear & Composite Ltd.',
                'industry_type' => 'Knitting & RMG Composite',
                'contact_person' => 'Rahim Uddin',
                'phone' => '+8801705123456',
                'email' => 'rahim@shilposetu.com',
                'district' => 'Gazipur',
                'address' => 'Plot 45-48, Board Bazar, Gazipur Sadar',
                'total_lines' => 16,
                'total_machines' => 180,
                'daily_capacity' => '25,000 Pcs/Day',
                'trade_license_no' => 'TRAD/GZP/2023/8892',
                'tin_no' => '451298452310',
                'bin_no' => '002938174-0102',
                'is_verified' => true,
                'rating' => 4.85,
                'capabilities' => ['Single Jersey', 'Interlock', 'Fleece', 'Polo Sewing', 'Screen Printing'],
                'production_capacities' => [
                    'sewing' => [
                        'no_of_lines' => 16,
                        'per_line_capacity' => 1500,
                        'total_capacity_per_day' => 24000,
                        'rate' => 38.00,
                        'unit' => 'Pcs',
                    ],
                    'knitting' => [
                        [
                            'machine_type' => 'Circular Knitting Machine (Single Jersey)',
                            'no_of_machine' => 12,
                            'capacity_per_machine' => 450,
                            'total_capacity_per_day' => 5400,
                            'rate' => 22.00,
                            'unit_type' => 'Kg',
                        ],
                        [
                            'machine_type' => 'Circular Knitting Machine (Rib / Interlock)',
                            'no_of_machine' => 6,
                            'capacity_per_machine' => 380,
                            'total_capacity_per_day' => 2280,
                            'rate' => 25.00,
                            'unit_type' => 'Kg',
                        ],
                    ],
                    'yarn_dyeing' => [
                        [
                            'machine_type' => 'High Temperature Cone / Package Dyeing Machine',
                            'no_of_machine' => 4,
                            'capacity_per_machine' => 1200,
                            'total_capacity_per_day' => 4800,
                            'rate' => 65.00,
                            'unit_type' => 'Kg',
                        ],
                    ],
                    'fabric_dyeing' => [
                        [
                            'machine_type' => 'Eco Soft Flow Fabric Dyeing (Air/Jet)',
                            'no_of_machine' => 6,
                            'capacity_per_machine' => 2000,
                            'total_capacity_per_day' => 12000,
                            'rate' => 45.00,
                            'unit_type' => 'Kg',
                        ],
                    ],
                    'print' => [
                        [
                            'machine_type' => 'Automatic Oval Screen Printing Machine (12–18 Color)',
                            'no_of_machine' => 2,
                            'capacity_per_machine' => 4500,
                            'total_capacity_per_day' => 9000,
                            'rate' => 18.00,
                            'unit_type' => 'Pcs',
                        ],
                    ],
                    'embroidery' => [
                        [
                            'machine_type' => 'Multi-Head Computerized Embroidery (9/12 Needle)',
                            'no_of_machine' => 4,
                            'capacity_per_machine' => 1200,
                            'total_capacity_per_day' => 4800,
                            'rate' => 12.00,
                            'unit_type' => 'Pcs',
                        ],
                    ],
                ],
            ]
        );

        Subscription::firstOrCreate(
            ['user_id' => $rahim->id],
            [
                'registration_fee' => 100.00,
                'monthly_fee' => 50.00,
                'billing_cycle' => 'yearly',
                'status' => 'active',
                'payment_method' => 'bkash',
                'transaction_id' => 'BKH99382109',
                'starts_at' => now(),
                'expires_at' => now()->addYear(),
            ]
        );

        // 2. Artistic Design Ltd (Ashulia, Dhaka)
        $artisticUser = User::firstOrCreate(
            ['email' => 'contact@artisticdesign.com'],
            [
                'name' => 'Engr. Mizanur Rahman',
                'customer_id' => 'S202210201',
                'phone' => '+8801551200200',
                'account_type' => 'factory',
                'status' => 'active',
                'phone_verified_at' => now(),
                'is_subscribed' => true,
                'subscription_expires_at' => now()->addMonths(6),
                'password' => Hash::make('password'),
            ]
        );

        $artisticFactory = Factory::firstOrCreate(
            ['user_id' => $artisticUser->id],
            [
                'business_name' => 'Artistic Design Ltd.',
                'industry_type' => 'Woven & Knit Composite',
                'contact_person' => 'Engr. Mizanur Rahman',
                'phone' => '+8801551200200',
                'email' => 'contact@artisticdesign.com',
                'district' => 'Ashulia',
                'address' => '232-233 East Narashinshapur, Ashulia, Dhaka',
                'total_lines' => 34,
                'total_machines' => 450,
                'daily_capacity' => '50,000 Pcs/Day',
                'trade_license_no' => 'TRAD/DH/ASH/2021/412',
                'tin_no' => '129038475619',
                'bin_no' => '001928374-0101',
                'is_verified' => true,
                'rating' => 4.90,
                'capabilities' => ['Woven Shirts', 'Trousers', 'Knit Polo', 'Automated Cutting'],
            ]
        );

        // 3. Modern Washing Plant (Tongi, Gazipur)
        $washingUser = User::firstOrCreate(
            ['email' => 'info@modernwashing.com'],
            [
                'name' => 'Tareq Hasan',
                'customer_id' => 'S20231019',
                'phone' => '+8801712987654',
                'account_type' => 'factory',
                'status' => 'active',
                'phone_verified_at' => now(),
                'is_subscribed' => true,
                'password' => Hash::make('password'),
            ]
        );

        $washingFactory = Factory::firstOrCreate(
            ['user_id' => $washingUser->id],
            [
                'business_name' => 'Modern Washing Plant',
                'industry_type' => 'Industrial Washing & Dyeing',
                'contact_person' => 'Tareq Hasan',
                'phone' => '+8801712987654',
                'email' => 'info@modernwashing.com',
                'district' => 'Gazipur',
                'address' => 'Nishat Nagar, Tongi, Gazipur',
                'total_lines' => 8,
                'total_machines' => 40,
                'daily_capacity' => '30,000 Pcs/Day',
                'is_verified' => true,
                'rating' => 4.80,
                'capabilities' => ['Dry Process & Over Dyeing capability included', 'Enzyme Wash', 'PP Spray', 'Laser Whisker'],
            ]
        );

        // 4. Explore Garments Ltd (Mirzapur, Tangail)
        $exploreUser = User::firstOrCreate(
            ['email' => 'info@exploregarments.com'],
            [
                'name' => 'Golam Mostafa',
                'customer_id' => 'S20231092',
                'phone' => '+8801819234567',
                'account_type' => 'factory',
                'status' => 'active',
                'phone_verified_at' => now(),
                'is_subscribed' => false,
                'password' => Hash::make('password'),
            ]
        );

        Factory::firstOrCreate(
            ['user_id' => $exploreUser->id],
            [
                'business_name' => 'Explore Garments Ltd.',
                'industry_type' => 'Sewing & Assembly',
                'contact_person' => 'Golam Mostafa',
                'phone' => '+8801819234567',
                'email' => 'info@exploregarments.com',
                'district' => 'Tangail',
                'address' => 'Gorai, Mirzapur, Tangail',
                'total_lines' => 10,
                'total_machines' => 120,
                'daily_capacity' => '15,000 Pcs/Day',
                'is_verified' => true,
                'rating' => 4.70,
                'capabilities' => ['Basic T-Shirt', 'Tank Top', 'Hoodies'],
            ]
        );

        // 5. Ha-Meem Denim Mills Ltd
        $hameemUser = User::firstOrCreate(
            ['email' => 'subcontract@hameemgroup.com'],
            [
                'name' => 'Sajid Ahmed',
                'customer_id' => 'S20210081',
                'phone' => '+8801911334455',
                'account_type' => 'factory',
                'status' => 'active',
                'phone_verified_at' => now(),
                'is_subscribed' => true,
                'password' => Hash::make('password'),
            ]
        );

        Factory::firstOrCreate(
            ['user_id' => $hameemUser->id],
            [
                'business_name' => 'Ha-Meem Denim Mills Ltd.',
                'industry_type' => 'Denim & Woven',
                'contact_person' => 'Sajid Ahmed',
                'phone' => '+8801911334455',
                'email' => 'subcontract@hameemgroup.com',
                'district' => 'Gazipur',
                'address' => 'Sripur, Maona, Gazipur, Bangladesh',
                'total_lines' => 45,
                'total_machines' => 600,
                'daily_capacity' => '80,000 Pcs/Day',
                'is_verified' => true,
                'rating' => 4.95,
                'capabilities' => ['Heavy Denim', 'Twill', 'Chino', 'Automated Stitching'],
            ]
        );

        // 6. Subcontract Posts (Facebook-style Feed items)
        // Post 1: Urgent 10,000 Pcs Polo Shirt (DEMAND)
        $post1 = SubcontractPost::firstOrCreate(
            ['title' => 'Urgent: 10,000 Pcs 220 GSM Pique Polo - Sewing & Finishing Needed'],
            [
                'user_id' => $rahim->id,
                'factory_id' => $rahimFactory->id,
                'post_type' => 'DEMAND',
                'category' => 'sewing_production',
                'target_quantity' => 10000,
                'unit' => 'pcs',
                'target_rate' => 34.00,
                'rate_negotiable' => true,
                'deadline' => now()->addDays(20)->toDateString(),
                'district' => 'Gazipur',
                'address' => 'Board Bazar, Gazipur',
                'description' => 'We received an export shipment order for 10,000 pcs men polo shirts with rib collar and cuff. Our current sewing lines are fully booked for Zara orders until next month. Cut panels are ready, looking for an experienced factory in Gazipur/Ashulia for CMT (Sewing + Thread trimming + Ironing + Poly pack). Tech pack attached.',
                'specs' => [
                    'no_of_lines' => 6,
                    'per_line_capacity' => '1,200 Pcs/Day',
                    'total_capacity_day' => '7,200 Pcs/Day',
                    'item_type' => 'Men Pique Polo Shirt (220 GSM)',
                    'smv' => 16.5,
                    'quality_grade' => 'AQL 1.5 Export Standard',
                ],
                'is_urgent' => true,
                'status' => 'open',
                'views_count' => 342,
            ]
        );

        // Post 2: Knitting Machine Vacancy (SUPPLY)
        SubcontractPost::firstOrCreate(
            ['title' => 'Available Idle Capacity: 14 Circular Knitting Machines (Single Jersey & Rib)'],
            [
                'user_id' => $artisticUser->id,
                'factory_id' => $artisticFactory->id,
                'post_type' => 'SUPPLY',
                'category' => 'knitting',
                'target_quantity' => 25000,
                'unit' => 'kg',
                'target_rate' => 42.00,
                'rate_negotiable' => true,
                'deadline' => now()->addDays(45)->toDateString(),
                'district' => 'Ashulia',
                'address' => 'East Narashinshapur, Ashulia',
                'description' => 'We have 14 Mayer & Cie circular knitting machines open from next week due to early shipment completion. We can take subcontract knitting orders for Single Jersey (24G/28G, 30-34 inch dia), 1x1 Rib, and French Terry. Fast delivery guaranteed.',
                'specs' => [
                    'machine_type' => 'Circular Knitting (Mayer & Cie, Terrot)',
                    'machine_qty' => 14,
                    'capacity_per_machine' => '320 Kg/Day',
                    'total_capacity' => '4,480 Kg/Day',
                    'rate' => '42.00 BDT',
                    'unit' => 'Kg',
                    'gauge_range' => '20G, 24G, 28G',
                ],
                'is_urgent' => false,
                'status' => 'open',
                'views_count' => 512,
            ]
        );

        // Post 3: Denim Dry Process & Over Dyeing (DEMAND)
        SubcontractPost::firstOrCreate(
            ['title' => 'Need Washing Subcontract: 15,000 Pcs Heavy Denim (Dry Process & Over Dyeing)'],
            [
                'user_id' => $rahim->id,
                'factory_id' => $rahimFactory->id,
                'post_type' => 'DEMAND',
                'category' => 'washing',
                'target_quantity' => 15000,
                'unit' => 'pcs',
                'target_rate' => 55.00,
                'rate_negotiable' => true,
                'deadline' => now()->addDays(15)->toDateString(),
                'district' => 'Tongi',
                'address' => 'Tongi Industrial Area',
                'description' => 'Urgent washing requirement for 11.5 oz denim jeans. Processes include Hand Scrape, 3D Whisker, Resin spray, Tint wash, and Softener wash. Factories with sustainable ETP plants preferred.',
                'specs' => [
                    'process_capability' => 'Dry Process, Whisker, PP Spray & Over Dyeing',
                    'batch_size' => '2,500 Pcs/Day',
                    'total_capacity_day' => '3,000 Pcs/Day',
                    'rate' => '55.00 BDT',
                    'unit' => 'Pcs',
                ],
                'is_urgent' => true,
                'status' => 'open',
                'views_count' => 189,
            ]
        );

        // Post 4: All-over Screen Printing (DEMAND)
        SubcontractPost::firstOrCreate(
            ['title' => 'Subcontract Wanted: 12,000 Pcs Chest Pigment & Plastisol Screen Printing'],
            [
                'user_id' => $exploreUser->id,
                'post_type' => 'DEMAND',
                'category' => 'print',
                'target_quantity' => 12000,
                'unit' => 'pcs',
                'target_rate' => 18.00,
                'rate_negotiable' => false,
                'deadline' => now()->addDays(12)->toDateString(),
                'district' => 'Gazipur',
                'address' => 'Gazipur Sadar',
                'description' => '4-color chest print on 100% cotton combed yarn fabric. Panels already cut and numbered. Looking for a modern printing facility with cured drying tunnels.',
                'specs' => [
                    'no_of_machine' => 2,
                    'capacity_per_machine' => '3,000 Pcs/Day',
                    'total_capacity_day' => '6,000 Pcs/Day',
                    'print_type' => 'Plastisol & Rubber',
                    'rate' => '18.00 BDT',
                    'unit' => 'Pcs',
                ],
                'is_urgent' => false,
                'status' => 'open',
                'views_count' => 278,
            ]
        );

        // 7. Quotations on Post 1
        Quotation::firstOrCreate(
            [
                'subcontract_post_id' => $post1->id,
                'bidder_user_id' => $artisticUser->id,
            ],
            [
                'bidder_factory_id' => $artisticFactory->id,
                'offered_unit_price' => 32.50,
                'offered_lead_days' => 14,
                'offered_total_cost' => 325000.00,
                'note' => 'We can allocate 4 dedicated polo lines starting this Thursday. Quality guaranteed as per ISO/AQL 1.5 standards.',
                'status' => 'pending',
            ]
        );
    }
}
