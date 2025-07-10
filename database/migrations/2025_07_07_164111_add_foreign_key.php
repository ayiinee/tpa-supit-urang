<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Schema::table('timbangan', function (Blueprint $table) {
        //     // Hapus kolom no_lambung jika sudah ada
        //     if (Schema::hasColumn('timbangan', 'no_lambung')) {
        //         $table->dropColumn('no_lambung');
        //     }

        //     // Tambahkan kolom no_lambung dengan foreign key
        //     $table->string('no_lambung')->unique()->after('no_polisi');
        //     $table->foreign('no_lambung')->references('no_lambung')->on('truk')->onDelete('cascade');
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
