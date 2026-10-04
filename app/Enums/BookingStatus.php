<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';       // the reservation
    case Approved = 'approved';     // driver accepted
    case Confirmed = 'confirmed';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
