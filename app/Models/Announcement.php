<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Announcement extends Model
{
    protected $fillable = [
        'category_id', 'created_by', 'city_id', 'title', 'body',
        'exam_date', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'exam_date' => 'date',
            'is_published' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AnnouncementCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function rides(): HasMany
    {
        return $this->hasMany(Ride::class);
    }

    /** Published announcements that haven't happened yet (Query 8). */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->whereDate('exam_date', '>=', today())
            ->orderBy('exam_date');
    }
}
