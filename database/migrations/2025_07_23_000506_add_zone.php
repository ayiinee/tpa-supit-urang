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
        //
        Schema::table('trackings', function (Blueprint $table) {
            $table->string('zone', 50)->after('id')->nullable();
        });
        
        Schema::create('zone_capacities', function (Blueprint $table) {
            $table->id();
            $table->string('zone_name', 50);
            $table->integer('max_capacity');
            $table->timestamps(); // otomatis buat created_at & updated_at
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('trackings', function (Blueprint $table) {
            $table->dropColumn('zone');
        });
        Schema::dropIfExists('zone_capacities');

    }
};
