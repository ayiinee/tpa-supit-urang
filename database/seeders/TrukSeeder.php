<?php

namespace Database\Seeders;

use App\Models\Truk;
use App\Models\Supplier;
use App\Models\Sampah;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Rap2hpoutre\FastExcel\FastExcel;

class TrukSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('truk')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $path = storage_path('db/TRUK.xlsx');
        $rows = (new FastExcel)->withoutHeaders()->import($path)->skip(3);

        // 🔹 ambil semua supplier dan jenis sampah sebagai referensi
        $suppliers = Supplier::pluck('id', 'nama_supplier')->toArray();
        $sampah = Sampah::pluck('id', 'jenis_sampah')->toArray();

        $counter = 1;

        foreach ($rows as $line) {
            $noPolisi    = trim($line[0] ?? ''); // kolom A
            $namaSupplierExcel = trim($line[2] ?? ''); // kolom C
            $barangExcel = trim($line[3] ?? ''); // kolom D
            $namaSupir   = trim($line[4] ?? ''); // kolom E

            if (!$noPolisi || !$namaSupplierExcel) continue;

            $supplierId = $suppliers[$namaSupplierExcel] ?? null;

            $sampahId = $sampah[$barangExcel] ?? null;

            if (!$supplierId || !$sampahId) {
                dump("⚠️ Skip: {$noPolisi} | Supplier: {$namaSupplierExcel} | Barang: {$barangExcel}");
                continue;
            }

            Truk::create([
                'no_polisi'   => $noPolisi,
                'no_lambung'  => 'TRK' . str_pad($counter, 2, '0', STR_PAD_LEFT),
                'password'    => 'password' . str_pad($counter, 2, '0', STR_PAD_LEFT),
                'supplier_id' => $supplierId, // foreign key
                'sampah_id'   => $sampahId,   // foreign key
                'nama_supir'  => $namaSupir,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            $counter++;
        }

        echo "✅ TrukSeeder selesai. Total data: " . ($counter - 1) . PHP_EOL;
    }
}
