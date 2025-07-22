<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RealtimeController extends Controller
{
    public function updateBerat(Request $request)
    {
        $berat = $request->input('berat');
        Cache::put('live-weight', $berat, now()->addSeconds(5));
        return response()->json(['success' => true]);
    }

    public function getBerat()
    {
        return response()->json([
            'berat' => Cache::get('live-weight', 0)
        ]);
    }

    public function getAvailablePorts()
    {
        $response = Http::get('http://localhost:5001/api/available-ports');

        if ($response->successful()) {
            return response()->json($response->json());
        } else {
            return response()->json(['error' => 'Gagal mengambil data port'], 500);
        }
    }

    public function setPorts(Request $request)
    {
        $validated = $request->validate([
            'left' => 'required|string',
            // 'right' => 'required|string',
        ]);
        Log::info('Set ports request:', $validated);

        $response = Http::post('http://localhost:5001/api/start-listener', $validated);

        if ($response->successful()) {
            return response()->json(['status' => 'success']);
        } else {
            return response()->json(['error' => 'Gagal setting port'], 500);
        }
    }
}
