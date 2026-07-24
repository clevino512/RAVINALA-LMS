<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Product;
use App\Models\Status;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $activeStatus = Status::firstOrCreate(
            ['name' => 'actif'],
            ['created_at' => now()->toDateTimeString()]
        );

        Status::firstOrCreate(
            ['name' => 'inactif'],
            ['created_at' => now()->toDateTimeString()]
        );

        $adminType = UserType::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Administrateur de la plateforme']
        );

        UserType::firstOrCreate(
            ['name' => 'etudiant'],
            ['description' => 'Utilisateur etudiant']
        );

        UserType::firstOrCreate(
            ['name' => 'professeur'],
            ['description' => 'Utilisateur professeur']
        );

        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrateur Ravinala',
                'first_name' => 'Administrateur',
                'last_name' => 'Ravinala',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'must_change_password' => false,
                'id_type' => $adminType->id,
                'id_status' => $activeStatus->id,
            ]
        );

        $admin->syncRoles([$adminRole]);

        Product::factory()->count(6)->create();
        Client::factory()->count(6)->create();
    }
}
