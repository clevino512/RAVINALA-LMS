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
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class LessonManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        File::deleteDirectory(public_path('lessons/data'));

        parent::tearDown();
    }

    public function test_an_administrator_can_create_a_lesson_with_multiple_files(): void
    {
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
        $lessonType = LessonType::create(['name' => 'Multimedia']);

        $response = $this->actingAs($admin)->post(
            route('admin.lms.courses.modules.lessons.store', [$course, $module]),
            [
                'title' => 'Lecon multimedia',
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

        $lesson = Lesson::query()->where('title', 'Lecon multimedia')->with('files')->firstOrFail();
        $this->assertCount(2, $lesson->files);
        $this->assertSame('/lessons/data/cours.pdf', $lesson->file_path);
        $this->assertFileExists(public_path(ltrim($lesson->file_path, '/')));
        $this->assertSame($lesson->files->sortBy('position')->first()->file_path, $lesson->file_path);
        $this->assertSame('/lessons/data/cours.pdf', $lesson->files[0]->file_path);
        $this->assertSame('/lessons/data/video.mp4', $lesson->files[1]->file_path);
        $lesson->files->each(
            fn ($file) => $this->assertFileExists(public_path(ltrim($file->file_path, '/')))
        );
    }

    public function test_an_administrator_can_add_and_delete_an_individual_lesson_file(): void
    {
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
        $lessonType = LessonType::create(['name' => 'Multimedia']);
        $lesson = Lesson::create([
            'module_id' => $module->id,
            'lesson_type_id' => $lessonType->id,
            'title' => 'Lecon a modifier',
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

        $lesson->refresh();
        $lessonFile = LessonFile::query()->where('lesson_id', $lesson->id)->firstOrFail();
        $this->assertSame('/lessons/data/support.pdf', $lessonFile->file_path);
        $this->assertFileExists(public_path(ltrim($lessonFile->file_path, '/')));
        $this->assertSame($lessonFile->file_path, $lesson->file_path);

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

        $lesson->refresh();
        $this->assertNull($lesson->file_path);
        $this->assertDatabaseMissing('lesson_files', ['id' => $lessonFile->id]);
        $this->assertFileDoesNotExist(public_path('lessons/data/support.pdf'));
    }
}