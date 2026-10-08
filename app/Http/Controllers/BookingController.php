<?php

namespace App\Http\Controllers;

use App\Actions\Bookings\ReserveSeat;
use App\Actions\Bookings\TransitionBooking;
use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Ride;
use App\Support\RidePresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /** Which policy ability and target status each URL action maps to. */
    private const ACTIONS = [
        'approve' => BookingStatus::Approved,
        'confirm' => BookingStatus::Confirmed,
        'complete' => BookingStatus::Completed,
        'cancel' => BookingStatus::Cancelled,
    ];

    /** GET /bookings : my trips as a passenger, plus requests on rides I drive. */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $mine = $user->bookings()->with(['ride.origin', 'ride.destination'])->latest()->get();
        $incoming = Booking::whereHas('ride.vehicle', fn ($q) => $q->where('driver_id', $user->id))
            ->with(['ride.origin', 'ride.destination', 'passenger:id,name'])->latest()->get();

        return Inertia::render('bookings/index', [
            'mine' => $mine->map(fn (Booking $b) => $this->summary($b)),
            'incoming' => $incoming->map(fn (Booking $b) => $this->summary($b) + ['passenger' => $b->passenger->name]),
        ]);
    }

    /** POST /rides/{ride}/book : the reservation (status = pending). All rules live in ReserveSeat. */
    public function store(Request $request, Ride $ride, ReserveSeat $reserve): RedirectResponse
    {
        $data = $request->validate(['seats' => ['required', 'integer', 'min:1', 'max:6']]);

        $booking = $reserve->handle($request->user(), $ride, $data['seats']);

        $this->toast('Seat requested. Waiting for the driver to approve.');

        return to_route('bookings.show', $booking);
    }

    /** GET /bookings/{booking} : reference number, status timeline, available actions, review box. */
    public function show(Request $request, Booking $booking): Response
    {
        $this->authorize('view', $booking);
        $user = $request->user();
        $booking->load(['ride' => fn ($q) => $q->with(RidePresenter::WITH), 'passenger:id,name', 'reviews']);

        return Inertia::render('bookings/show', [
            'booking' => $this->summary($booking) + [
                'passenger' => $booking->passenger->name,
                'driver' => $booking->ride->vehicle->driver->user->name,
                'pickup_point' => $booking->ride->pickup_point,
                'departure_at' => $booking->ride->departure_at->toIso8601String(),
                'approved_at' => $booking->approved_at?->toIso8601String(),
                'confirmed_at' => $booking->confirmed_at?->toIso8601String(),
                'completed_at' => $booking->completed_at?->toIso8601String(),
                'cancelled_at' => $booking->cancelled_at?->toIso8601String(),
                'reviews' => $booking->reviews->map(fn ($r) => [
                    'by' => $r->reviewer_role->value, 'rating' => $r->rating, 'comment' => $r->comment,
                ]),
            ],
            // Only offer buttons the policy would actually allow. The server re-checks on every request.
            'abilities' => collect(array_keys(self::ACTIONS))
                ->mapWithKeys(fn ($a) => [$a => $user->can($a, $booking) && $this->legal($booking, $a)])
                ->all() + ['review' => $user->can('review', $booking)],
        ]);
    }

    /** PATCH /bookings/{booking}/{action} : approve | confirm | complete | cancel. */
    public function transition(Request $request, Booking $booking, string $action, TransitionBooking $transition): RedirectResponse
    {
        abort_unless(isset(self::ACTIONS[$action]), 404);
        $this->authorize($action, $booking->loadMissing('ride.vehicle'));

        $reason = $action === 'cancel'
            ? $request->validate(['reason' => ['nullable', 'string', 'max:255']])['reason'] ?? null
            : null;

        $transition->handle($booking, self::ACTIONS[$action], $reason);

        $this->toast('Booking updated.');

        return back();
    }

    /** Is this action legal from the booking's CURRENT status? (UI hint only; TransitionBooking is the authority.) */
    private function legal(Booking $booking, string $action): bool
    {
        return match ($action) {
            'approve' => $booking->status === BookingStatus::Pending,
            'confirm' => $booking->status === BookingStatus::Approved,
            'complete' => $booking->status === BookingStatus::Confirmed,
            'cancel' => in_array($booking->status, [BookingStatus::Pending, BookingStatus::Approved, BookingStatus::Confirmed], true),
        };
    }

    private function summary(Booking $b): array
    {
        return [
            'id' => $b->id,
            'reference_no' => $b->reference_no,
            'status' => $b->status->value,
            'seats' => $b->seats_booked,
            'total_fare' => $b->totalFare(),
            'route' => $b->ride->origin->name.' → '.$b->ride->destination->name,
            'departure_at' => $b->ride->departure_at->toIso8601String(),
            'cancellation_reason' => $b->cancellation_reason,
        ];
    }
}
