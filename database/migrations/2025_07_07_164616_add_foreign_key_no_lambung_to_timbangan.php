<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('truk', function (Blueprint $table) {
            $table->string('no_lambung', 20)->unique()->after('id'); // sesuaikan 'after' jika perlu
        });

        Schema::table('truk', function (Blueprint $table) {
            $table->string('no_lambung', 20)->change();
        });
        // 1. Samakan tipe kolom (pastikan VARCHAR(20), sesuaikan jika berbeda)
        Schema::table('timbangan', function (Blueprint $table) {
            $table->string('no_lambung', 20)->change();
        });

        // 3. Hapus data orphan dari tabel timbangan (no_lambung yang tidak ada di truk)
        DB::statement("
            DELETE FROM timbangan
            WHERE no_lambung IS NOT NULL
              AND no_lambung NOT IN (
                  SELECT no_lambung FROM truk
              )
        ");

        // 4. Tambahkan foreign key dengan cascade
        Schema::table('timbangan', function (Blueprint $table) {
            $table->foreign('no_lambung')
                ->references('no_lambung')
                ->on('truk')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        // Hapus foreign key jika rollback
        Schema::table('timbangan', function (Blueprint $table) {
            $table->dropForeign(['no_lambung']);
        });

        // Hapus kolom no_lambung dari tabel truk
        Schema::table('truk', function (Blueprint $table) {
            $table->dropColumn('no_lambung');
        });
        // Hapus index dari truk
        Schema::table('truk', function (Blueprint $table) {
            $table->dropUnique('truk_no_lambung_unique');
        });
    }
};
