<?php

namespace App\Http\Controllers;

use App\Events\WeightUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RealtimeController extends Controller
{
    private function cacheStore()
    {
        return Cache::store('file');
    }

    private function normalizeSensor(?string $sensor): string
    {
        $sensor = strtoupper((string) $sensor);
        return $sensor !== '' ? $sensor : 'LEFT';
    }

    private function cacheKey(string $sensor): string
    {
        return 'live-weight-' . strtolower($sensor);
    }

    private function defaultWeightData(string $sensor): array
    {
        return [
            'berat' => 0,
            'sensor' => $sensor,
            'timestamp' => now()->toISOString(),
        ];
    }

    public function updateBerat(Request $request)
    {
        $validated = $request->validate([
            'berat' => 'required|numeric',
            'sensor' => 'nullable|string'
        ]);

        $berat = $validated['berat'];
        $sensor = $this->normalizeSensor($validated['sensor'] ?? 'LEFT');
        $currentTimestamp = now();

        // OPTIMIZED: Store all data in single cache entry with shorter timeout
        $weightData = [
            'berat' => $berat,
            'sensor' => $sensor,
            'timestamp' => $currentTimestamp->toISOString()
        ];
        $this->cacheStore()->put($this->cacheKey($sensor), $weightData, now()->addMilliseconds(500)); // 0.5 seconds

        // Broadcast real-time via WebSocket - always broadcast for real-time display
        broadcast(new WeightUpdated($berat, $sensor))->toOthers();

        return response()->json([
            'success' => true,
            'berat' => $berat,
            'sensor' => $sensor,
            'timestamp' => $currentTimestamp->toISOString(),
            'broadcasted' => true
        ]);
    }

    public function clearWeightCache()
    {
        $sensor = request()->input('sensor');
        $sensors = $sensor ? [$this->normalizeSensor($sensor)] : ['LEFT', 'RIGHT'];

        foreach ($sensors as $sensorName) {
            $this->cacheStore()->forget($this->cacheKey($sensorName));
            // Broadcast zero weight to indicate disconnection for this sensor
            broadcast(new WeightUpdated(0, $sensorName))->toOthers();
        }

        return response()->json([
            'success' => true,
            'message' => 'Weight cache cleared and disconnection broadcasted',
            'sensors' => $sensors,
        ]);
    }

    public function getBerat()
    {
        $sensor = request()->query('sensor');
        if ($sensor) {
            $sensorName = $this->normalizeSensor($sensor);
            $weightData = $this->cacheStore()->get($this->cacheKey($sensorName), $this->defaultWeightData($sensorName));
            return response()->json($weightData);
        }

        $left = $this->cacheStore()->get($this->cacheKey('LEFT'), $this->defaultWeightData('LEFT'));
        $right = $this->cacheStore()->get($this->cacheKey('RIGHT'), $this->defaultWeightData('RIGHT'));

        $latest = $left;
        if (!empty($right['timestamp']) && ($right['timestamp'] >= ($left['timestamp'] ?? ''))) {
            $latest = $right;
        }

        return response()->json([
            'berat' => $latest['berat'],
            'sensor' => $latest['sensor'],
            'timestamp' => $latest['timestamp'],
            'left' => $left,
            'right' => $right,
        ]);
    }

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

    public function setPorts(Request $request)
    {
        $validated = $request->validate([
            'left' => 'required|string',
            'right' => 'nullable|string',
        ]);
        
        Log::info('Set ports request:', $validated);

        try {
            $payload = [
                'left' => $validated['left'],
            ];

            if (!empty($validated['right'])) {
                $payload['right'] = $validated['right'];
            }

            $response = Http::timeout(10)->post('http://localhost:5001/api/start-listener', $payload);

            if ($response->successful()) {
                return response()->json(['status' => 'success']);
            } else {
                return response()->json(['error' => 'Gagal setting port'], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to set ports: ' . $e->getMessage());
            return response()->json(['error' => 'Service tidak tersedia'], 503);
        }
    }

    /**
     * WebSocket status endpoint
     */
    public function getWebSocketStatus()
    {
        return response()->json([
            'websocket_enabled' => true,
            'broadcast_driver' => config('broadcasting.default'),
            'reverb_host' => config('broadcasting.connections.reverb.options.host'),
            'reverb_port' => config('broadcasting.connections.reverb.options.port'),
            'app_key' => config('broadcasting.connections.reverb.key'),
        ]);
    }
}
