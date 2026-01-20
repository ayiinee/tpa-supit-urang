<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Supplier;
use Rap2hpoutre\FastExcel\FastExcel;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        DB::table('supplier')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        $path = storage_path('db/SUPP.xlsx');

        // Lewati 3 baris pertama (header di baris ke-4)
        $rows = (new FastExcel)->withoutHeaders()->import($path)->skip(3);

        $counter = 1;
        foreach ($rows as $line) {
            // Pastikan kolom sesuai urutan di Excel
            $namaSupplier = $line[1] ?? null;
            $alamat = $line[2] ?? null;

            if (!$namaSupplier) continue;

            Supplier::create([
                'kode_supplier' => 'SUP' . str_pad($counter, 3, '0', STR_PAD_LEFT),
                'nama_supplier' => $namaSupplier,
                'alamat'        => $alamat,
            ]);

            $counter++;
        }
    }
}
