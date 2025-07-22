<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SampahSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sampah')->insert([
            ['jenis_sampah' => 'SAMPAH ORGANIK - COMPOSTING', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'SAMPAH ANORGANIK - SORTING', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'SAMPAH CAMPUR - LANDFILL', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
