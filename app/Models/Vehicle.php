<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'driver_id', 'model_id', 'color', 'plate_number',
        'seat_capacity', 'manufacture_year',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(DriverProfile::class, 'driver_id', 'user_id');
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    public function rides(): HasMany
    {
        return $this->hasMany(Ride::class);
    }
}
