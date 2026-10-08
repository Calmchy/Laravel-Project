<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ApprovalStatus;
use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Booking;
use App\Models\IdentityDocument;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /** GET /admin : totals, bookings monitor, ID review queue and banner manager (route is behind the 'admin' middleware). */
    public function index(): Response
    {
        return Inertia::render('admin', [
            'stats' => [
                'bookings' => Booking::count(),
                'pending' => Booking::where('status', BookingStatus::Pending->value)->count(),
                'confirmed' => Booking::where('status', BookingStatus::Confirmed->value)->count(),
                'completed' => Booking::where('status', BookingStatus::Completed->value)->count(),
            ],
            'bookings' => Booking::with(['ride.origin', 'ride.destination', 'passenger:id,name,phone_number'])
                ->latest()->limit(100)->get()->map(fn (Booking $b) => [
                    'id' => $b->id,
                    'reference_no' => $b->reference_no,
                    'passenger' => $b->passenger->name,
                    'phone' => $b->passenger->phone_number,
                    'route' => $b->ride->origin->name.' → '.$b->ride->destination->name,
                    'departure_at' => $b->ride->departure_at->toIso8601String(),
                    'seats' => $b->seats_booked,
                    'status' => $b->status->value,
                ]),
            'id_queue' => IdentityDocument::with(['user:id,name,email', 'idType'])
                ->where('status', ApprovalStatus::Pending->value)->oldest()->get()
                ->map(fn (IdentityDocument $d) => [
                    'id' => $d->id,
                    'name' => $d->user->name,
                    'email' => $d->user->email,
                    'id_type' => $d->idType->name,
                    'has_back' => $d->back_image_path !== null,
                    'submitted_at' => $d->created_at->toIso8601String(),
                ]),
            'banners' => Banner::orderBy('display_order')->get()->map(fn (Banner $b) => [
                'id' => $b->id, 'title' => $b->title, 'caption' => $b->caption,
                'link_url' => $b->link_url, 'is_active' => $b->is_active,
                'image_url' => str_starts_with($b->image_path, 'http') ? $b->image_path : Storage::disk('public')->url($b->image_path),
            ]),
        ]);
    }
}
