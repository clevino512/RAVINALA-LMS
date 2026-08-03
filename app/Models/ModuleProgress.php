<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModuleProgress extends Model
{
    protected $table = 'module_progress';

    protected $fillable = [
        'course_progress_id',
        'user_id',
        'module_id',
        'progress_status_id',
        'progress_percentage',
        'is_active',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'progress_percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function courseProgress(): BelongsTo
    {
        return $this->belongsTo(CourseProgress::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function progressStatus(): BelongsTo
    {
        return $this->belongsTo(ProgressStatus::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }
}