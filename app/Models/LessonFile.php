<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonFile extends Model
{
    protected $fillable = [
        'lesson_id',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'position',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'position' => 'integer',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
