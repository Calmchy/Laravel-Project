<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Ride;
use App\Support\RidePresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RideController extends Controller
{
    /**
     * GET /rides : kept only so old links/bookmarks still work.
     * Searching now lives in the merged Bookings hub, so we forward the filters there.
     */
    public function index(Request $request): RedirectResponse
    {
        return redirect()->route('bookings.index', ['tab' => 'find'] + $request->only(['origin', 'destination', 'date']));
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
