<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RealtimeController extends Controller
{
    public function updateBerat(Request $request)
    {
        $berat = $request->input('berat');
        Cache::put('live_weight', $berat, now()->addSeconds(5));
        return response()->json(['success' => true]);
    }

    public function getBerat()
    {
        return response()->json([
            'berat' => Cache::get('live_weight', 0)
        ]);
    }
}
