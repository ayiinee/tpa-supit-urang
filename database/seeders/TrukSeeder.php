<?php

namespace Database\Seeders;

use App\Models\Truk;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrukSeeder extends Seeder
{
    public function run(): void
    {

        Truk::create([
            'no_polisi'     => 'N 1234 ABC',
            'no_lambung'    => 'TRK01',
            'password'      => 'password01',
            'kode_supplier' => 'SUP01',
            'barang'        => 'Sampah Organik',
            'nama_supir'    => 'Budi Santoso',
        ]);

        Truk::create([
            'no_polisi'     => 'L 5678 DEF',
            'no_lambung'    => 'TRK02',
            'password'      => 'password02',
            'kode_supplier' => 'SUP02',
            'barang'        => 'Sampah Plastik',
            'nama_supir'    => 'Agus Setiawan',
        ]);

        Truk::create([
            'no_polisi'     => 'W 9012 GHI',
            'no_lambung'    => 'TRK03',
            'password'      => 'password03',
            'kode_supplier' => 'SUP01',
            'barang'        => 'Sampah Kaca',
            'nama_supir'    => 'Siti Aminah',
        ]);
    }
}
