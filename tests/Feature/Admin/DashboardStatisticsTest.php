<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardStatisticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_administrator_sees_enriched_dashboard_statistics_and_charts(): void
    {
        $active = Status::factory()->create(['name' => 'actif']);
        $inactive = Status::factory()->create(['name' => 'inactif']);

        $adminType = UserType::factory()->create(['name' => 'admin']);
        $professorType = UserType::factory()->create(['name' => 'professeur']);
        $studentType = UserType::factory()->create(['name' => 'etudiant']);

        $admin = User::factory()->create([
            'id_1' => $adminType->id,
            'id_2' => $active->id,
            'must_change_password' => false,
            'email_verified_at' => now(),
            'created_at' => now()->subDays(3),
        ]);

        $assignedProfessor = User::factory()->create([
            'id_1' => $professorType->id,
            'id_2' => $active->id,
            'must_change_password' => false,
            'created_at' => now()->subDays(20),
        ]);

        $unassignedProfessor = User::factory()->create([
            'id_1' => $professorType->id,
            'id_2' => $inactive->id,
            'must_change_password' => false,
            'created_at' => now()->subMonths(2),
        ]);

        $assignedStudent = User::factory()->create([
            'id_1' => $studentType->id,
            'id_2' => $active->id,
            'must_change_password' => false,
            'created_at' => now()->subDays(10),
        ]);

        $unassignedStudent = User::factory()->create([
            'id_1' => $studentType->id,
            'id_2' => $inactive->id,
            'must_change_password' => false,
            'created_at' => now()->subMonths(3),
        ]);

        $courseWithUsers = Course::create(['name' => 'Francais']);
        Course::create(['name' => 'Anglais']);

        $courseWithUsers->users()->attach([$assignedProfessor->id, $assignedStudent->id]);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('stats.totalUsers', 5)
                ->where('stats.totalCourses', 2)
                ->where('stats.activeUsers', 3)
                ->where('stats.newUsers', 3)
                ->where('stats.totalProfessors', 2)
                ->where('stats.totalStudents', 2)
                ->where('stats.activationRate', 60)
                ->where('highlights.emptyCoursesCount', 1)
                ->where('highlights.unassignedProfessorsCount', 1)
                ->where('highlights.unassignedStudentsCount', 1)
                ->has('charts.registrationsByMonth', 6)
                ->where('charts.usersByRole.0.value', 1)
                ->where('charts.usersByRole.1.value', 2)
                ->where('charts.usersByRole.2.value', 2)
                ->where('charts.topCourses.0.label', 'Francais')
                ->where('charts.topCourses.0.value', 2)
                ->where('charts.usersByStatus.0.label', 'actif')
                ->where('charts.usersByStatus.0.value', 3)
                ->has('recentUsers', 5));
    }
}