<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'passenger_id', 'driver_id', 'passenger_name', 'address',
        'email', 'contact_number', 'passenger_count', 'pickup_location',
        'return_location', 'pickup_at', 'return_at', 'fare', 'status', 'notes'
    ];

    protected $casts = [
        'pickup_at' => 'datetime',
        'return_at' => 'datetime',
        'fare' => 'decimal:2',
    ];

    public function passenger() { return $this->belongsTo(User::class, 'passenger_id'); }
    public function driver() { return $this->belongsTo(User::class, 'driver_id'); }
}
