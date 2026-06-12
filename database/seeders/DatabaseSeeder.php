<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;


class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        User::factory()->create([
            'name' => 'Administrateur',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Création de 6 produits
        Product::factory()->count(6)->create();

        // Création de 6 clients
        Client::factory()->count(6)->create();
    }
}
