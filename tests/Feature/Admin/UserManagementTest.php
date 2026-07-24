<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_administrator_can_create_a_user_with_courses(): void
    {
        $active = Status::factory()->create(['name' => 'actif']);
        $adminType = UserType::factory()->create(['name' => 'admin']);
        $studentType = UserType::factory()->create(['name' => 'etudiant']);
        $course = Course::create(['name' => 'Français', 'description' => 'Cours de français']);
        $admin = User::factory()->create([
            'id_1' => $adminType->id,
            'id_2' => $active->id,
            'must_change_password' => false,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'first_name' => 'Jean',
            'last_name' => 'Rabe',
            'email' => 'jean@example.com',
            'date_of_birth' => '2000-01-15',
            'phone_number' => '0340000000',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'id_1' => $studentType->id,
            'id_2' => $active->id,
            'course_ids' => [$course->id],
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.users.index'));

        $user = User::where('email', 'jean@example.com')->firstOrFail();

        $this->assertSame('Jean Rabe', $user->name);
        $this->assertSame('2000-01-15', $user->toArray()['date_of_birth']);
        $this->assertSame($studentType->id, $user->id_1);
        $this->assertSame($active->id, $user->id_2);
        $this->assertTrue($user->must_change_password);
        $this->assertTrue($user->courses->contains($course));
    }

    public function test_all_courses_are_automatically_assigned_to_an_administrator(): void
    {
        $active = Status::factory()->create(['name' => 'actif']);
        $adminType = UserType::factory()->create(['name' => 'admin']);
        $french = Course::create(['name' => 'Français']);
        $english = Course::create(['name' => 'Anglais']);
        $currentAdmin = User::factory()->create([
            'id_1' => $adminType->id,
            'id_2' => $active->id,
            'must_change_password' => false,
        ]);

        $response = $this->actingAs($currentAdmin)->post(route('admin.users.store'), [
            'first_name' => 'Nouvel',
            'last_name' => 'Admin',
            'email' => 'nouvel.admin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'id_1' => $adminType->id,
            'id_2' => $active->id,
            'course_ids' => [$french->id],
        ]);

        $response->assertSessionHasNoErrors();

        $createdAdmin = User::where('email', 'nouvel.admin@example.com')->firstOrFail();

        $this->assertEqualsCanonicalizing(
            [$french->id, $english->id],
            $createdAdmin->courses->pluck('id')->all(),
        );
        $this->assertFalse($createdAdmin->must_change_password);
    }

    public function test_a_student_must_change_the_initial_password_before_accessing_the_dashboard(): void
    {
        $active = Status::factory()->create(['name' => 'actif']);
        $studentType = UserType::factory()->create(['name' => 'etudiant']);
        $student = User::factory()->create([
            'id_1' => $studentType->id,
            'id_2' => $active->id,
            'must_change_password' => true,
        ]);

        $this->actingAs($student)
            ->get(route('dashboard'))
            ->assertRedirect(route('profile.edit'));

        $this->actingAs($student)
            ->put(route('password.update'), [
                'current_password' => 'password',
                'password' => 'nouveau-password',
                'password_confirmation' => 'nouveau-password',
            ])
            ->assertSessionHasNoErrors();

        $this->assertFalse($student->fresh()->must_change_password);

        $this->actingAs($student)
            ->get(route('dashboard'))
            ->assertRedirect(route('etudiant.dashboard'));
    }
}
