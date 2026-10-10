<?php

namespace App\Http\Controllers;

use App\Actions\Bookings\ReserveSeat;
use App\Actions\Bookings\TransitionBooking;
use App\Enums\BookingStatus;
use App\Enums\RideStatus;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Models\City;
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

    /**
     * GET /bookings : the ONE hub that replaces "Find a ride" + "My bookings".
     *   ?tab=find  -> search open rides (origin / destination / date), each card opens the booking form
     *   ?tab=mine  -> trips I booked, plus requests on rides I drive
     * Only the data for the visible tab is queried, so the page stays fast as the tables grow.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tab = $request->query('tab') === 'mine' ? 'mine' : 'find';

        // Validate the query string too: GET parameters are user input like any other.
        $filters = $request->validate([
            'origin' => ['nullable', 'integer', 'exists:cities,id'],
            'destination' => ['nullable', 'integer', 'exists:cities,id'],
            'date' => ['nullable', 'date'],
        ]);

        $rides = null;
        $mine = collect();
        $incoming = collect();

        if ($tab === 'find') {
            $rides = Ride::with(RidePresenter::WITH)
                ->available()->withSeatsLeft()
                ->when($filters['origin'] ?? null, fn ($q, $v) => $q->where('origin_city_id', $v))
                ->when($filters['destination'] ?? null, fn ($q, $v) => $q->where('destination_city_id', $v))
                ->when($filters['date'] ?? null, fn ($q, $v) => $q->whereDate('departure_at', $v))
                ->orderBy('departure_at')
                ->simplePaginate(12)->withQueryString()
                ->through(fn (Ride $r) => RidePresenter::card($r));
        } else {
            $mine = $user->bookings()->with(['ride.origin', 'ride.destination'])->latest()->get()
                ->map(fn (Booking $b) => $this->summary($b));
            $incoming = Booking::whereHas('ride.vehicle', fn ($q) => $q->where('driver_id', $user->id))
                ->with(['ride.origin', 'ride.destination', 'passenger:id,name'])->latest()->get()
                ->map(fn (Booking $b) => $this->summary($b) + ['passenger' => $b->passenger->name]);
        }

        return Inertia::render('bookings/index', [
            'tab' => $tab,
            'filters' => $filters,
            'cities' => City::orderBy('name')->get(['id', 'name']),
            'rides' => $rides,
            'mine' => $mine,
            'incoming' => $incoming,
        ]);
    }

    /**
     * GET /rides/{ride}/book : the step-by-step booking page (details -> pick-up/return map -> review).
     * The guards run BEFORE the form is shown, so nobody fills it in just to be rejected at the end.
     * ReserveSeat still enforces the same rules on submit: it is the real authority, this is a courtesy.
     */
    public function create(Request $request, Ride $ride): Response|RedirectResponse
    {
        $user = $request->user();
        $ride->load(RidePresenter::WITH);

        // Already booked this ride? Send them to that booking instead of a second form.
        if ($existing = $user->bookings()->where('ride_id', $ride->id)->first()) {
            return to_route('bookings.show', $existing);
        }

        if ($ride->vehicle->driver_id === $user->id) {
            $this->toast("You can't book your own ride.", 'error');

            return to_route('rides.show', $ride);
        }

        // Booking needs an admin-approved ID (set up on the profile pages).
        if (! $user->hasApprovedId()) {
            $this->toast('Upload a valid ID and wait for approval before booking.', 'error');

            return to_route('identity.create');
        }

        if ($ride->status !== RideStatus::Open || $ride->departure_at->isPast() || $ride->seatsLeft() < 1) {
            $this->toast('This ride is no longer open for booking.', 'error');

            return to_route('rides.show', $ride);
        }

        return Inertia::render('bookings/create', [
            'ride' => RidePresenter::card($ride) + ['notes' => $ride->notes],
            // City centre so the map opens in the right area (null = the map falls back to Leyte).
            'map' => [
                'origin' => $ride->origin->latitude !== null
                    ? ['lat' => (float) $ride->origin->latitude, 'lng' => (float) $ride->origin->longitude]
                    : null,
            ],
            // Form prefill from the account so the passenger types less.
            'prefill' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => (string) ($user->phone_number ?? ''),
            ],
        ]);
    }

    /**
     * POST /rides/{ride}/book : the reservation (status = pending).
     * StoreBookingRequest validates the form; ReserveSeat enforces the business rules
     * (ID approved, seats free, not your own ride...) inside a locked transaction.
     */
    public function store(StoreBookingRequest $request, Ride $ride, ReserveSeat $reserve): RedirectResponse
    {
        $data = $request->validated();
        $seats = (int) $data['seats'];
        unset($data['seats']); // everything left is booking-form detail

        $booking = $reserve->handle($request->user(), $ride, $seats, $data);

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
                'details' => [
                    'name' => $booking->contact_name,
                    'address' => $booking->contact_address,
                    'email' => $booking->contact_email,
                    'phone' => $booking->contact_phone,
                    'pickup_location' => $booking->pickup_location,
                    'pickup_lat' => $booking->pickup_lat !== null ? (float) $booking->pickup_lat : null,
                    'pickup_lng' => $booking->pickup_lng !== null ? (float) $booking->pickup_lng : null,
                    'pickup_at' => $booking->pickup_at?->toIso8601String(),
                    'return_location' => $booking->return_location,
                    'return_lat' => $booking->return_lat !== null ? (float) $booking->return_lat : null,
                    'return_lng' => $booking->return_lng !== null ? (float) $booking->return_lng : null,
                    'return_at' => $booking->return_at?->toIso8601String(),
                    'rate' => (float) $booking->fare_per_seat,
                ],
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
