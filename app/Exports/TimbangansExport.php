<?php

namespace App\Exports;

use App\Models\Timbangan;

class TimbangansExport
{
    public function export(array $filters = [])
    {
        $query = Timbangan::with(['sampah', 'truk'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('no_tiket', 'desc');

        if (!empty($filters['year'])) {
            $query->whereYear('tanggal', $filters['year']);
        }

        if (!empty($filters['month'])) {
            $query->whereMonth('tanggal', $filters['month']);
        }

        if (!empty($filters['day'])) {
            $query->whereDay('tanggal', $filters['day']);
        }

        $timbangans = $query->get();

        $data = [];
        
        // Add headers
        $data[] = [
            'No Tiket',
            'Tanggal',
            'No Polisi',
            'No Lambung',
            'Nama Supir',
            'Jenis Sampah',
            'Berat Masuk (kg)',
            'Berat Keluar (kg)',
            'Netto (kg)',
        ];

        // Add data rows
        foreach ($timbangans as $t) {
            $data[] = [
                $t->no_tiket,
                optional($t->tanggal)->format('Y-m-d'),
                $t->no_polisi,
                $t->no_lambung,
                $t->nama_supir,
                optional($t->sampah)->jenis_sampah,
                $t->berat_masuk,
                $t->berat_keluar,
                $t->netto,
            ];
        }

        return $data;
    }
}


