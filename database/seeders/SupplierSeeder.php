<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('supplier')->insert([
            [
                'kode_supplier' => 'SUP001',
                'nama_supplier' => 'CV Sumber Rejeki',
                'alamat' => 'Jl. Mawar No. 12',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
