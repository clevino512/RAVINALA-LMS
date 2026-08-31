<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('lesson_types')) {
            Schema::create('lesson_types', function (Blueprint $table) {
                $table->id();
                $table->string('name', 50)->unique();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('progress_statuses')) {
            Schema::create('progress_statuses', function (Blueprint $table) {
                $table->id();
                $table->string('name', 50)->unique();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('modules')) {
            Schema::create('modules', function (Blueprint $table) {
                $table->id();
                $table->string('title', 250);
                $table->text('description')->nullable();
                $table->unsignedInteger('position')->default(1);
                $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['course_id', 'position']);
            });
        }

        if (! Schema::hasTable('lessons')) {
            Schema::create('lessons', function (Blueprint $table) {
                $table->id();
                $table->string('title', 250);
                $table->text('description')->nullable();
                $table->string('file_path', 500)->nullable();
                $table->decimal('duration', 8, 2)->nullable();
                $table->unsignedInteger('position')->default(1);
                $table->boolean('is_published')->default(false);
                $table->foreignId('lesson_type_id')->constrained('lesson_types')->restrictOnDelete();
                $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['module_id', 'position']);
            });
        }

        if (! Schema::hasTable('course_progress')) {
            Schema::create('course_progress', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
                $table->foreignId('progress_status_id')->constrained('progress_statuses')->restrictOnDelete();
                $table->decimal('progress_percentage', 5, 2)->default(0);
                $table->dateTime('started_at')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->timestamps();
                $table->unique(['user_id', 'course_id']);
            });
        }

        if (! Schema::hasTable('module_progress')) {
            Schema::create('module_progress', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_progress_id')->constrained('course_progress')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
                $table->foreignId('progress_status_id')->constrained('progress_statuses')->restrictOnDelete();
                $table->decimal('progress_percentage', 5, 2)->default(0);
                $table->boolean('is_active')->default(false);
                $table->dateTime('started_at')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->timestamps();
                $table->unique(['user_id', 'module_id']);
            });
        }

        if (! Schema::hasTable('lesson_progress')) {
            Schema::create('lesson_progress', function (Blueprint $table) {
                $table->id();
                $table->foreignId('module_progress_id')->constrained('module_progress')->cascadeOnDelete();
                $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->boolean('is_completed')->default(false);
                $table->dateTime('completed_at')->nullable();
                $table->timestamps();
                $table->unique(['user_id', 'lesson_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('module_progress');
        Schema::dropIfExists('course_progress');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('progress_statuses');
        Schema::dropIfExists('lesson_types');
    }
};
