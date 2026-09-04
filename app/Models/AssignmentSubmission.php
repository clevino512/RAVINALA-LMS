<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentSubmission extends Model
{
    protected $fillable = ['assessment_id', 'user_id', 'file_path', 'original_name', 'mime_type', 'file_size', 'submitted_at', 'grade', 'feedback', 'graded_by', 'graded_at'];
    protected $casts = ['file_size' => 'integer', 'submitted_at' => 'datetime', 'grade' => 'decimal:2', 'graded_at' => 'datetime'];
    public function assessment(): BelongsTo { return $this->belongsTo(Assessment::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function grader(): BelongsTo { return $this->belongsTo(User::class, 'graded_by'); }
}
