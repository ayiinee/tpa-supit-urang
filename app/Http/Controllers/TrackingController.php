<?php

namespace App\Http\Controllers;

use App\Models\Tracking;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    // Endpoint Traccar ngirim POST ke sini
    public function store(Request $request)
    {
        Tracking::create([
            'no_lambung' => $request->get('deviceId'), // atau sesuaikan field jika beda
            'latitude' => $request->get('latitude'),
            'longitude' => $request->get('longitude'),
        ]);

        return response()->json(['status' => 'ok']);
    }

    // Ambil posisi terbaru tiap truk
    public function latest()
    {
        $positions = Tracking::select('no_lambung', 'latitude', 'longitude', 'created_at')
            ->latest('created_at')
            ->get()
            ->groupBy('no_lambung')
            ->map(function ($group) {
                return $group->first();
            })
            ->values();

        return response()->json($positions);
    }
}
