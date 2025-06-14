<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TimbanganSeeder extends Seeder
{
    public function run(): void
    {
        $tanggal = Carbon::now();
        $prefix = $tanggal->format('ymd'); // contoh: 250614
        $noTiket = $prefix . '01'; // hasil: 25061401

        DB::table('timbangan')->insert([
            'no_tiket' => $noTiket,
            'tanggal' => $tanggal,
            'no_polisi' => 'N1234AB',
            'nama_supir' => 'Pak Darman',
            'id_sampah' => 1,
            'berat_masuk' => 120.5,
            'berat_keluar' => 100.2,
            'netto' => 20.3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
