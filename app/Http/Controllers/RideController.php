<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Review;
use App\Models\Ride;
use App\Support\RidePresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RideController extends Controller
{
    /** GET /rides : search by origin, destination and date. Every filter is validated, then bound by Eloquent (no raw SQL). */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'origin' => ['nullable', 'integer', 'exists:cities,id'],
            'destination' => ['nullable', 'integer', 'exists:cities,id'],
            'date' => ['nullable', 'date'],
        ]);

        $rides = Ride::with(RidePresenter::WITH)
            ->available()->withSeatsLeft()
            ->when($filters['origin'] ?? null, fn ($q, $v) => $q->where('origin_city_id', $v))
            ->when($filters['destination'] ?? null, fn ($q, $v) => $q->where('destination_city_id', $v))
            ->when($filters['date'] ?? null, fn ($q, $v) => $q->whereDate('departure_at', $v))
            ->orderBy('departure_at')
            ->simplePaginate(12)->withQueryString();

        return Inertia::render('rides/index', [
            'rides' => $rides->through(fn (Ride $r) => RidePresenter::card($r)),
            'cities' => City::orderBy('name')->get(['id', 'name']),
            'filters' => $filters,
        ]);
    }

    /** GET /rides/{ride} : detail page with the driver's average rating and the viewer's own booking, if any. */
    public function show(Request $request, Ride $ride): Response
    {
        $ride->load(RidePresenter::WITH);
        $driverId = $ride->vehicle->driver_id;

        // Average of what PASSENGERS said about this driver across all their trips.
        $rating = Review::where('reviewer_role', 'passenger')
            ->whereHas('booking.ride.vehicle', fn ($q) => $q->where('driver_id', $driverId))
            ->selectRaw('AVG(rating) as average, COUNT(*) as total')
            ->first();

        $user = $request->user();
        $mine = $user?->bookings()->where('ride_id', $ride->id)->first();

        return Inertia::render('rides/show', [
            'ride' => RidePresenter::card($ride) + [
                'notes' => $ride->notes,
                'status' => $ride->status->value,
            ],
            'driver_rating' => [
                'average' => $rating->total ? round((float) $rating->average, 1) : null,
                'total' => (int) $rating->total,
            ],
            'my_booking_id' => $mine?->id,
            'can_book' => $user !== null && $user->hasApprovedId() && $driverId !== $user->id,
            'has_approved_id' => $user?->hasApprovedId() ?? false,
        ]);
    }
}
