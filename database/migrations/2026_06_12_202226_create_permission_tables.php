<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->text('description')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->string('updated_at', 50)->nullable();
        });

        Schema::create('user_permissions', function (Blueprint $table) {
            $table->foreignId('users_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('permissions_id')->constrained('permissions')->cascadeOnDelete();
            $table->primary(['users_id', 'permissions_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_permissions');
        Schema::dropIfExists('permissions');
    }
};
