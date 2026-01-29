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
        $rows = (new FastExcel)->withoutHeaders()->import($path);

        $normalize = function ($value): string {
            $value = preg_replace('/\s+/', ' ', trim((string) $value));
            return strtoupper($value ?? '');
        };

        $suppliers = Supplier::all()
            ->mapWithKeys(fn ($item) => [$normalize($item->nama_supplier) => $item->kode_supplier])
            ->toArray();

        $sampah = Sampah::all()
            ->mapWithKeys(fn ($item) => [$normalize($item->jenis_sampah) => $item->id])
            ->toArray();

        $counter = 1;
        $seenNoPolisi = [];
        $rowIndex = 0;

        foreach ($rows as $line) {
            $rowIndex++;
            if ($rowIndex <= 4) {
                continue; // skip 3 baris awal + header
            }

            $noPolisi = $normalize($line[0] ?? ''); // kolom A
            $namaSupplierExcel = $normalize($line[2] ?? ''); // kolom C
            $barangExcel = $normalize($line[3] ?? ''); // kolom D
            $namaSupir = trim((string) ($line[4] ?? '')); // kolom E

            if (!$noPolisi || !$namaSupplierExcel) {
                continue;
            }

            if (isset($seenNoPolisi[$noPolisi])) {
                dump("Skip duplicate: {$noPolisi}");
                continue;
            }

            $kodeSupplier = $suppliers[$namaSupplierExcel] ?? null;
            $barangId = $sampah[$barangExcel] ?? null;

            if (!$kodeSupplier || !$barangId) {
                dump("Skip: {$noPolisi} | Supplier: {$namaSupplierExcel} | Barang: {$barangExcel}");
                continue;
            }

            Truk::create([
                'no_polisi' => $noPolisi,
                'no_lambung' => 'TRK' . str_pad((string) $counter, 3, '0', STR_PAD_LEFT),
                'password' => 'password' . str_pad((string) $counter, 3, '0', STR_PAD_LEFT),
                'kode_supplier' => $kodeSupplier,
                'barang' => $barangId,
                'nama_supir' => $namaSupir,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $seenNoPolisi[$noPolisi] = true;
            $counter++;
        }

        echo "TrukSeeder selesai. Total data: " . ($counter - 1) . PHP_EOL;
    }
}