<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name','email','password','role','address','contact_number',
        'identity_document_path','identity_status','driver_status',
        'vehicle_type','vehicle_plate','seats'
    ];

    protected $hidden = ['password', 'remember_token', 'identity_document_path'];
    protected function casts(): array { return ['email_verified_at' => 'datetime', 'password' => 'hashed']; }
}
