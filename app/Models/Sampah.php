<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sampah extends Model
{
    use HasFactory;

    protected $table = 'sampah';

    protected $fillable = [
        'jenis_sampah',
    ];

    public function timbangans()
    {
        return $this->hasMany(Timbangan::class, 'id_sampah');
    }
}
