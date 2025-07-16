<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrukSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('truk')->insert([
            [
                'no_polisi' => 'N1234AB',
                'no_lambung' => 'L001',
                'kode_supplier' => 'SUP001',
                'barang' => '1',
                'nama_supir' => 'Pak Darman',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
