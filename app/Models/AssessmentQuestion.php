<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentQuestion extends Model
{
    protected $fillable = ['assessment_id', 'type', 'prompt', 'position'];
    public function assessment(): BelongsTo { return $this->belongsTo(Assessment::class); }
    public function options(): HasMany { return $this->hasMany(AssessmentOption::class, 'question_id')->orderBy('position'); }
}
