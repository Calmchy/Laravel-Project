<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnnouncementCategory extends Model
{
    public $timestamps = false;

    protected $fillable = ['name'];

    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class, 'category_id');
    }
}
