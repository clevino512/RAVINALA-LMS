<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonFile;
use App\Models\LessonType;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LessonManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_administrator_can_create_a_lesson_with_multiple_files(): void
    {
        Storage::fake('public');

        $status = Status::factory()->create(['name' => 'actif']);
        $adminType = UserType::factory()->create(['name' => 'admin']);
        $admin = User::factory()->create([
            'id_1' => $adminType->id,
            'id_2' => $status->id,
            'must_change_password' => false,
            'email_verified_at' => now(),
        ]);
        $course = Course::create(['name' => 'Cours de test']);
        $module = CourseModule::create([
            'course_id' => $course->id,
            'title' => 'Module de test',
            'position' => 1,
        ]);
        $lessonType = LessonType::create(['name' => 'Multimédia']);

        $response = $this->actingAs($admin)->post(
            route('admin.lms.courses.modules.lessons.store', [$course, $module]),
            [
                'title' => 'Leçon multimédia',
                'description' => 'Plusieurs supports.',
                'duration' => 15,
                'position' => 1,
                'is_published' => true,
                'lesson_type_id' => $lessonType->id,
                'lesson_files' => [
                    UploadedFile::fake()->create('cours.pdf', 50, 'application/pdf'),
                    UploadedFile::fake()->create('video.mp4', 100, 'video/mp4'),
                ],
            ]
        );

        $response->assertCreated()->assertJsonCount(2, 'data.files');

        $lesson = Lesson::query()->where('title', 'Leçon multimédia')->firstOrFail();
        $this->assertCount(2, $lesson->files);
        $lesson->files->each(
            fn ($file) => Storage::disk('public')->assertExists($file->file_path)
        );
    }

    public function test_an_administrator_can_add_and_delete_an_individual_lesson_file(): void
    {
        Storage::fake('public');

        $status = Status::factory()->create(['name' => 'actif']);
        $adminType = UserType::factory()->create(['name' => 'admin']);
        $admin = User::factory()->create([
            'id_1' => $adminType->id,
            'id_2' => $status->id,
            'must_change_password' => false,
            'email_verified_at' => now(),
        ]);
        $course = Course::create(['name' => 'Cours de test']);
        $module = CourseModule::create([
            'course_id' => $course->id,
            'title' => 'Module de test',
            'position' => 1,
        ]);
        $lessonType = LessonType::create(['name' => 'Multimédia']);
        $lesson = Lesson::create([
            'module_id' => $module->id,
            'lesson_type_id' => $lessonType->id,
            'title' => 'Leçon à modifier',
            'position' => 1,
            'is_published' => false,
        ]);

        $this->actingAs($admin)->post(
            route('admin.lms.courses.modules.lessons.update', [$course, $module, $lesson]),
            [
                '_method' => 'put',
                'title' => $lesson->title,
                'description' => '',
                'duration' => 10,
                'position' => 1,
                'is_published' => false,
                'lesson_type_id' => $lessonType->id,
                'lesson_files' => [
                    UploadedFile::fake()->create('support.pdf', 50, 'application/pdf'),
                ],
            ]
        )->assertOk()->assertJsonCount(1, 'data.files');

        $lessonFile = LessonFile::query()->where('lesson_id', $lesson->id)->firstOrFail();
        Storage::disk('public')->assertExists($lessonFile->file_path);

        $this->actingAs($admin)->put(
            route('admin.lms.courses.modules.lessons.update', [$course, $module, $lesson]),
            [
                'title' => $lesson->title,
                'description' => '',
                'duration' => 10,
                'position' => 1,
                'is_published' => false,
                'lesson_type_id' => $lessonType->id,
                'deleted_file_ids' => [$lessonFile->id],
            ]
        )->assertOk()->assertJsonCount(0, 'data.files');

        $this->assertDatabaseMissing('lesson_files', ['id' => $lessonFile->id]);
        Storage::disk('public')->assertMissing($lessonFile->file_path);
    }
}
