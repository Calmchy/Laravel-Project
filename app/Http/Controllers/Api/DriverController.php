<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class DriverController extends Controller
{
    /** Return only public driver details; never return ID document paths. */
    public function index()
    {
        return User::query()->where('role', 'driver')
            ->where('driver_status', 'approved')
            ->select(['id', 'name', 'vehicle_type', 'vehicle_plate', 'seats', 'driver_status'])
            ->paginate(20);
    }
}
