<?php

namespace App\Actions\Bookings;

use App\Enums\BookingStatus;
use App\Enums\RideStatus;
use App\Models\Booking;
use App\Models\Ride;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Reservation -> pending booking (Query 3).
 * Locks the ride row so two passengers can't take the last seat together.
 */
class ReserveSeat
{
    /**
     * @param  array<string, mixed>  $details  validated booking-form fields (contact + pick-up/return);
     *                                         empty when called from older code paths.
     */
    public function handle(User $passenger, Ride $ride, int $seats = 1, array $details = []): Booking
    {
        if (! $passenger->hasApprovedId()) {
            $this->fail('id', 'Upload a valid ID and wait for approval before booking.');
        }

        return DB::transaction(function () use ($passenger, $ride, $seats) {
            $locked = Ride::with('vehicle')->whereKey($ride->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== RideStatus::Open || $locked->departure_at->isPast()) {
                $this->fail('ride', 'This ride is no longer open for booking.');
            }

            if ($locked->vehicle->driver_id === $passenger->id) {
                $this->fail('ride', "You can't book your own ride.");
            }

            if ($locked->bookings()->where('passenger_id', $passenger->id)->exists()) {
                $this->fail('ride', 'You already have a booking for this ride.');
            }

            $taken = (int) $locked->bookings()
                ->where('status', '!=', BookingStatus::Cancelled->value)
                ->sum('seats_booked');

            if ($seats < 1 || $taken + $seats > $locked->seats_offered) {
                $this->fail('seats', 'Not enough seats left on this ride.');
            }

            return Booking::create($details + [
                'reference_no' => Booking::generateReference(),
                'ride_id' => $locked->id,
                'passenger_id' => $passenger->id,
                'seats_booked' => $seats,
                'fare_per_seat' => $locked->price_per_seat, // price snapshot
                'status' => BookingStatus::Pending,
            ]);
        });
    }

    private function fail(string $key, string $message): never
    {
        throw ValidationException::withMessages([$key => $message]);
    }
}
