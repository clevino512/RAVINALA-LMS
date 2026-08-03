<?php

namespace Tests\Feature\Professeur;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\LessonType;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_professor_can_create_a_lesson_in_an_assigned_course(): void
    {
        [$professor, $course, $module, $lessonType] = $this->makeProfessorContext(true);

        $this->actingAs($professor)
            ->post(route('professeur.courses.modules.lessons.store', [$course, $module]), [
                'title' => 'Accords avancés',
                'description' => 'Règles et exercices.',
                'duration' => 18,
                'position' => 1,
                'is_published' => true,
                'lesson_type_id' => $lessonType->id,
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Accords avancés');

        $this->assertDatabaseHas('lessons', [
            'module_id' => $module->id,
            'title' => 'Accords avancés',
        ]);
    }

    public function test_a_professor_cannot_create_a_lesson_in_an_unassigned_course(): void
    {
        [$professor, $course, $module, $lessonType] = $this->makeProfessorContext(false);

        $this->actingAs($professor)
            ->post(route('professeur.courses.modules.lessons.store', [$course, $module]), [
                'title' => 'Leçon interdite',
                'position' => 1,
                'lesson_type_id' => $lessonType->id,
            ])
            ->assertNotFound();

        $this->assertDatabaseMissing('lessons', [
            'module_id' => $module->id,
            'title' => 'Leçon interdite',
        ]);
    }

    private function makeProfessorContext(bool $assignCourse): array
    {
        $status = Status::factory()->create(['name' => 'actif']);
        $professorType = UserType::factory()->create(['name' => 'professeur']);
        $professor = User::factory()->create([
            'id_1' => $professorType->id,
            'id_2' => $status->id,
            'must_change_password' => false,
        ]);

        $course = Course::create(['name' => 'Français']);
        $module = CourseModule::create([
            'course_id' => $course->id,
            'title' => 'Base',
            'position' => 1,
        ]);
        $lessonType = LessonType::create(['name' => 'PDF']);

        if ($assignCourse) {
            $course->users()->attach($professor->id);
        }

        return [$professor, $course, $module, $lessonType];
    }
}