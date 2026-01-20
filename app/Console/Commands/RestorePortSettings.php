<?php

namespace App\Console\Commands;

use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RestorePortSettings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ports:restore';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restore saved port settings to the Python service';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Restoring port settings...');

        $leftPort = Setting::get('port_left');
        $rightPort = Setting::get('port_right');

        if (!$leftPort && !$rightPort) {
            $this->warn('No saved port settings found.');
            return 0;
        }

        if ($leftPort) {
            $this->info("Found saved left port: {$leftPort}");
        }

        if ($rightPort) {
            $this->info("Found saved right port: {$rightPort}");
        }

        try {
            $payload = [];
            if ($leftPort) {
                $payload['left'] = $leftPort;
            }
            if ($rightPort) {
                $payload['right'] = $rightPort;
            }

            $response = Http::timeout(10)->post('http://localhost:5001/api/start-listener', $payload);

            if ($response->successful()) {
                $this->info('Port settings restored successfully!');
                Log::info('Port settings restored on startup', [
                    'left' => $leftPort,
                    'right' => $rightPort,
                ]);
            } else {
                $this->error('Failed to restore port settings to Python service');
                Log::error('Failed to restore port settings', ['response' => $response->body()]);
            }
        } catch (\Exception $e) {
            $this->error('Python service not available: ' . $e->getMessage());
            Log::error('Failed to restore port settings: ' . $e->getMessage());
        }

        return 0;
    }
}
