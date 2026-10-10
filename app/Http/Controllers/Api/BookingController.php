<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Notifications\Notification;
use App\Notifications\NewRideBooking;

class BookingController extends Controller
{
    /** List bookings visible to the signed-in passenger or driver. */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Booking::with(['passenger:id,name,email', 'driver:id,name,email'])
            ->latest();

        if ($user->role === 'driver') $query->where('driver_id', $user->id);
        else $query->where('passenger_id', $user->id);

        return response()->json($query->paginate(20));
    }

    /** Validate and create a booking, then notify the selected driver. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'driver_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', 'driver')],
            'passenger_name' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:190'],
            'contact_number' => ['required', 'string', 'max:30'],
            'passenger_count' => ['required', 'integer', 'min:1', 'max:15'],
            'pickup_location' => ['required', 'string', 'max:255'],
            'return_location' => ['required', 'string', 'max:255'],
            'pickup_at' => ['required', 'date', 'after:now'],
            'return_at' => ['required', 'date', 'after:pickup_at'],
            'fare' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($request->user()->role === 'driver') {
            return response()->json(['message' => 'Driver accounts cannot book as passengers.'], 403);
        }

        $booking = DB::transaction(function () use ($data, $request) {
            $booking = Booking::create($data + [
                'passenger_id' => $request->user()->id,
                'reference' => 'RNP-' . strtoupper(Str::random(8)),
                'status' => 'pending',
            ]);
            $driver = User::findOrFail($data['driver_id']);
            $driver->notify(new NewRideBooking($booking));
            return $booking;
        });

        return response()->json($booking->load(['passenger:id,name,email', 'driver:id,name,email']), 201);
    }

    /** Let the assigned driver accept or decline; passengers can cancel their own pending booking. */
    public function updateStatus(Request $request, Booking $booking)
    {
        $data = $request->validate(['status' => ['required', Rule::in(['accepted', 'declined', 'cancelled', 'completed'])]]);
        $user = $request->user();
        $isAssignedDriver = $user->role === 'driver' && $booking->driver_id === $user->id;
        $isPassenger = $booking->passenger_id === $user->id;
        if (!$isAssignedDriver && !$isPassenger) abort(403);

        if ($isPassenger && !($booking->status === 'pending' && $data['status'] === 'cancelled')) abort(403);
        if ($isAssignedDriver && !in_array($data['status'], ['accepted', 'declined', 'completed'], true)) abort(403);

        $booking->update(['status' => $data['status']]);
        return response()->json($booking->fresh());
    }
}
