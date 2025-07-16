<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tracking extends Model
{
    use HasFactory;

    protected $table = 'trackings';

    protected $fillable = [
        'truck_id',
        'latitude',
        'longitude',
        'recorded_at',
    ];
}
