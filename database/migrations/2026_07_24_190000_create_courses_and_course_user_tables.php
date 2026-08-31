<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('courses')) {
            Schema::create('courses', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100)->unique();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('course_user')) {
            Schema::create('course_user', function (Blueprint $table) {
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
                $table->primary(['user_id', 'course_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('course_user');
        Schema::dropIfExists('courses');
    }
};
