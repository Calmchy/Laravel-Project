<?php

namespace App\Actions\Bookings;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The booking state machine: pending -> approved -> confirmed -> completed,
 * or cancelled from any open state. Who may trigger each move is decided by
 * BookingPolicy; WHICH moves are legal is decided only here.
 *
 * Seats are derived by query (see Ride::seatsLeft), and approved/confirmed bookings
 * already count as taken, so no seat arithmetic is needed on a transition.
 * Cancelling simply stops the booking from counting.
 */
class TransitionBooking
{
    /** @var array<string, list<BookingStatus>> allowed previous states for each target */
    private const ALLOWED_FROM = [
        'approved' => [BookingStatus::Pending],
        'confirmed' => [BookingStatus::Approved],
        'completed' => [BookingStatus::Confirmed],
        'cancelled' => [BookingStatus::Pending, BookingStatus::Approved, BookingStatus::Confirmed],
    ];

    public function handle(Booking $booking, BookingStatus $to, ?string $reason = null): Booking
    {
        return DB::transaction(function () use ($booking, $to, $reason) {
            // Re-read under a row lock so two clicks (or two tabs) can't both win.
            $locked = Booking::with('ride')->whereKey($booking->id)->lockForUpdate()->firstOrFail();

            if (! in_array($locked->status, self::ALLOWED_FROM[$to->value] ?? [], true)) {
                throw ValidationException::withMessages([
                    'status' => "A {$locked->status->value} booking can't become {$to->value}.",
                ]);
            }

            // A trip can only be marked completed once its departure time has passed.
            if ($to === BookingStatus::Completed && $locked->ride->departure_at->isFuture()) {
                throw ValidationException::withMessages([
                    'status' => 'This trip has not departed yet.',
                ]);
            }

            $locked->forceFill(match ($to) {
                BookingStatus::Approved => ['status' => $to, 'approved_at' => now()],
                BookingStatus::Confirmed => ['status' => $to, 'confirmed_at' => now()],
                BookingStatus::Completed => ['status' => $to, 'completed_at' => now()],
                BookingStatus::Cancelled => [
                    'status' => $to,
                    'cancelled_at' => now(),
                    'cancellation_reason' => $reason ? mb_substr($reason, 0, 255) : null,
                ],
                default => throw new \LogicException('Unsupported transition.'),
            })->save();

            return $locked;
        });
    }
}
