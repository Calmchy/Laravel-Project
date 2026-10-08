<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** GET /dashboard : verification status and what needs the user's attention. No photo header. */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $latestId = $user->identityDocuments()->latest()->first();

        $upcoming = $user->bookings()->with(['ride.origin', 'ride.destination'])
            ->whereIn('status', [BookingStatus::Pending->value, BookingStatus::Approved->value, BookingStatus::Confirmed->value])
            ->latest()->limit(5)->get();

        $awaitingMe = Booking::whereHas('ride.vehicle', fn ($q) => $q->where('driver_id', $user->id))
            ->where('status', BookingStatus::Pending->value)->count();

        return Inertia::render('dashboard', [
            'id_status' => $latestId?->status->value,
            'awaiting_my_approval' => $awaitingMe,
            'upcoming' => $upcoming->map(fn (Booking $b) => [
                'id' => $b->id,
                'reference_no' => $b->reference_no,
                'status' => $b->status->value,
                'route' => $b->ride->origin->name.' → '.$b->ride->destination->name,
                'departure_at' => $b->ride->departure_at->toIso8601String(),
            ]),
        ]);
    }
}
