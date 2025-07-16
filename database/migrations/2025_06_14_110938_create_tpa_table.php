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
        Schema::create('sampah', function (Blueprint $table) {
            $table->id();
            $table->string('jenis_sampah', 50);
            $table->timestamps();
        });
        Schema::create('supplier', function (Blueprint $table) {
            $table->id();
            $table->string('kode_supplier', 20)->unique();
            $table->string('nama_supplier');
            $table->string('alamat');
            $table->timestamps();
        });
        Schema::create('truk', function (Blueprint $table) {
            $table->id();
            $table->string('no_polisi', 20)->unique();
            $table->string('no_lambung', 20)->unique(); // Kolom no_lambung opsional
            $table->string('kode_supplier', 20);
            $table->string('barang');
            $table->string('nama_supir');
            $table->timestamps();
            $table->foreign('kode_supplier')->references('kode_supplier')->on('supplier')->onDelete('cascade');
        });
        Schema::create('timbangan', function (Blueprint $table) {
            $table->string('no_tiket', 20)->primary();
            $table->date('tanggal');
            $table->string('no_polisi', 20);
            $table->string('no_lambung', 20); // Kolom no_lambung opsional
            $table->string('nama_supir');
            $table->unsignedBigInteger('id_sampah');
            $table->decimal('berat_masuk', 8, 2);
            $table->decimal('berat_keluar', 8, 2)->nullable();
            $table->decimal('netto', 8, 2)->nullable();
            $table->timestamps();
            $table->foreign('no_polisi')->references('no_polisi')->on('truk')->onDelete('cascade');
            $table->foreign('id_sampah')->references('id')->on('sampah')->onDelete('cascade');
            $table->foreign('no_lambung')->references('no_lambung')->on('truk')->onDelete('cascade');
        });
        

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sampah');
        Schema::dropIfExists('supplier');
        Schema::dropIfExists('truk');
        Schema::dropIfExists('timbangan');
    }
};
