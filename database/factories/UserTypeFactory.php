<?php

namespace Database\Factories;

use App\Models\UserType;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<UserType> */
class UserTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'étudiant',
            'description' => 'Utilisateur étudiant',
        ];
    }
}
