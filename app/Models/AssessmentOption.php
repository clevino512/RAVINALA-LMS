<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentOption extends Model
{
    protected $fillable = ['question_id', 'option_text', 'is_correct', 'position'];
    protected $casts = ['is_correct' => 'boolean'];
    public function question(): BelongsTo { return $this->belongsTo(AssessmentQuestion::class, 'question_id'); }
}
