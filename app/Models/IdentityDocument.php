<?php

namespace App\Models;

use App\Enums\ApprovalStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IdentityDocument extends Model
{
    protected $fillable = [
        'user_id', 'id_type_id', 'front_image_path', 'back_image_path',
        'status', 'reviewed_by', 'reviewed_at', 'remarks',
    ];

    protected function casts(): array
    {
        return [
            'status' => ApprovalStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function idType(): BelongsTo
    {
        return $this->belongsTo(IdType::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
