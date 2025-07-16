<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        Supplier::create([
            'kode_supplier' => 'SUP01',
            'nama_supplier' => 'TPS Desa Maju',
            'alamat'        => 'Jl. Raya Maju No. 1',
        ]);

        Supplier::create([
            'kode_supplier' => 'SUP02',
            'nama_supplier' => 'TPS Kecamatan Jaya',
            'alamat'        => 'Jl. Raya Jaya No. 2',
        ]);
    }
}
