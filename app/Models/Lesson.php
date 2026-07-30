<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lesson extends Model
{
    protected $fillable = [
        'title',
        'description',
        'file_path',
        'duration',
        'position',
        'is_published',
        'lesson_type_id',
        'module_id',
    ];

    protected $casts = [
        'duration' => 'decimal:2',
        'position' => 'integer',
        'is_published' => 'boolean',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function lessonType(): BelongsTo
    {
        return $this->belongsTo(LessonType::class);
    }
}
