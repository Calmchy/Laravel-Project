<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class NewRideBooking extends Notification
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    /** Persist notification so it appears in the driver's in-app notification center. */
    public function via(object $notifiable): array { return ['database']; }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'new_ride_booking',
            'booking_id' => $this->booking->id,
            'reference' => $this->booking->reference,
            'passenger_name' => $this->booking->passenger_name,
            'pickup_location' => $this->booking->pickup_location,
            'return_location' => $this->booking->return_location,
            'pickup_at' => $this->booking->pickup_at?->toISOString(),
            'passenger_count' => $this->booking->passenger_count,
        ];
    }
}
