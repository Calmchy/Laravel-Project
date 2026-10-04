<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatbotIntent extends Model
{
    protected $fillable = ['name', 'answer', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function keywords(): HasMany
    {
        return $this->hasMany(ChatbotKeyword::class, 'intent_id');
    }

    /**
     * Find the reply for a user's message (Query 10). Matches whole words so
     * a short keyword like "id" doesn't fire inside "paid".
     */
    public static function replyFor(string $message): ?string
    {
        $words = preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($message), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        if ($words === []) {
            return null;
        }

        return static::query()
            ->where('is_active', true)
            ->whereHas('keywords', fn ($q) => $q->whereIn('keyword', $words))
            ->value('answer');
    }
}
