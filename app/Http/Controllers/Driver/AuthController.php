<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Truk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'nomor_lambung' => 'required|string',
            'password'      => 'required|string',
        ]);

        $truk = Truk::where('no_lambung', $request->nomor_lambung)->first();

        if (!$truk || !Hash::check($request->password, $truk->password)) {
            return response()->json([
                'message' => 'Nomor lambung atau password salah.'
            ], 401);
        }

        return response()->json([
            'message' => 'Login berhasil!',
            'truk'   => $truk,
        ]);
    }
}
