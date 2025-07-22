<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ZoneCapacitiesSeeder extends Seeder
{
    public function run()
    {
        DB::table('zone_capacities')->insert([
            ['zone_name' => 'Sorting Zone', 'max_capacity' => 200, 'created_at' => now(), 'updated_at' => now()],
            ['zone_name' => 'Composting Zone', 'max_capacity' => 200, 'created_at' => now(), 'updated_at' => now()],
            ['zone_name' => 'Sanitary Landfill', 'max_capacity' => 200, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}

