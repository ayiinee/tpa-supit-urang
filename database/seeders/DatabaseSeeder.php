<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

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

        // Panggil seeder lain yang memang ada filenya
        $this->call([
            UserSeeder::class,
            SampahSeeder::class,
            SupplierSeeder::class,
            TrukSeeder::class,
            TimbanganSeeder::class,
            ZoneCapacitiesSeeder::class, 
        ]);

        Schema::enableForeignKeyConstraints();
    }
}
