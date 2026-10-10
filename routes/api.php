<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\DashboardController;

Route::get('/drivers', [DriverController::class, 'index']);
Route::get('/announcements', fn () => response()->json([
    ['id' => 1, 'title' => 'RideNovaPH is on the move', 'subtitle' => 'Share a ride. Share the journey.', 'image' => '/images/ride-banner-1.jpg'],
    ['id' => 2, 'title' => 'Travel together, travel smarter', 'subtitle' => 'Check driver details before you book.', 'image' => '/images/ride-banner-2.jpg'],
    ['id' => 3, 'title' => 'Your next trip starts here', 'subtitle' => 'Plan your pickup and return in one place.', 'image' => '/images/ride-banner-3.jpg'],
]));

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'show']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/identity-document', [ProfileController::class, 'uploadIdentityDocument']);
});
