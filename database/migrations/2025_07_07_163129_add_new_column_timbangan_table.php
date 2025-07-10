<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
        // DB::table('truk')
        //     ->whereNull('no_lambung')
        //     ->orWhere('no_lambung', '')
        //     ->delete();
        
        // Schema::table('timbangan', function (Blueprint $table) {
        //     // $table->dropColumn('no_lambung');
        //     // $table->string('no_lambung')->unique(true)->after('no_polisi')->foreign('no_lambung')
        //     //     ->references('no_lambung')->on('truk')->onDelete('cascade');
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
