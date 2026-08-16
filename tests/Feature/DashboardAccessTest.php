<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonType;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_student_only_sees_their_own_courses_and_cannot_manage_users(): void
    {
        $active = Status::factory()->create(['name' => 'actif']);
        $studentType = UserType::factory()->create(['name' => 'etudiant']);
        $student = User::factory()->create([
            'id_1' => $studentType->id,
            'id_2' => $active->id,
            'must_change_password' => false,
        ]);
        $assignedCourse = Course::create(['name' => 'Français']);
        Course::create(['name' => 'Anglais']);
        $student->courses()->attach($assignedCourse);

        $this->actingAs($student)
            ->get(route('etudiant.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Etudiant/Dashboard')
                ->has('courses', 1)
                ->where('courses.0.name', 'Français'));

        $this->actingAs($student)
            ->get(route('admin.users.index'))
            ->assertForbidden();
    }

    public function test_a_professor_sees_their_dashboard_summary_and_cannot_manage_users(): void
    {
        $active = Status::factory()->create(['name' => 'actif']);
        $professorType = UserType::factory()->create(['name' => 'professeur']);
        $studentType = UserType::factory()->create(['name' => 'etudiant']);
        $lessonType = LessonType::create(['name' => 'PDF']);
        $professor = User::factory()->create([
            'id_1' => $professorType->id,
            'id_2' => $active->id,
            'must_change_password' => false,
        ]);
        $student = User::factory()->create([
            'id_1' => $studentType->id,
            'id_2' => $active->id,
            'must_change_password' => false,
        ]);
        $course = Course::create(['name' => 'Anglais']);
        $module = CourseModule::create([
            'course_id' => $course->id,
            'title' => 'Base',
            'position' => 1,
        ]);
        Lesson::create([
            'module_id' => $module->id,
            'lesson_type_id' => $lessonType->id,
            'title' => 'Introduction',
            'position' => 1,
            'is_published' => true,
        ]);
        $course->users()->attach([$professor->id, $student->id]);

        $this->actingAs($professor)
            ->get(route('professeur.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Professeur/Dashboard')
                ->has('courses', 1)
                ->has('courses.0.students', 1)
                ->where('courses.0.students.0.id', $student->id)
                ->where('stats.totalStudents', 1)
                ->where('stats.averageProgress', 0)
                ->where('charts.courseProgressOverview.0.label', 'Anglais')
                ->where('charts.courseProgressOverview.0.value', 0));

        $this->actingAs($professor)
            ->get(route('admin.users.index'))
            ->assertForbidden();
    }

    public function test_a_professor_can_open_the_dedicated_courses_section(): void
    {
        $active = Status::factory()->create(['name' => 'actif']);
        $professorType = UserType::factory()->create(['name' => 'professeur']);
        $professor = User::factory()->create([
            'id_1' => $professorType->id,
            'id_2' => $active->id,
            'must_change_password' => false,
        ]);
        $course = Course::create(['name' => 'Français']);
        $course->users()->attach($professor->id);

        $this->actingAs($professor)
            ->get(route('professeur.courses.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Professeur/Courses/Index')
                ->has('courses', 1)
                ->where('courses.0.name', 'Français'));
    }
}