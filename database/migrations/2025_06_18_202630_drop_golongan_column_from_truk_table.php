<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('truk', function (Blueprint $table) {
            $table->dropColumn('golongan');
        });
    }

    public function down(): void
    {
        Schema::table('truk', function (Blueprint $table) {
            $table->string('golongan')->nullable(); // sesuaikan tipe awalnya
        });
    }
};
