<?php

namespace App\Http\Controllers;

use App\Models\Tracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

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
            'zone'       => 'nullable|string', // tambahkan ini

        ]);

        // 2. Buat entri baru di tabel trackings
        Tracking::create([
            'no_lambung' => $validated['no_lambung'],
            'latitude'   => $validated['latitude'],
            'longitude'  => $validated['longitude'],
            'zone'       => $validated['zone'] ?? null, // simpan zona jika ada
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
        $latestPositions = Cache::remember('trackings.latest', now()->addSeconds(2), function () {
            $latestIds = DB::table('trackings')
                ->select('no_lambung', DB::raw('MAX(id) as max_id'))
                ->groupBy('no_lambung');

            return DB::table('trackings as t')
                ->joinSub($latestIds, 'latest', function ($join) {
                    $join->on('t.id', '=', 'latest.max_id');
                })
                ->select('t.no_lambung', 't.latitude', 't.longitude', 't.created_at')
                ->get();
        });

        return response()->json($latestPositions);
    }

    public function getZoneStats()
    {
        $zoneStats = Cache::remember('trackings.zone_stats', now()->addSeconds(10), function () {
            return DB::table('zone_capacities as zc')
                ->leftJoin(DB::raw('(
                    SELECT zone, COUNT(DISTINCT no_lambung) as current_trucks
                    FROM trackings 
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                    AND zone IS NOT NULL
                    GROUP BY zone
                ) as t'), 'zc.zone_name', '=', 't.zone')
                ->select(
                    'zc.zone_name',
                    'zc.max_capacity',
                    DB::raw('COALESCE(t.current_trucks, 0) as current_count')
                )
                ->get();
        });

        return response()->json($zoneStats);
    }

    public function deleteOldTrackings()
    {
        // Hapus data tracking yang lebih dari 1 bulan
        Tracking::where('created_at', '<', now()->subDays(7))->delete();

        return response()->json(['status' => 'success', 'message' => 'Old trackings deleted.']);
    }

}
