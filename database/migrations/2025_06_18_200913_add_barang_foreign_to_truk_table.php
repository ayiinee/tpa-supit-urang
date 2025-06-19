<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('truk', function (Blueprint $table) {
            // Drop foreign key kalau sudah pernah dibuat
            $table->dropColumn('barang');
        });

        Schema::table('truk', function (Blueprint $table) {
            $table->unsignedBigInteger('barang')->nullable()->after('kode_supplier');
            $table->foreign('barang')->references('id')->on('sampah')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('truk', function (Blueprint $table) {
            $table->dropForeign(['barang']);
            $table->dropColumn('barang');
            $table->string('barang', 255)->nullable(); // balikin ke sebelumnya
        });
    }
};
