<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('/about', 'about')->name('about');
    Route::inertia('/booking', 'booking')->name('booking');
});

require __DIR__.'/settings.php';
