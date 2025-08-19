<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tracking;

class deleteTracking extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Jalankan pakai: php artisan app:delete-tracking
     */
    protected $signature = 'app:delete-tracking';

    /**
     * Deskripsi perintah
     */
    protected $description = 'Menghapus data tracking yang lebih dari 5 hari';

    /**
     * Logika eksekusi perintah
     */
    public function handle()
    {
        $deleted = Tracking::where('created_at', '<', now()->subDays(5))->delete();

        $this->info("Selesai. Total data yang dihapus: {$deleted}");
    }
}
