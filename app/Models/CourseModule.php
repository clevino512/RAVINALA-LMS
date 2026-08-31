<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseModule extends Model
{
    protected $table = 'modules';

    protected $fillable = [
        'title',
        'description',
        'position',
        'course_id',
    ];

    protected $casts = [
        'position' => 'integer',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class, 'module_id')->orderBy('position');
    }
}
