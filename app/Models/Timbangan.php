<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timbangan extends Model
{
    use HasFactory;

    protected $table = 'timbangan';
    protected $primaryKey = 'no_tiket';
    public $incrementing = false; // karena bukan integer auto-increment
    protected $keyType = 'string';

    protected $fillable = [
        'no_tiket',
        'tanggal',
        'no_polisi',
        'no_lambung',
        'nama_supir',
        'id_sampah',
        'berat_masuk',
        'berat_keluar',
        'netto',

    ];

    public function truk()
    {
        return $this->belongsTo(Truk::class, 'no_polisi', 'no_polisi', 'no_lambung', 'no_lambung');

    }

    public function sampah()
    {
        return $this->belongsTo(Sampah::class, 'id_sampah');
    }
}

