<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assessment extends Model
{
    protected $fillable = ['course_id', 'created_by', 'type', 'title', 'instructions', 'attachment_path', 'attachment_name', 'attachment_mime', 'attachment_size', 'due_at', 'random_question_count', 'is_published'];

    protected $casts = ['due_at' => 'datetime', 'random_question_count' => 'integer', 'is_published' => 'boolean'];

    public function course(): BelongsTo { return $this->belongsTo(Course::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function questions(): HasMany { return $this->hasMany(AssessmentQuestion::class)->orderBy('position'); }
    public function attempts(): HasMany { return $this->hasMany(QuizAttempt::class); }
    public function submissions(): HasMany { return $this->hasMany(AssignmentSubmission::class); }
}
