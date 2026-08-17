<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    protected $fillable = ['assessment_id', 'user_id', 'score', 'total_questions', 'started_at', 'completed_at'];
    protected $casts = ['score' => 'integer', 'total_questions' => 'integer', 'started_at' => 'datetime', 'completed_at' => 'datetime'];
    public function assessment(): BelongsTo { return $this->belongsTo(Assessment::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function questions(): BelongsToMany { return $this->belongsToMany(AssessmentQuestion::class, 'quiz_attempt_questions', 'quiz_attempt_id', 'question_id')->withPivot('position')->orderByPivot('position'); }
    public function answers(): HasMany { return $this->hasMany(QuizAnswer::class); }
}
