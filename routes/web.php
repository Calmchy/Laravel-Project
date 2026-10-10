<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\IdentityReviewController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\IdentityDocumentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RideController;
use Illuminate\Support\Facades\Route;

// ---- Public: anyone can browse rides; booking itself needs an account ----
Route::get('/', HomeController::class)->name('home');
Route::get('/rides', [RideController::class, 'index'])->name('rides.index');
Route::get('/rides/{ride}', [RideController::class, 'show'])->name('rides.show');

// ---- Signed-in, email-verified users ----
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::inertia('/about', 'about')->name('about');

    // Valid-ID upload (rate limited: uploads are expensive and a brute-force target).
    Route::get('/identity', [IdentityDocumentController::class, 'create'])->name('identity.create');
    Route::post('/identity', [IdentityDocumentController::class, 'store'])->middleware('throttle:5,1')->name('identity.store');

    // Reservation -> booking lifecycle
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/rides/{ride}/book', [BookingController::class, 'create'])->name('bookings.create');
    Route::post('/rides/{ride}/book', [BookingController::class, 'store'])->middleware('throttle:10,1')->name('bookings.store');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::patch('/bookings/{booking}/{action}', [BookingController::class, 'transition'])
        ->where('action', 'approve|confirm|complete|cancel')->middleware('throttle:30,1')->name('bookings.transition');

    Route::post('/bookings/{booking}/reviews', [ReviewController::class, 'store'])->middleware('throttle:10,1')->name('reviews.store');

    // Old static mock page: send people to the merged Bookings hub instead.
    Route::redirect('/booking', '/bookings');
});

// ---- Admin only (role checked server-side by the 'admin' middleware) ----
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('admin');
    Route::get('/identity-documents/{document}/{side}', [IdentityReviewController::class, 'image'])->name('admin.identity.image');
    Route::patch('/identity-documents/{document}', [IdentityReviewController::class, 'decide'])->name('admin.identity.decide');
    Route::post('/banners', [BannerController::class, 'store'])->name('admin.banners.store');
    Route::patch('/banners/{banner}', [BannerController::class, 'toggle'])->name('admin.banners.toggle');
    Route::delete('/banners/{banner}', [BannerController::class, 'destroy'])->name('admin.banners.destroy');
});

require __DIR__.'/settings.php';
