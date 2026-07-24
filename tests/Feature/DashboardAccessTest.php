<?php

namespace Tests\Feature;

use App\Models\Course;
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

    public function test_a_professor_sees_students_in_their_courses_and_cannot_manage_users(): void
    {
        $active = Status::factory()->create(['name' => 'actif']);
        $professorType = UserType::factory()->create(['name' => 'professeur']);
        $studentType = UserType::factory()->create(['name' => 'etudiant']);
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
        $course->users()->attach([$professor->id, $student->id]);

        $this->actingAs($professor)
            ->get(route('professeur.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Professeur/Dashboard')
                ->has('courses', 1)
                ->has('courses.0.users', 1)
                ->where('courses.0.users.0.id', $student->id)
                ->where('studentCount', 1));

        $this->actingAs($professor)
            ->get(route('admin.users.index'))
            ->assertForbidden();
    }
}
