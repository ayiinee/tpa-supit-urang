<?php

namespace App\Http\Controllers;

use App\Models\Tracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrackingController extends Controller
{
    /**
     * Menyimpan data lokasi yang dikirim dari aplikasi sopir.
     */
    public function store(Request $request)
    {
        // 1. Validasi data yang masuk dari frontend
        $validated = $request->validate([
            'no_lambung' => 'required|string|exists:truk,no_lambung',
            'latitude'   => 'required|numeric',
            'longitude'  => 'required|numeric',
        ]);

        // 2. Buat entri baru di tabel trackings
        Tracking::create([
            'no_lambung' => $validated['no_lambung'],
            'latitude'   => $validated['latitude'],
            'longitude'  => $validated['longitude'],
        ]);

        // 3. Beri respons sukses
        return response()->json(['status' => 'success', 'message' => 'Location saved.']);
    }

    /**
     * Mengambil data posisi terakhir dari setiap truk untuk dashboard admin.
     * (Ini adalah fungsi dari temanmu yang sudah bagus dan kita pertahankan).
     */
    public function latest()
    {
        // Menggunakan query builder untuk efisiensi
        $latestPositions = DB::table('trackings')
            ->select('no_lambung', 'latitude', 'longitude', 'created_at')
            ->whereIn('id', function ($query) {
                $query->select(DB::raw('MAX(id)'))
                    ->from('trackings')
                    ->groupBy('no_lambung');
            })
            ->get();

        return response()->json($latestPositions);
    }
}
