<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create(['must_change_password' => false]);

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create(['must_change_password' => false]);

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'first_name' => 'Test',
                'last_name' => 'User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create(['must_change_password' => false]);

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'first_name' => 'Test',
                'last_name' => 'User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_profile_information_and_password_can_be_updated_together(): void
    {
        $user = User::factory()->create(['must_change_password' => true]);

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'first_name' => 'Ravo',
                'last_name' => 'Tiana',
                'email' => 'ravotina3@gmail.com',
                'phone_number' => '13211315656',
                'date_of_birth' => '2000-01-01',
                'current_password' => 'password',
                'password' => 'nouveau-password',
                'password_confirmation' => 'nouveau-password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success')
            ->assertRedirect(route('dashboard'));

        $user->refresh();

        $this->assertSame('Ravo Tiana', $user->name);
        $this->assertSame('13211315656', $user->phone_number);
        $this->assertTrue(Hash::check('nouveau-password', $user->password));
        $this->assertFalse($user->must_change_password);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }
}
