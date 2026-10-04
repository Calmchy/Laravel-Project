<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatbotKeyword extends Model
{
    public $timestamps = false;

    protected $fillable = ['intent_id', 'keyword'];

    public function intent(): BelongsTo
    {
        return $this->belongsTo(ChatbotIntent::class, 'intent_id');
    }
}
