<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\User; // <-- TAMBAHKAN INI

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        // Truncate tabel-tabel
        \App\Models\Timbangan::truncate();
        \App\Models\Truk::truncate();
        \App\Models\Supplier::truncate();
        \App\Models\Sampah::truncate();
        User::truncate(); // <-- Gunakan model User

        // Buat user langsung di sini, seperti kodemu sebelumnya
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Panggil seeder lain yang memang ada filenya
        $this->call([
            SampahSeeder::class,
            SupplierSeeder::class,
            TrukSeeder::class,
            TimbanganSeeder::class,
            ZoneCapacitiesSeeder::class, 
        ]);

        Schema::enableForeignKeyConstraints();
    }
}
