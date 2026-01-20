<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PortController extends Controller
{
    /**
     * Show the port settings page
     */
    public function index()
    {
        $currentPorts = [
            'left' => Setting::get('port_left', ''),
            'right' => Setting::get('port_right', ''),
            'cctv_ip' => Setting::get('cctv_ip', ''),
        ];

        return Inertia::render('settings/port', [
            'currentPorts' => $currentPorts
        ]);
    }

    /**
     * Get available ports from the Python service
     */
    public function getAvailablePorts()
    {
        try {
            $response = Http::timeout(5)->get('http://localhost:5001/api/available-ports');

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                return response()->json(['error' => 'Gagal mengambil data port'], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to get available ports: ' . $e->getMessage());
            return response()->json(['error' => 'Service tidak tersedia'], 503);
        }
    }

    /**
     * Set the selected ports
     */
    public function setPorts(Request $request)
    {
        $validated = $request->validate([
            'left' => 'required|string',
            'right' => 'nullable|string',
            'cctv_ip' => 'nullable|string|max:255',
        ]);
        
        Log::info('Set ports request:', $validated);

        try {
            // Send to Python service
            $payload = [
                'left' => $validated['left'],
            ];

            if (!empty($validated['right'])) {
                $payload['right'] = $validated['right'];
            }

            $response = Http::timeout(10)->post('http://localhost:5001/api/start-listener', $payload);

            if ($response->successful()) {
                // Save to database for persistence
                Setting::set('port_left', $validated['left'], 'string', 'Left sensor port configuration');
                Setting::set('port_right', $validated['right'] ?? '', 'string', 'Right sensor port configuration');
                Setting::set('cctv_ip', $validated['cctv_ip'] ?? '', 'string', 'CCTV camera IP address');
                
                Log::info('Port settings saved to database', $validated);
                
                return back()->with('success', 'Port berhasil disimpan');
            } else {
                return back()->withErrors(['error' => 'Gagal setting port']);
            }
        } catch (\Exception $e) {
            Log::error('Failed to set ports: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Service tidak tersedia']);
        }
    }

    /**
     * Get current port settings
     */
    public function getCurrentPorts()
    {
        return response()->json([
            'left' => Setting::get('port_left', ''),
            'right' => Setting::get('port_right', ''),
            'cctv_ip' => Setting::get('cctv_ip', ''),
        ]);
    }
}
