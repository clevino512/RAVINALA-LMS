<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAnswer extends Model
{
    protected $fillable = ['quiz_attempt_id', 'question_id', 'option_id', 'is_correct'];
    protected $casts = ['is_correct' => 'boolean'];
}
