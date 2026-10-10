<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Models\Announcement;
use App\Models\Banner;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** GET /dashboard : verification status and what needs the user's attention. No photo header. */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $upcoming = $user->bookings()->with(['ride.origin', 'ride.destination'])
            ->whereIn('status', [BookingStatus::Pending->value, BookingStatus::Approved->value, BookingStatus::Confirmed->value])
            ->latest()->limit(5)->get();

        $awaitingMe = Booking::whereHas('ride.vehicle', fn ($q) => $q->where('driver_id', $user->id))
            ->where('status', BookingStatus::Pending->value)->count();

        return Inertia::render('dashboard', [
            'slides' => $this->slides(),
            'stats' => [
                'active' => $user->bookings()->whereIn('status', ['pending', 'approved', 'confirmed'])->count(),
                'completed' => $user->bookings()->where('status', BookingStatus::Completed->value)->count(),
                'total' => $user->bookings()->count(),
            ],
            'awaiting_my_approval' => $awaitingMe,
            'upcoming' => $upcoming->map(fn (Booking $b) => [
                'id' => $b->id,
                'reference_no' => $b->reference_no,
                'status' => $b->status->value,
                'route' => $b->ride->origin->name.' → '.$b->ride->destination->name,
                'departure_at' => $b->ride->departure_at->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Header slideshow = admin banners (photos) + upcoming exam/event announcements.
     * Each slide is clickable: banners use their own link, announcements jump to the
     * Bookings hub filtered to that exam city so the user can find a ride right away.
     */
    private function slides(): array
    {
        $banners = Banner::slideshow()->get()->map(fn (Banner $b) => [
            'id' => 'b'.$b->id,
            'kind' => 'banner',
            'title' => $b->title,
            'caption' => $b->caption,
            'link_url' => $b->link_url ?: '/bookings?tab=find',
            // Banner images may be a full URL (seeded) or a file on the public disk (uploaded).
            'image_url' => $b->image_path
                ? (str_starts_with($b->image_path, 'http') ? $b->image_path : Storage::disk('public')->url($b->image_path))
                : null,
        ]);

        $events = Announcement::upcoming()->with(['category', 'city'])->limit(5)->get()->map(fn (Announcement $a) => [
            'id' => 'a'.$a->id,
            'kind' => 'event',
            'title' => $a->title,
            'caption' => collect([$a->category->name, $a->city?->name, $a->exam_date?->format('M j, Y')])->filter()->implode(' · '),
            'link_url' => $a->city_id ? '/bookings?tab=find&destination='.$a->city_id : '/bookings?tab=find',
            'image_url' => null,
        ]);

        // Interleave so the carousel alternates photo / event instead of showing all of one kind first.
        $banners = $banners->values();
        $events = $events->values();
        $slides = [];
        for ($i = 0, $n = max($banners->count(), $events->count()); $i < $n; $i++) {
            if (isset($banners[$i])) {
                $slides[] = $banners[$i];
            }
            if (isset($events[$i])) {
                $slides[] = $events[$i];
            }
        }

        return $slides;
    }
}
