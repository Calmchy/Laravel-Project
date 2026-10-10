<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /** Aggregate role-scoped metrics for the dashboard cards and recent bookings. */
    public function show(Request $request)
    {
        $user = $request->user();
        $column = $user->role === 'driver' ? 'driver_id' : 'passenger_id';
        $base = Booking::where($column, $user->id);

        return response()->json([
            'total_bookings' => (clone $base)->count(),
            'pending_bookings' => (clone $base)->where('status', 'pending')->count(),
            'accepted_bookings' => (clone $base)->where('status', 'accepted')->count(),
            'completed_bookings' => (clone $base)->where('status', 'completed')->count(),
            'recent_bookings' => (clone $base)->with(['passenger:id,name', 'driver:id,name'])->latest()->limit(5)->get(),
        ]);
    }
}
