<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseProgress extends Model
{
    protected $table = 'course_progress';

    protected $fillable = [
        'user_id',
        'course_id',
        'progress_status_id',
        'progress_percentage',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'progress_percentage' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function progressStatus(): BelongsTo
    {
        return $this->belongsTo(ProgressStatus::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(ModuleProgress::class);
    }
}