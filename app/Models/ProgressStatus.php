<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgressStatus extends Model
{
    protected $fillable = [
        'name',
    ];

    public function courseProgresses(): HasMany
    {
        return $this->hasMany(CourseProgress::class);
    }

    public function moduleProgresses(): HasMany
    {
        return $this->hasMany(ModuleProgress::class);
    }
}