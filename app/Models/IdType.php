<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IdType extends Model
{
    public $timestamps = false;

    protected $fillable = ['name'];

    public function identityDocuments(): HasMany
    {
        return $this->hasMany(IdentityDocument::class);
    }
}
