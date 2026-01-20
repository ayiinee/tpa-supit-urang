<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('timbangan')) {
            Schema::table('timbangan', function (Blueprint $table) {
                if (Schema::hasColumn('timbangan', 'tanggal')) {
                    $table->index('tanggal', 'timbangan_tanggal_idx');
                }
                if (Schema::hasColumn('timbangan', 'no_polisi') && Schema::hasColumn('timbangan', 'tanggal')) {
                    $table->index(['no_polisi', 'tanggal'], 'timbangan_no_polisi_tanggal_idx');
                }
                if (Schema::hasColumn('timbangan', 'no_lambung')) {
                    $table->index('no_lambung', 'timbangan_no_lambung_idx');
                }
                if (Schema::hasColumn('timbangan', 'id_sampah')) {
                    $table->index('id_sampah', 'timbangan_id_sampah_idx');
                }
            });
        }

        if (Schema::hasTable('trackings')) {
            Schema::table('trackings', function (Blueprint $table) {
                if (Schema::hasColumn('trackings', 'no_lambung')) {
                    $table->index('no_lambung', 'trackings_no_lambung_idx');
                }
                if (Schema::hasColumn('trackings', 'created_at')) {
                    $table->index('created_at', 'trackings_created_at_idx');
                }
                if (Schema::hasColumn('trackings', 'zone') && Schema::hasColumn('trackings', 'created_at')) {
                    $table->index(['zone', 'created_at'], 'trackings_zone_created_at_idx');
                }
                if (Schema::hasColumn('trackings', 'truck_id')) {
                    $table->index('truck_id', 'trackings_truck_id_idx');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('timbangan')) {
            Schema::table('timbangan', function (Blueprint $table) {
                if (Schema::hasColumn('timbangan', 'tanggal')) {
                    $table->dropIndex('timbangan_tanggal_idx');
                }
                if (Schema::hasColumn('timbangan', 'no_polisi') && Schema::hasColumn('timbangan', 'tanggal')) {
                    $table->dropIndex('timbangan_no_polisi_tanggal_idx');
                }
                if (Schema::hasColumn('timbangan', 'no_lambung')) {
                    $table->dropIndex('timbangan_no_lambung_idx');
                }
                if (Schema::hasColumn('timbangan', 'id_sampah')) {
                    $table->dropIndex('timbangan_id_sampah_idx');
                }
            });
        }

        if (Schema::hasTable('trackings')) {
            Schema::table('trackings', function (Blueprint $table) {
                if (Schema::hasColumn('trackings', 'no_lambung')) {
                    $table->dropIndex('trackings_no_lambung_idx');
                }
                if (Schema::hasColumn('trackings', 'created_at')) {
                    $table->dropIndex('trackings_created_at_idx');
                }
                if (Schema::hasColumn('trackings', 'zone') && Schema::hasColumn('trackings', 'created_at')) {
                    $table->dropIndex('trackings_zone_created_at_idx');
                }
                if (Schema::hasColumn('trackings', 'truck_id')) {
                    $table->dropIndex('trackings_truck_id_idx');
                }
            });
        }
    }
};
