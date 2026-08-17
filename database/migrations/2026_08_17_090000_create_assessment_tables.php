<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->enum('type', ['quiz', 'assignment']);
            $table->string('title');
            $table->text('instructions')->nullable();
            $table->dateTime('due_at')->nullable();
            $table->unsignedInteger('random_question_count')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->index(['course_id', 'type', 'is_published']);
        });

        Schema::create('assessment_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['multiple_choice', 'true_false']);
            $table->text('prompt');
            $table->unsignedInteger('position')->default(1);
            $table->timestamps();
        });

        Schema::create('assessment_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('assessment_questions')->cascadeOnDelete();
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->unsignedInteger('position')->default(1);
            $table->timestamps();
        });

        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('score')->nullable();
            $table->unsignedInteger('total_questions')->default(0);
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
            $table->index(['assessment_id', 'user_id']);
        });

        Schema::create('quiz_attempt_questions', function (Blueprint $table) {
            $table->foreignId('quiz_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('assessment_questions')->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->primary(['quiz_attempt_id', 'question_id']);
        });

        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('assessment_questions')->cascadeOnDelete();
            $table->foreignId('option_id')->nullable()->constrained('assessment_options')->nullOnDelete();
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
            $table->unique(['quiz_attempt_id', 'question_id']);
        });

        Schema::create('assignment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('file_path', 500);
            $table->string('original_name');
            $table->string('mime_type', 150);
            $table->unsignedBigInteger('file_size');
            $table->dateTime('submitted_at');
            $table->decimal('grade', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('graded_at')->nullable();
            $table->timestamps();
            $table->unique(['assessment_id', 'user_id']);
        });

        Schema::create('assessment_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->dateTime('sent_at');
            $table->unique(['assessment_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_reminders');
        Schema::dropIfExists('assignment_submissions');
        Schema::dropIfExists('quiz_answers');
        Schema::dropIfExists('quiz_attempt_questions');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('assessment_options');
        Schema::dropIfExists('assessment_questions');
        Schema::dropIfExists('assessments');
    }
};
