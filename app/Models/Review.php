<?php

namespace App\Models;

use App\Enums\ReviewerRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $fillable = ['booking_id', 'reviewer_role', 'rating', 'comment'];

    protected function casts(): array
    {
        return ['reviewer_role' => ReviewerRole::class];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
