<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SampahSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Kosongkan tabel terlebih dahulu
        DB::table('sampah')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Isi ulang data sampah
        DB::table('sampah')->insert([
            ['jenis_sampah' => 'ORGANIK KE KOMPOSTING', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'REJECT COMPOSTING KE LANDFILL', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'RESIDU KOMPOS KE LANDFILL', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'RESIDU SORTING KE LANDFILL', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'SAMPAH CAMPUR', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'SAMPAH CAMPUR KE SEL BARU', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'SAMPAH CAMPUR KE SEL LAMA', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'SAMPAH CAMPUR KE SORTING', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'SAMPAH ORGANIK', 'created_at' => now(), 'updated_at' => now()],
            ['jenis_sampah' => 'SAMPAH TAMAN', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
