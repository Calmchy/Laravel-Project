<?php

namespace App\Enums;

enum ReviewerRole: string
{
    case Passenger = 'passenger'; // passenger reviews the ride's driver
    case Driver = 'driver';       // driver reviews the booking's passenger
}
