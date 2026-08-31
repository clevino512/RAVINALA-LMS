<?php

namespace Database\Factories;

use App\Models\Status;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Status> */
class StatusFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'actif',
            'created_at' => now()->toDateTimeString(),
        ];
    }
}
