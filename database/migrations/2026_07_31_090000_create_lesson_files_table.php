<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('file_path', 500);
            $table->string('original_name', 255);
            $table->string('mime_type', 150)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->unsignedInteger('position')->default(1);
            $table->timestamps();

            $table->index(['lesson_id', 'position']);
        });

        DB::table('lessons')
            ->whereNotNull('file_path')
            ->where('file_path', '!=', '')
            ->orderBy('id')
            ->each(function (object $lesson): void {
                DB::table('lesson_files')->insert([
                    'lesson_id' => $lesson->id,
                    'file_path' => $lesson->file_path,
                    'original_name' => basename($lesson->file_path),
                    'mime_type' => null,
                    'file_size' => null,
                    'position' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_files');
    }
};
