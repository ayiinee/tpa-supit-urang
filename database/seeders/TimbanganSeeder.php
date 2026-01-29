<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Truk;

class TimbanganSeeder extends Seeder
{
    public function run(): void
    {
        $tanggal = Carbon::now();
        $prefix = $tanggal->format('ymd'); // contoh: 250614
        $noTiket = $prefix . '01'; // hasil: 25061401
        $truk = Truk::query()->first();

        if (!$truk) {
            return;
        }

        DB::table('timbangan')->insert([
            'no_tiket' => $noTiket,
            'tanggal' => $tanggal,
            'no_polisi' => $truk->no_polisi,
            'no_lambung' => $truk->no_lambung,
            'nama_supir' => $truk->nama_supir ?? 'Supir',
            'id_sampah' => 1,
            'berat_masuk' => 120.5,
            'berat_keluar' => 100.2,
            'netto' => 20.3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
