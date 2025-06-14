<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SampahSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sampah')->insert([
            ['jenis_sampah' => 'Organik', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'Anorganik', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'B3', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
