<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Truk extends Authenticatable
{
    use HasFactory, Notifiable;
    protected $table = 'truk';

    protected $fillable = [
        'no_polisi',
        'no_lambung',
        'kode_supplier',
        'barang',
        'nama_supir',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => Hash::make($value),
        );
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'kode_supplier', 'kode_supplier');
    }

    public function sampah()
    {
        return $this->belongsTo(Sampah::class, 'barang', 'id');
    }

    // public function timbangans()
    // {
    //     return $this->hasMany(Timbangan::class, 'no_polisi', 'no_polisi');
    //     return $this->hasMany(Timbangan::class, 'no_lambung', 'no_lambung');
    // }
}
