<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Truk extends Model
{
    use HasFactory;

    protected $table = 'truk';

    protected $fillable = [
        'no_polisi',
        'kode_supplier',
        'barang',
        'nama_supir',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'kode_supplier', 'kode_supplier');
    }

    public function sampah()
    {
        return $this->belongsTo(Sampah::class, 'barang', 'id');
    }

    public function timbangans()
    {
        return $this->hasMany(Timbangan::class, 'no_polisi', 'no_polisi');
    }
}
